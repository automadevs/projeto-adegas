ALTER TABLE products
  ADD COLUMN barcode text,
  ADD COLUMN category text NOT NULL DEFAULT 'Geral',
  ADD COLUMN unit text NOT NULL DEFAULT 'un',
  ADD COLUMN min_stock numeric(12, 3) NOT NULL DEFAULT 0,
  ADD COLUMN active boolean NOT NULL DEFAULT true;

CREATE INDEX products_tenant_id_branch_id_active_idx ON products (tenant_id, branch_id, active);
CREATE INDEX products_tenant_id_branch_id_barcode_idx ON products (tenant_id, branch_id, barcode);
