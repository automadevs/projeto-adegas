CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE order_status AS ENUM ('DRAFT', 'CONFIRMED', 'COMPLETED', 'CANCELLED');
CREATE TYPE payment_status AS ENUM ('RECORDED', 'LIQUIDATED', 'CANCELLED');
CREATE TYPE stock_movement_type AS ENUM ('INITIAL_BALANCE', 'RESERVATION', 'RELEASE', 'SALE_CONSUMPTION', 'ADJUSTMENT', 'REVERSAL');
CREATE TYPE financial_entry_type AS ENUM ('REVENUE', 'RECEIVABLE', 'CASH_IN', 'REVERSAL');

CREATE TABLE tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  document text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX branches_tenant_id_idx ON branches (tenant_id);

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  email text NOT NULL,
  password_hash text NOT NULL,
  display_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_tenant_email_key UNIQUE (tenant_id, email)
);

CREATE INDEX users_tenant_id_branch_id_idx ON users (tenant_id, branch_id);

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  sku text NOT NULL,
  name text NOT NULL,
  price_cents bigint NOT NULL,
  average_cost_cents bigint NOT NULL,
  age_restricted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT products_tenant_branch_sku_key UNIQUE (tenant_id, branch_id, sku),
  CONSTRAINT products_price_non_negative CHECK (price_cents >= 0),
  CONSTRAINT products_average_cost_non_negative CHECK (average_cost_cents >= 0)
);

CREATE INDEX products_tenant_id_branch_id_idx ON products (tenant_id, branch_id);

CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  user_id uuid NOT NULL REFERENCES users(id),
  client_command_id text,
  status order_status NOT NULL DEFAULT 'DRAFT',
  subtotal_cents bigint NOT NULL,
  discount_cents bigint NOT NULL DEFAULT 0,
  total_cents bigint NOT NULL,
  cost_of_goods_cents bigint NOT NULL DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT orders_totals_non_negative CHECK (
    subtotal_cents >= 0
    AND discount_cents >= 0
    AND total_cents >= 0
    AND cost_of_goods_cents >= 0
  ),
  CONSTRAINT orders_tenant_branch_client_command_key UNIQUE (tenant_id, branch_id, client_command_id)
);

CREATE INDEX orders_tenant_id_branch_id_status_idx ON orders (tenant_id, branch_id, status);

CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  branch_id uuid NOT NULL,
  order_id uuid NOT NULL REFERENCES orders(id),
  product_id uuid NOT NULL REFERENCES products(id),
  quantity numeric(12, 3) NOT NULL,
  unit_price_cents bigint NOT NULL,
  total_cents bigint NOT NULL,
  unit_cost_cents bigint NOT NULL,
  total_cost_cents bigint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT order_items_quantity_positive CHECK (quantity > 0),
  CONSTRAINT order_items_money_non_negative CHECK (
    unit_price_cents >= 0
    AND total_cents >= 0
    AND unit_cost_cents >= 0
    AND total_cost_cents >= 0
  )
);

CREATE INDEX order_items_tenant_id_branch_id_order_id_idx ON order_items (tenant_id, branch_id, order_id);

CREATE TABLE payment_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  order_id uuid NOT NULL REFERENCES orders(id),
  method text NOT NULL,
  status payment_status NOT NULL DEFAULT 'RECORDED',
  gross_cents bigint NOT NULL,
  estimated_fee_cents bigint NOT NULL DEFAULT 0,
  net_cents bigint NOT NULL,
  expected_settlement_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payment_records_money_non_negative CHECK (
    gross_cents >= 0
    AND estimated_fee_cents >= 0
    AND net_cents >= 0
  )
);

CREATE INDEX payment_records_tenant_id_branch_id_order_id_idx ON payment_records (tenant_id, branch_id, order_id);

CREATE TABLE stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  product_id uuid NOT NULL REFERENCES products(id),
  order_id uuid REFERENCES orders(id),
  type stock_movement_type NOT NULL,
  quantity numeric(12, 3) NOT NULL,
  unit_cost_cents bigint NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT stock_movements_quantity_not_zero CHECK (quantity <> 0),
  CONSTRAINT stock_movements_unit_cost_non_negative CHECK (unit_cost_cents >= 0)
);

CREATE INDEX stock_movements_tenant_id_branch_id_product_id_idx ON stock_movements (tenant_id, branch_id, product_id);
CREATE INDEX stock_movements_tenant_id_branch_id_order_id_idx ON stock_movements (tenant_id, branch_id, order_id);

CREATE TABLE financial_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  order_id uuid REFERENCES orders(id),
  type financial_entry_type NOT NULL,
  amount_cents bigint NOT NULL,
  competence_date timestamptz NOT NULL,
  settlement_date timestamptz,
  memo text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT financial_entries_amount_non_zero CHECK (amount_cents <> 0)
);

CREATE INDEX financial_entries_tenant_id_branch_id_competence_date_idx ON financial_entries (tenant_id, branch_id, competence_date);
CREATE INDEX financial_entries_tenant_id_branch_id_settlement_date_idx ON financial_entries (tenant_id, branch_id, settlement_date);

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  actor_user_id uuid REFERENCES users(id),
  order_id uuid REFERENCES orders(id),
  action text NOT NULL,
  correlation_id text,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_logs_tenant_id_branch_id_action_idx ON audit_logs (tenant_id, branch_id, action);
CREATE INDEX audit_logs_tenant_id_branch_id_order_id_idx ON audit_logs (tenant_id, branch_id, order_id);

CREATE TABLE idempotency_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  key text NOT NULL,
  operation text NOT NULL,
  request_hash text NOT NULL,
  response_body jsonb,
  status_code integer,
  locked_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT idempotency_records_tenant_branch_key UNIQUE (tenant_id, branch_id, key)
);

CREATE INDEX idempotency_records_tenant_id_branch_id_operation_idx ON idempotency_records (tenant_id, branch_id, operation);

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE idempotency_records ENABLE ROW LEVEL SECURITY;
