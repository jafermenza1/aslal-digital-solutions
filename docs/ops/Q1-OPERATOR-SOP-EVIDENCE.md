# Q1 Operator SOP and Evidence Pack

**Status:** IMPLEMENTED FOUNDATION — OPERATIONAL EXECUTION PENDING  
**Date:** 2026-09-26

This document defines the minimum controlled procedures for Q1 operations. Each procedure names the system control, authorized actor, evidence to retain, and recovery path. These procedures do not replace server-side authorization or transaction controls.

## 1. Disputed attribution

**Trigger:** Two partners claim the same lead/order attribution.

**Procedure**
1. Freeze ordinary attribution edits.
2. Collect lead ID, workspace ID, referral code, click timestamps, partner IDs and existing commission/revenue references.
3. Open the workspace-scoped dispute workflow.
4. Record the competing claims and supporting evidence.
5. Resolve only through the authorized dispute action.
6. Verify before/after partner attribution and linked commission/revenue records.
7. Retain the dispute decision and audit/activity evidence.

**Control:** locked attribution, partner-management authorization, explicit override reason, workspace-scoped dispute reassignment and transactional financial reassignment.

**Actor:** authorized partner-management/dispute operator.

**Evidence:** request, lead/referral IDs, before/after attribution, reason, actor, timestamps, commission/revenue before/after state.

**Recovery:** if the transaction fails, verify attribution, commission and revenue remain unchanged; retry only after correcting the failed condition.

## 2. Cancelled or refunded orders

**Trigger:** confirmed/reconciled commercial order is cancelled, reversed or refunded.

**Procedure**
1. Identify order, payment and existing revenue/commission records.
2. Verify the cancellation/refund authority and supporting evidence.
3. Apply the controlled payment/reversal path; never delete historical payment records.
4. Verify recognized revenue is reversed and the linked commission is voided/reversed according to the financial workflow.
5. Retain the original and resulting states.

**Control:** payment lifecycle, reconciliation state, revenue reversal and commission lifecycle.

**Actor:** authorized Finance operator.

**Evidence:** order ID, payment ID, provider reference/evidence, reversal/refund reason, actor, timestamp, revenue state and commission state.

**Recovery:** if any downstream transaction fails, confirm the database transaction left the financial chain unchanged before retrying.

## 3. Merchant invoice issuance, allocation and collection

**Trigger:** an order reaches the stage where merchant billing is required.

**Procedure**
1. Verify workspace, customer, order and billable amount.
2. Create/issue the invoice through the existing invoice workflow.
3. Preserve invoice status and amount; do not mark an invoice paid from an unverified payment.
4. Apply collected payment only after Finance verification/reconciliation.
5. Reconcile invoice/payment/order references before recognizing financial outcomes.

**Control:** workspace-scoped invoice/order/payment relationships and Finance reconciliation.

**Actor:** authorized Finance/operator role.

**Evidence:** invoice ID, order ID, customer ID, amount/currency, issue status, payment reference, reconciliation evidence and actor/timestamp.

**Recovery:** if invoice/payment linkage is inconsistent, place the item in exception handling and correct the linkage before financial recognition.

## 4. Payout batch preparation and external money movement

**Trigger:** commissions become payable after the controlled qualification/approval path.

**Procedure**
1. Select payable commissions within one authorized workspace.
2. Verify each commission is based on collected/reconciled revenue and has required approval.
3. Prepare a batch manifest containing payout item IDs, partner IDs, amounts and currency.
4. Independently verify totals against the ledger.
5. Execute external money movement using the approved provider process; the platform record must not imply external settlement merely because a batch was prepared.
6. Record provider/batch reference and settlement evidence.
7. Reconcile exceptions individually.

**Control:** commission qualification/approval, payout ledger, workspace isolation and explicit external-settlement evidence.

**Actor:** authorized Finance/payout operator.

**Evidence:** batch manifest, item IDs, total, approval evidence, external provider reference, settlement evidence, operator and timestamps.

**Recovery:** never silently re-run an externally submitted batch. Investigate provider status and reconcile using the recorded batch/provider reference.

**Known implementation gap:** the reconciliation docs still classify fully automated/manual bulk payout batch generation as PARTIAL. This SOP therefore defines the operating control without claiming that a batch-generation UI/API is complete.

## 5. Receipt verification and exception handling

**Trigger:** a payment receipt or manual bank/mobile-money proof is submitted.

**Procedure**
1. Capture provider, method, amount, transaction reference when available, evidence reference and verification notes.
2. Keep payment PENDING until Finance review.
3. Match the evidence and move the reconciliation state to MATCHED.
4. Confirm collection only from a matched payment.
5. Reconcile only confirmed payment with sufficient evidence.
6. Flag EXCEPTION when evidence is insufficient, conflicting or duplicated.
7. Resolve the exception with a documented reason before continuing.

**Control:** PENDING-first payment capture, Finance reconciliation workbench, workspace-scoped payment queue and confirmation/reconciliation transitions.

**Actor:** authorized Finance operator.

**Evidence:** payment ID, order ID, receipt/evidence reference, provider/method, amount, transaction reference, verification notes, exception reason, actor and timestamps.

**Recovery:** an exception remains non-reconciled until resolved; duplicate or overpayment conditions must not create additional recognized revenue.

## Evidence retention checklist

For every controlled run retain:

- workspace ID/name;
- actor identity and role;
- request/response or operator action;
- entity IDs;
- before/after state where applicable;
- timestamps;
- evidence/reference IDs;
- authorization result;
- exception/recovery result;
- database snapshot or query result sufficient to prove the state transition.

**Q1 rule:** code presence is not behavioral acceptance. The retained evidence pack is required before Q1 can be accepted.
