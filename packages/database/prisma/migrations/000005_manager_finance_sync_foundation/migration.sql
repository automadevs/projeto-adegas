CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  name text NOT NULL,
  scope text NOT NULL,
  CONSTRAINT roles_tenant_name_key UNIQUE (tenant_id, name)
);

CREATE INDEX roles_tenant_id_scope_idx ON roles (tenant_id, scope);

CREATE TABLE permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text NOT NULL
);

CREATE TABLE user_branches (
  user_id uuid NOT NULL REFERENCES users(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  role_id uuid NOT NULL REFERENCES roles(id),
  PRIMARY KEY (user_id, branch_id)
);

CREATE INDEX user_branches_role_id_idx ON user_branches (role_id);

CREATE TABLE product_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  product_id uuid NOT NULL REFERENCES products(id),
  name text NOT NULL,
  units_per_package numeric(12, 3) NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT product_packages_units_positive CHECK (units_per_package > 0),
  CONSTRAINT product_packages_tenant_product_name_key UNIQUE (tenant_id, product_id, name)
);

CREATE INDEX product_packages_tenant_id_product_id_active_idx
  ON product_packages (tenant_id, product_id, active);

CREATE TABLE sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  order_id uuid NOT NULL UNIQUE REFERENCES orders(id),
  sale_number integer NOT NULL,
  status text NOT NULL,
  gross_cents bigint NOT NULL,
  discount_cents bigint NOT NULL DEFAULT 0,
  net_cents bigint NOT NULL,
  cmv_cents bigint NOT NULL,
  gross_profit_cents bigint NOT NULL,
  sold_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sales_money_non_negative CHECK (
    gross_cents >= 0
    AND discount_cents >= 0
    AND net_cents >= 0
    AND cmv_cents >= 0
  ),
  CONSTRAINT sales_tenant_branch_sale_number_key UNIQUE (tenant_id, branch_id, sale_number)
);

CREATE INDEX sales_tenant_id_branch_id_status_idx ON sales (tenant_id, branch_id, status);
CREATE INDEX sales_tenant_id_branch_id_sold_at_idx ON sales (tenant_id, branch_id, sold_at);

CREATE TABLE payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  name text NOT NULL,
  type text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  CONSTRAINT payment_methods_tenant_name_key UNIQUE (tenant_id, name)
);

CREATE INDEX payment_methods_tenant_id_active_idx ON payment_methods (tenant_id, active);

CREATE TABLE card_terminals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  name text NOT NULL,
  provider text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  CONSTRAINT card_terminals_tenant_branch_name_key UNIQUE (tenant_id, branch_id, name)
);

CREATE INDEX card_terminals_tenant_id_branch_id_active_idx
  ON card_terminals (tenant_id, branch_id, active);

CREATE TABLE cash_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  opened_by uuid NOT NULL REFERENCES users(id),
  opened_at timestamptz NOT NULL DEFAULT now(),
  closed_by uuid REFERENCES users(id),
  closed_at timestamptz,
  opening_cents bigint NOT NULL DEFAULT 0,
  expected_cents bigint NOT NULL DEFAULT 0,
  counted_cents bigint,
  difference_cents bigint NOT NULL DEFAULT 0,
  status text NOT NULL,
  CONSTRAINT cash_sessions_money_non_negative CHECK (
    opening_cents >= 0
    AND expected_cents >= 0
    AND (counted_cents IS NULL OR counted_cents >= 0)
  )
);

CREATE INDEX cash_sessions_tenant_id_branch_id_status_idx
  ON cash_sessions (tenant_id, branch_id, status);
CREATE INDEX cash_sessions_tenant_id_branch_id_opened_at_idx
  ON cash_sessions (tenant_id, branch_id, opened_at);

CREATE TABLE cash_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  cash_session_id uuid NOT NULL REFERENCES cash_sessions(id),
  type text NOT NULL,
  amount_cents bigint NOT NULL,
  reason text NOT NULL,
  actor_id uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cash_movements_amount_non_zero CHECK (amount_cents <> 0)
);

CREATE INDEX cash_movements_tenant_id_branch_id_cash_session_id_idx
  ON cash_movements (tenant_id, branch_id, cash_session_id);

CREATE TABLE suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  name text NOT NULL,
  contact_name text,
  phone text,
  whatsapp text,
  email text,
  lead_time_days integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT suppliers_tenant_name_key UNIQUE (tenant_id, name),
  CONSTRAINT suppliers_lead_time_non_negative CHECK (lead_time_days >= 0)
);

CREATE INDEX suppliers_tenant_id_active_idx ON suppliers (tenant_id, active);

