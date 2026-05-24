-- Migration: create_product_images_bucket
-- Public bucket for product images uploaded from the admin panel.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5 * 1024 * 1024,
  ARRAY['image/jpeg','image/jpg','image/png','image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow public read access to anyone
DROP POLICY IF EXISTS "product_images_public_read" ON storage.objects;
CREATE POLICY "product_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Policy: Allow managers to insert files
DROP POLICY IF EXISTS "product_images_manager_insert" ON storage.objects;
CREATE POLICY "product_images_manager_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
    )
  );

-- Policy: Allow managers to update files
DROP POLICY IF EXISTS "product_images_manager_update" ON storage.objects;
CREATE POLICY "product_images_manager_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
    )
  );

-- Policy: Allow managers to delete files
DROP POLICY IF EXISTS "product_images_manager_delete" ON storage.objects;
CREATE POLICY "product_images_manager_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
    )
  );
