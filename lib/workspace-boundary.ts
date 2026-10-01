export class WorkspaceBoundaryError extends Error {
  readonly status = 403;
  constructor(message = "Workspace boundary violation.") {
    super(message);
    this.name = "WorkspaceBoundaryError";
  }
}

/**
 * Require that the requested workspace is the currently authorized workspace.
 * Route handlers should authorize membership first, then use this for every
 * workspace-owned record/reference involved in a mutation.
 */
export function requireWorkspaceAccess(currentWorkspaceId: string, requestedWorkspaceId: string | null | undefined): string {
  if (!currentWorkspaceId || !requestedWorkspaceId || currentWorkspaceId !== requestedWorkspaceId) {
    throw new WorkspaceBoundaryError("Workspace access denied.");
  }
  return currentWorkspaceId;
}

/**
 * Require a workspace-owned record to belong to the active workspace.
 * Returning the record keeps the check useful in both read and mutation paths.
 */
export function requireWorkspaceRecord<T extends { workspaceId?: string | null }>(
  record: T | null | undefined,
  currentWorkspaceId: string,
): T {
  if (!record || record.workspaceId !== currentWorkspaceId) {
    throw new WorkspaceBoundaryError("Record is outside the active workspace.");
  }
  return record;
}

/**
 * Require every referenced workspace-owned record to belong to the same workspace.
 * Use this before creating or mutating commercial records with cross-record references.
 */
export function requireSameWorkspace(
  currentWorkspaceId: string,
  ...workspaceIds: Array<string | null | undefined>
): string {
  if (!currentWorkspaceId || workspaceIds.some((workspaceId) => workspaceId !== currentWorkspaceId)) {
    throw new WorkspaceBoundaryError("Referenced record belongs to a different workspace.");
  }
  return currentWorkspaceId;
}

/**
 * Partner attribution crosses partner home workspaces safely. The commercial
 * boundary is the referral/program workspace; a partner's home workspace is
 * identity metadata and must never block a valid cross-business attribution.
 */
export function requirePartnerAttributionWorkspace(
  currentWorkspaceId: string,
  referralWorkspaceId: string | null | undefined,
  _partnerHomeWorkspaceId?: string | null,
): string {
  return requireWorkspaceAccess(currentWorkspaceId, referralWorkspaceId);
}
