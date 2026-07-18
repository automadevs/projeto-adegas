CREATE TYPE "OrderType" AS ENUM ('COUNTER', 'TABLE', 'TAB', 'DELIVERY');
CREATE TYPE "ServiceTableStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'INACTIVE');
CREATE TYPE "CustomerTabStatus" AS ENUM ('OPEN', 'REQUESTED_CLOSE', 'CLOSED', 'CANCELLED');
CREATE TYPE "OrderItemStatus" AS ENUM ('DRAFT', 'SENT', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED');
CREATE TYPE "PreparationTicketStatus" AS ENUM ('PENDING', 'ACKNOWLEDGED', 'PREPARING', 'READY', 'ISSUE', 'CANCELLED');

CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  name text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT categories_tenant_name_key UNIQUE (tenant_id, name)
);

CREATE INDEX categories_tenant_id_active_idx ON categories (tenant_id, active);

CREATE TABLE preparation_stations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  name text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT preparation_stations_tenant_branch_name_key UNIQUE (tenant_id, branch_id, name)
);

CREATE INDEX preparation_stations_tenant_id_branch_id_active_idx
  ON preparation_stations (tenant_id, branch_id, active);

CREATE TABLE tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  name text NOT NULL,
  status "ServiceTableStatus" NOT NULL DEFAULT 'AVAILABLE',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tables_tenant_branch_name_key UNIQUE (tenant_id, branch_id, name)
);

CREATE INDEX tables_tenant_id_branch_id_status_idx ON tables (tenant_id, branch_id, status);

CREATE TABLE tabs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  display_number integer NOT NULL,
  customer_label text,
  status "CustomerTabStatus" NOT NULL DEFAULT 'OPEN',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tabs_tenant_branch_display_number_key UNIQUE (tenant_id, branch_id, display_number)
);

CREATE INDEX tabs_tenant_id_branch_id_status_idx ON tabs (tenant_id, branch_id, status);

ALTER TABLE products
  ADD COLUMN preparation_station_id uuid REFERENCES preparation_stations(id);

CREATE INDEX products_tenant_id_branch_id_preparation_station_id_idx
  ON products (tenant_id, branch_id, preparation_station_id);

ALTER TABLE orders
  ADD COLUMN type "OrderType" NOT NULL DEFAULT 'COUNTER',
  ADD COLUMN table_id uuid REFERENCES tables(id),
  ADD COLUMN tab_id uuid REFERENCES tabs(id),
  ADD COLUMN version integer NOT NULL DEFAULT 1,
  ADD COLUMN opened_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN closed_at timestamptz;

CREATE INDEX orders_tenant_id_branch_id_type_idx ON orders (tenant_id, branch_id, type);
CREATE INDEX orders_tenant_id_branch_id_table_id_idx ON orders (tenant_id, branch_id, table_id);
CREATE INDEX orders_tenant_id_branch_id_tab_id_idx ON orders (tenant_id, branch_id, tab_id);

ALTER TABLE order_items
  ADD COLUMN status "OrderItemStatus" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN preparation_station_id uuid REFERENCES preparation_stations(id),
  ADD COLUMN note text;

CREATE INDEX order_items_tenant_id_branch_id_status_idx ON order_items (tenant_id, branch_id, status);
CREATE INDEX order_items_tenant_id_branch_id_preparation_station_id_idx
  ON order_items (tenant_id, branch_id, preparation_station_id);

CREATE TABLE order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  order_id uuid NOT NULL REFERENCES orders(id),
  from_status order_status,
  to_status order_status NOT NULL,
  actor_id uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX order_status_history_tenant_id_order_id_created_at_idx
  ON order_status_history (tenant_id, order_id, created_at);

CREATE TABLE preparation_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  station_id uuid NOT NULL REFERENCES preparation_stations(id),
  order_id uuid NOT NULL REFERENCES orders(id),
  status "PreparationTicketStatus" NOT NULL DEFAULT 'PENDING',
  received_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  ready_at timestamptz
);

CREATE INDEX preparation_tickets_tenant_id_branch_id_station_id_status_idx
  ON preparation_tickets (tenant_id, branch_id, station_id, status);
CREATE INDEX preparation_tickets_tenant_id_branch_id_order_id_idx
  ON preparation_tickets (tenant_id, branch_id, order_id);

CREATE TABLE preparation_ticket_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  ticket_id uuid NOT NULL REFERENCES preparation_tickets(id),
  order_item_id uuid NOT NULL REFERENCES order_items(id),
  quantity numeric(12, 3) NOT NULL,
  status "PreparationTicketStatus" NOT NULL DEFAULT 'PENDING',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT preparation_ticket_items_quantity_positive CHECK (quantity > 0)
);

CREATE INDEX preparation_ticket_items_tenant_id_ticket_id_idx
  ON preparation_ticket_items (tenant_id, ticket_id);
CREATE INDEX preparation_ticket_items_tenant_id_order_item_id_idx
  ON preparation_ticket_items (tenant_id, order_item_id);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE preparation_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE tabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE preparation_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE preparation_ticket_items ENABLE ROW LEVEL SECURITY;
