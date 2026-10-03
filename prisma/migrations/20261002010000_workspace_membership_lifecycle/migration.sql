CREATE TABLE workspace_membership_history (
  id CHAR(36) NOT NULL,
  workspace_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  membership_id CHAR(36) NOT NULL,
  action VARCHAR(40) NOT NULL,
  from_role ENUM('OWNER','ADMIN','MANAGER','SALES','FINANCE','AUDITOR','CLIENT','PARTNER','MEMBER') NULL,
  to_role ENUM('OWNER','ADMIN','MANAGER','SALES','FINANCE','AUDITOR','CLIENT','PARTNER','MEMBER') NULL,
  from_status ENUM('ACTIVE','SUSPENDED','REMOVED') NULL,
  to_status ENUM('ACTIVE','SUSPENDED','REMOVED') NULL,
  reason TEXT NOT NULL,
  actor_id CHAR(36) NOT NULL,
  created_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_workspace_membership_history (workspace_id,user_id,created_at),
  CONSTRAINT fk_wmh_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE RESTRICT,
  CONSTRAINT fk_wmh_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_wmh_membership FOREIGN KEY (membership_id) REFERENCES workspace_users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE workspace_users
  ADD COLUMN status ENUM('ACTIVE','SUSPENDED','REMOVED') NOT NULL DEFAULT 'ACTIVE' AFTER role,
  ADD COLUMN suspended_at DATETIME(0) NULL AFTER status,
  ADD COLUMN removed_at DATETIME(0) NULL AFTER suspended_at;
