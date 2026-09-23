import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdminEmail, verifySession } from "@/lib/security";
import { ensureCoreWorkflows, getAutomationSnapshot } from "@/lib/automation";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session || !isAdminEmail(session.email)) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  try {
    await ensureCoreWorkflows();
    const snapshot = await getAutomationSnapshot(20);
    const active = snapshot.workflows.filter((workflow) => workflow.active).length;

    return NextResponse.json({
      phase: 5,
      scope: "internal-only sales follow-up automation",
      readyForControlledAcceptance:
        active >= 2 &&
        snapshot.executions.completed > 0 &&
        snapshot.executions.failedRecent === 0,
      automatedCustomerMessaging: false,
      workflows: snapshot.workflows,
      executions: snapshot.executions,
      gate: {
        minimumCoreWorkflows: active >= 2,
        hasCompletedExecution: snapshot.executions.completed > 0,
        noRecentFailures: snapshot.executions.failedRecent === 0,
        customerMessageAutomationStillDisabled: true,
      },
    });
  } catch (error) {
    console.error("PHASE_5_ACCEPTANCE_ERROR", error);
    return NextResponse.json(
      {
        phase: 5,
        readyForControlledAcceptance: false,
        error: error instanceof Error ? error.message : "Acceptance check failed",
      },
      { status: 500 },
    );
  }
}
