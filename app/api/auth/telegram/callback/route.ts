import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signSession } from "@/lib/security";
import { syncTelegramIdentity, validateTelegramLoginData } from "@/lib/telegram-identity";

export const dynamic = "force-dynamic";

function clean(v: string | null, max = 190) {
  return (v || "").trim().slice(0, max);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  try {
    const auth = validateTelegramLoginData(url.searchParams);
    let workspaceId = clean(url.searchParams.get("workspaceId"), 36);

    const user = await prisma.user.findFirst({
      where: { telegramChatId: auth.user.id, active: true },
      include: { workspaceUsers: { select: { workspaceId: true }, take: 1 } },
    });

    if (!workspaceId) workspaceId = user?.workspaceUsers[0]?.workspaceId || clean(process.env.TELEGRAM_DEFAULT_WORKSPACE_ID || "", 36);
    if (!workspaceId) throw new Error("A workspace is required for Telegram identity linking.");

    await syncTelegramIdentity({
      workspaceId,
      user: auth.user,
      chatId: auth.user.id,
      auth: true,
      event: "WEB_LOGIN",
    });

    const target = clean(url.searchParams.get("next"), 500) || "/dashboard";
    const safeTarget = target.startsWith("/") && !target.startsWith("//") ? target : "/dashboard";
    const response = NextResponse.redirect(new URL(user ? safeTarget : "/telegram/catalog?telegram=identified", url.origin));

    if (user) {
      await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date(), telegramUsername: auth.user.username || null } });
      response.cookies.set("aslal_session", signSession(user.email), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 20 * 60,
        path: "/",
      });
    }

    return response;
  } catch (error) {
    const response = NextResponse.redirect(new URL("/login?telegram=failed", url.origin));
    response.headers.set("Cache-Control", "no-store");
    if (error instanceof Error) console.error("TELEGRAM_WEB_LOGIN_ERROR", error.message);
    return response;
  }
}
