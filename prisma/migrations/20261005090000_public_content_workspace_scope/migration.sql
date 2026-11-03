-- P0: make website content a first-class workspace-scoped resource.
-- Existing global content is assigned to the protected Aslal corporate workspace.
ALTER TABLE public_content
  ADD COLUMN workspace_id CHAR(36) NULL AFTER id;

UPDATE public_content
SET workspace_id = '00000000-0000-0000-0000-000000000001'
WHERE workspace_id IS NULL;

ALTER TABLE public_content
  MODIFY COLUMN workspace_id CHAR(36) NOT NULL,
  DROP INDEX uq_public_content_page_key,
  ADD UNIQUE KEY uq_public_content_workspace_page_key (workspace_id,page_path,content_key),
  ADD KEY idx_public_content_workspace_page (workspace_id,page_path,active),
  ADD CONSTRAINT fk_public_content_workspace
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
    ON DELETE RESTRICT ON UPDATE CASCADE;