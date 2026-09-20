import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/security";

export async function GET(request: Request) {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const customerId = new URL(request.url).searchParams.get("customerId");
  if (!customerId) return NextResponse.json({ error: "customerId is required" }, { status: 400 });

  const [customer, activities] = await Promise.all([
    prisma.customer.findUnique({
      where: { id: customerId },
      include: { person: true, opportunity: true }
    }),
    prisma.activity.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      take: 100
    })
  ]);

  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  return NextResponse.json({ customer, activities });
}
