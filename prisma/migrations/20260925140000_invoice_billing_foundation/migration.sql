-- Production compatibility: the Aslal database predates the Q1 invoice foundation in some environments.
-- Ensure the existing parent tables use InnoDB before adding foreign keys. This preserves
-- existing rows and keeps the Q1 customer/order -> invoice integrity constraints enforceable.
ALTER TABLE customers ENGINE=InnoDB;
ALTER TABLE orders ENGINE=InnoDB;

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
  CONSTRAINT fk_invoices_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  CONSTRAINT fk_invoices_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
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
