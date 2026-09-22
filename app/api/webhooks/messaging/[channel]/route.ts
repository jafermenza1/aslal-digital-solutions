import { NextRequest, NextResponse } from "next/server";
import { processInboundMessagingWebhook } from "@/lib/messaging-webhook";

type Params = { params: Promise<{ channel: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const raw = await request.text();
  const { channel } = await params;
  try {
    const result = await processInboundMessagingWebhook(channel, raw, request.headers.get("x-webhook-signature"));
    return NextResponse.json(result);
  } catch (error) {
    const status = error && typeof error === "object" && "status" in error ? Number(error.status) : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Webhook processing failed" }, { status });
  }
}