CREATE TABLE supplier_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  supplier_id uuid NOT NULL REFERENCES suppliers(id),
  product_id uuid NOT NULL REFERENCES products(id),
  supplier_code text,
  last_cost_cents bigint,
  last_purchase_at timestamptz,
  CONSTRAINT supplier_products_last_cost_non_negative CHECK (
    last_cost_cents IS NULL OR last_cost_cents >= 0
  ),
  CONSTRAINT supplier_products_tenant_supplier_product_key UNIQUE (
    tenant_id,
    supplier_id,
    product_id
  )
);

CREATE INDEX supplier_products_tenant_id_product_id_idx
  ON supplier_products (tenant_id, product_id);

CREATE TABLE stock_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  name text NOT NULL,
  type text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  CONSTRAINT stock_locations_tenant_branch_name_key UNIQUE (tenant_id, branch_id, name)
);

CREATE INDEX stock_locations_tenant_id_branch_id_active_idx
  ON stock_locations (tenant_id, branch_id, active);

CREATE TABLE stock_balances (
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  location_id uuid NOT NULL REFERENCES stock_locations(id),
  product_id uuid NOT NULL REFERENCES products(id),
  physical_quantity numeric(12, 3) NOT NULL DEFAULT 0,
  reserved_quantity numeric(12, 3) NOT NULL DEFAULT 0,
  version integer NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, branch_id, location_id, product_id),
  CONSTRAINT stock_balances_quantities_non_negative CHECK (
    physical_quantity >= 0
    AND reserved_quantity >= 0
  )
);

CREATE INDEX stock_balances_tenant_id_branch_id_product_id_idx
  ON stock_balances (tenant_id, branch_id, product_id);

CREATE TABLE stock_package_balances (
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  location_id uuid NOT NULL REFERENCES stock_locations(id),
  product_id uuid NOT NULL REFERENCES products(id),
  package_id uuid NOT NULL REFERENCES product_packages(id),
  closed_packages numeric(12, 3) NOT NULL DEFAULT 0,
  loose_units numeric(12, 3) NOT NULL DEFAULT 0,
  PRIMARY KEY (tenant_id, branch_id, location_id, product_id, package_id),
  CONSTRAINT stock_package_balances_quantities_non_negative CHECK (
    closed_packages >= 0
    AND loose_units >= 0
  )
);

CREATE INDEX stock_package_balances_tenant_id_branch_id_product_id_idx
  ON stock_package_balances (tenant_id, branch_id, product_id);

CREATE TABLE inventory_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  supplier_id uuid REFERENCES suppliers(id),
  document_number text,
  status text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  total_cents bigint NOT NULL DEFAULT 0,
  CONSTRAINT inventory_receipts_total_non_negative CHECK (total_cents >= 0)
);

CREATE INDEX inventory_receipts_tenant_id_branch_id_status_idx
  ON inventory_receipts (tenant_id, branch_id, status);
CREATE INDEX inventory_receipts_tenant_id_supplier_id_idx
  ON inventory_receipts (tenant_id, supplier_id);

CREATE TABLE inventory_receipt_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  receipt_id uuid NOT NULL REFERENCES inventory_receipts(id),
  product_id uuid NOT NULL REFERENCES products(id),
  package_id uuid REFERENCES product_packages(id),
  closed_packages numeric(12, 3) NOT NULL DEFAULT 0,
  loose_units numeric(12, 3) NOT NULL DEFAULT 0,
  base_quantity numeric(12, 3) NOT NULL,
  unit_cost_cents bigint NOT NULL,
  CONSTRAINT inventory_receipt_items_quantities_non_negative CHECK (
    closed_packages >= 0
    AND loose_units >= 0
    AND base_quantity > 0
  ),
  CONSTRAINT inventory_receipt_items_unit_cost_non_negative CHECK (unit_cost_cents >= 0)
);

CREATE INDEX inventory_receipt_items_tenant_id_receipt_id_idx
  ON inventory_receipt_items (tenant_id, receipt_id);
CREATE INDEX inventory_receipt_items_tenant_id_product_id_idx
  ON inventory_receipt_items (tenant_id, product_id);

CREATE TABLE purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  supplier_id uuid REFERENCES suppliers(id),
  status text NOT NULL,
  ordered_at timestamptz NOT NULL DEFAULT now(),
  expected_at timestamptz,
  subtotal_cents bigint NOT NULL DEFAULT 0,
  freight_cents bigint NOT NULL DEFAULT 0,
  discount_cents bigint NOT NULL DEFAULT 0,
  total_cents bigint NOT NULL DEFAULT 0,
  CONSTRAINT purchase_orders_money_non_negative CHECK (
    subtotal_cents >= 0
    AND freight_cents >= 0
    AND discount_cents >= 0
    AND total_cents >= 0
  )
);

CREATE INDEX purchase_orders_tenant_id_branch_id_status_idx
  ON purchase_orders (tenant_id, branch_id, status);
CREATE INDEX purchase_orders_tenant_id_supplier_id_idx
  ON purchase_orders (tenant_id, supplier_id);

