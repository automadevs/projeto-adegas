CREATE TABLE product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  product_id uuid NOT NULL REFERENCES products(id),
  storage_key text NOT NULL,
  source_url text,
  source_domain text,
  source_type text,
  usage_note text,
  mime_type text NOT NULL,
  width integer NOT NULL,
  height integer NOT NULL,
  file_size_bytes bigint NOT NULL,
  sha256 text NOT NULL,
  alt_text text NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  status text NOT NULL,
  created_by uuid NOT NULL REFERENCES users(id),
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT product_images_dimensions_positive CHECK (width > 0 AND height > 0),
  CONSTRAINT product_images_file_size_positive CHECK (file_size_bytes > 0),
  CONSTRAINT product_images_sha256_not_empty CHECK (length(trim(sha256)) > 0),
  CONSTRAINT product_images_storage_key_not_empty CHECK (length(trim(storage_key)) > 0),
  CONSTRAINT product_images_alt_text_not_empty CHECK (length(trim(alt_text)) > 0)
);

CREATE UNIQUE INDEX product_images_tenant_sha256_key ON product_images (tenant_id, sha256);
CREATE UNIQUE INDEX product_images_storage_key_key ON product_images (storage_key);
CREATE UNIQUE INDEX product_images_one_primary_per_product_idx
  ON product_images (tenant_id, product_id)
  WHERE is_primary = true AND archived_at IS NULL;
CREATE INDEX product_images_tenant_product_idx ON product_images (tenant_id, product_id);
CREATE INDEX product_images_tenant_status_idx ON product_images (tenant_id, status);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
