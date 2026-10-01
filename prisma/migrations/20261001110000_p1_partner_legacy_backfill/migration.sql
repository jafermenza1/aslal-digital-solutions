-- P1-R legacy partner backfill.
-- Existing verified/active partners retain access under the new explicit state model.
UPDATE partners
SET account_status = CASE WHEN status='ACTIVE' AND verification_status='VERIFIED' THEN 'ACTIVE' ELSE 'REGISTERED' END,
    verification_level = CASE WHEN verification_status='VERIFIED' THEN 'VERIFIED' ELSE 'BASIC' END,
    email_verified_at = CASE WHEN status='ACTIVE' AND verification_status='VERIFIED' AND email IS NOT NULL THEN COALESCE(email_verified_at, created_at) ELSE email_verified_at END,
    onboarding_status = CASE WHEN status='ACTIVE' AND verification_status='VERIFIED' THEN 'COMPLETE' ELSE 'NOT_STARTED' END,
    onboarding_step = CASE WHEN status='ACTIVE' AND verification_status='VERIFIED' THEN 'COMPLETE' ELSE 'PROFILE' END
WHERE account_status='REGISTERED' AND verification_level='BASIC';

-- Preserve restricted legacy records explicitly.
UPDATE partners
SET account_status='SUSPENDED'
WHERE verification_status='SUSPENDED' AND account_status='REGISTERED';