CREATE TABLE purchase_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  purchase_order_id uuid NOT NULL REFERENCES purchase_orders(id),
  product_id uuid NOT NULL REFERENCES products(id),
  quantity numeric(12, 3) NOT NULL,
  unit_cost_cents bigint NOT NULL,
  CONSTRAINT purchase_order_items_quantity_positive CHECK (quantity > 0),
  CONSTRAINT purchase_order_items_unit_cost_non_negative CHECK (unit_cost_cents >= 0)
);

CREATE INDEX purchase_order_items_tenant_id_purchase_order_id_idx
  ON purchase_order_items (tenant_id, purchase_order_id);
CREATE INDEX purchase_order_items_tenant_id_product_id_idx
  ON purchase_order_items (tenant_id, product_id);

CREATE TABLE financial_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  name text NOT NULL,
  type text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  CONSTRAINT financial_categories_tenant_name_type_key UNIQUE (tenant_id, name, type)
);

CREATE INDEX financial_categories_tenant_id_active_idx
  ON financial_categories (tenant_id, active);

CREATE TABLE cost_centers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  name text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  CONSTRAINT cost_centers_tenant_branch_name_key UNIQUE (tenant_id, branch_id, name)
);

CREATE INDEX cost_centers_tenant_id_branch_id_active_idx
  ON cost_centers (tenant_id, branch_id, active);

CREATE TABLE account_payables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  supplier_id uuid REFERENCES suppliers(id),
  purchase_order_id uuid REFERENCES purchase_orders(id),
  category_id uuid REFERENCES financial_categories(id),
  cost_center_id uuid REFERENCES cost_centers(id),
  description text NOT NULL,
  competence_date timestamptz NOT NULL,
  due_date timestamptz NOT NULL,
  amount_cents bigint NOT NULL,
  open_cents bigint NOT NULL,
  status text NOT NULL,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT account_payables_money_non_negative CHECK (
    amount_cents >= 0
    AND open_cents >= 0
  )
);

CREATE INDEX account_payables_tenant_id_branch_id_status_idx
  ON account_payables (tenant_id, branch_id, status);
CREATE INDEX account_payables_tenant_id_branch_id_due_date_idx
  ON account_payables (tenant_id, branch_id, due_date);

CREATE TABLE account_receivables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  sale_id uuid REFERENCES sales(id),
  payment_record_id uuid REFERENCES payment_records(id),
  description text NOT NULL,
  competence_date timestamptz NOT NULL,
  due_date timestamptz NOT NULL,
  gross_cents bigint NOT NULL,
  fee_cents bigint NOT NULL DEFAULT 0,
  net_expected_cents bigint NOT NULL,
  open_cents bigint NOT NULL,
  status text NOT NULL,
  settled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT account_receivables_money_non_negative CHECK (
    gross_cents >= 0
    AND fee_cents >= 0
    AND net_expected_cents >= 0
    AND open_cents >= 0
  )
);

CREATE INDEX account_receivables_tenant_id_branch_id_status_idx
  ON account_receivables (tenant_id, branch_id, status);
CREATE INDEX account_receivables_tenant_id_branch_id_due_date_idx
  ON account_receivables (tenant_id, branch_id, due_date);

CREATE TABLE outbox_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  aggregate_type text NOT NULL,
  aggregate_id text NOT NULL,
  event_type text NOT NULL,
  payload_json jsonb NOT NULL,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);

CREATE INDEX outbox_events_tenant_id_status_created_at_idx
  ON outbox_events (tenant_id, status, created_at);

CREATE TABLE sync_commands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  client_command_id text NOT NULL,
  device_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES users(id),
  command_type text NOT NULL,
  payload_json jsonb NOT NULL,
  status text NOT NULL,
  server_result_json jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  CONSTRAINT sync_commands_tenant_branch_client_command_key UNIQUE (
    tenant_id,
    branch_id,
    client_command_id
  )
);

CREATE INDEX sync_commands_tenant_id_branch_id_status_idx
  ON sync_commands (tenant_id, branch_id, status);

CREATE TABLE attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  storage_key text NOT NULL UNIQUE,
  file_name text NOT NULL,
  mime_type text NOT NULL,
  size_bytes bigint NOT NULL,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT attachments_size_positive CHECK (size_bytes > 0)
);

CREATE INDEX attachments_tenant_id_created_at_idx ON attachments (tenant_id, created_at);

CREATE TABLE report_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  type text NOT NULL,
  format text NOT NULL,
  filters_json jsonb NOT NULL,
  status text NOT NULL,
  storage_key text,
  expires_at timestamptz,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX report_exports_tenant_id_branch_id_type_idx
  ON report_exports (tenant_id, branch_id, type);
CREATE INDEX report_exports_tenant_id_branch_id_status_idx
  ON report_exports (tenant_id, branch_id, status);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_terminals ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_package_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_payables ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_receivables ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbox_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_exports ENABLE ROW LEVEL SECURITY;
