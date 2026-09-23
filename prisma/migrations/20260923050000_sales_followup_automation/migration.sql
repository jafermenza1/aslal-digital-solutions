-- Phase 5: Sales Follow-up Automation
CREATE TABLE workflows (
  id CHAR(36) NOT NULL,
  system_key VARCHAR(100) NOT NULL,
  name VARCHAR(190) NOT NULL,
  description TEXT NULL,
  owner_email VARCHAR(190) NULL,
  trigger_type ENUM('LEAD_CREATED','LEAD_OVERDUE','LEAD_STATUS_CHANGED','CONVERSATION_INBOUND','OPT_OUT') NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_workflows_system_key (system_key),
  KEY idx_workflows_trigger_active (trigger_type, active)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE workflow_versions (
  id CHAR(36) NOT NULL,
  workflow_id CHAR(36) NOT NULL,
  version_no INT NOT NULL,
  definition JSON NOT NULL,
  created_by VARCHAR(190) NULL,
  created_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_workflow_version (workflow_id, version_no),
  KEY idx_workflow_versions_workflow_created (workflow_id, created_at),
  CONSTRAINT fk_workflow_versions_workflow
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE workflow_executions (
  id CHAR(36) NOT NULL,
  workflow_id CHAR(36) NOT NULL,
  workflow_version_id CHAR(36) NOT NULL,
  trigger_type ENUM('LEAD_CREATED','LEAD_OVERDUE','LEAD_STATUS_CHANGED','CONVERSATION_INBOUND','OPT_OUT') NOT NULL,
  idempotency_key VARCHAR(255) NOT NULL,
  target_type VARCHAR(40) NOT NULL,
  target_id CHAR(36) NOT NULL,
  status ENUM('PENDING','RUNNING','COMPLETED','FAILED','CANCELLED','SKIPPED') NOT NULL DEFAULT 'PENDING',
  payload JSON NULL,
  result JSON NULL,
  attempts INT NOT NULL DEFAULT 0,
  last_error TEXT NULL,
  started_at DATETIME(0) NULL,
  completed_at DATETIME(0) NULL,
  created_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_workflow_execution_idempotency (idempotency_key),
  KEY idx_workflow_executions_status_created (status, created_at),
  KEY idx_workflow_executions_target_created (target_type, target_id, created_at),
  KEY idx_workflow_executions_workflow_created (workflow_id, created_at),
  CONSTRAINT fk_workflow_executions_workflow
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE,
  CONSTRAINT fk_workflow_executions_version
    FOREIGN KEY (workflow_version_id) REFERENCES workflow_versions(id) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE workflow_action_executions (
  id CHAR(36) NOT NULL,
  execution_id CHAR(36) NOT NULL,
  action_index INT NOT NULL,
  action_type ENUM('CREATE_TASK','CREATE_ACTIVITY') NOT NULL,
  status ENUM('PENDING','RUNNING','COMPLETED','FAILED','SKIPPED') NOT NULL DEFAULT 'PENDING',
  scheduled_for DATETIME(0) NULL,
  started_at DATETIME(0) NULL,
  completed_at DATETIME(0) NULL,
  attempts INT NOT NULL DEFAULT 0,
  error TEXT NULL,
  result JSON NULL,
  created_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_workflow_action_execution (execution_id, action_index),
  KEY idx_workflow_action_execution_status (execution_id, status),
  KEY idx_workflow_action_execution_scheduled (scheduled_for, status),
  CONSTRAINT fk_workflow_action_executions_execution
    FOREIGN KEY (execution_id) REFERENCES workflow_executions(id) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
