-- Production compatibility: the Aslal database predates the Q1 invoice foundation in some environments.
-- Keep the existing production parent tables untouched.
-- MariaDB 10.11 on Emerald rejects a new FK from this legacy customers table even though
-- its id is CHAR(36), PRIMARY KEY, InnoDB, utf8mb4_unicode_ci and is already referenced
-- successfully by orders. Do not rebuild/drop customers or orders to work around that.
-- customer_id/order_id remain indexed relational references and are validated by the
-- invoice API against the same workspace-owned order/customer records before insertion.
-- This preserves the business integrity purpose without a destructive parent-table rebuild.

CREATE TABLE invoices (
  id CHAR(36) NOT NULL,
  invoice_number VARCHAR(60) NOT NULL,
  customer_id CHAR(36) NULL,
  order_id CHAR(36) NULL,
  status ENUM('DRAFT','ISSUED','PARTIALLY_PAID','PAID','OVERDUE','VOID') NOT NULL DEFAULT 'DRAFT',
  currency VARCHAR(10) NOT NULL DEFAULT 'ETB',
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  total DECIMAL(15,2) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(15,2) NOT NULL DEFAULT 0,
  balance_due DECIMAL(15,2) NOT NULL DEFAULT 0,
  issued_at DATETIME(0) NULL,
  due_at DATETIME(0) NULL,
  paid_at DATETIME(0) NULL,
  voided_at DATETIME(0) NULL,
  notes TEXT NULL,
  created_by VARCHAR(190) NULL,
  created_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_invoices_number (invoice_number),
  KEY idx_invoices_customer_status (customer_id,status,created_at),
  KEY idx_invoices_order (order_id),
  KEY idx_invoices_status_due (status,due_at),
  -- Referential integrity for customer_id/order_id is enforced by the workspace-scoped
  -- invoice API before creation; MariaDB production compatibility requires these to remain
  -- indexed IDs rather than physical foreign keys on the legacy parent tables.
) ENGINE=InnoDB;

CREATE TABLE invoice_items (
  id CHAR(36) NOT NULL,
  invoice_id CHAR(36) NOT NULL,
  description VARCHAR(500) NOT NULL,
  quantity DECIMAL(15,3) NOT NULL DEFAULT 1,
  unit_price DECIMAL(15,2) NOT NULL DEFAULT 0,
  amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_invoice_items_invoice_sort (invoice_id,sort_order),
  CONSTRAINT fk_invoice_items_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE invoice_payments (
  id CHAR(36) NOT NULL,
  invoice_id CHAR(36) NOT NULL,
  payment_id CHAR(36) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  allocated_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  allocated_by VARCHAR(190) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_invoice_payment (invoice_id,payment_id),
  KEY idx_invoice_payment_payment (payment_id),
  CONSTRAINT fk_invoice_payment_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  CONSTRAINT fk_invoice_payment_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE RESTRICT
) ENGINE=InnoDB;
