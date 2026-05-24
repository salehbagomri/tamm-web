-- Migration: create_product_images
-- Date: 2026-05-24
-- Description: Create product_images table to support multiple images per product, setup RLS, indexes, and migrate existing images.

CREATE TABLE IF NOT EXISTS public.product_images (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url   TEXT NOT NULL,
    sort_order  INT NOT NULL DEFAULT 0,
    alt_text    TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS product_images_product_id_idx ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS product_images_sort_order_idx ON public.product_images(sort_order);

-- Enable Row Level Security
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Allow public read access to product_images for customers/guests
DROP POLICY IF EXISTS "Allow public read access to product_images" ON public.product_images;
CREATE POLICY "Allow public read access to product_images" 
ON public.product_images FOR SELECT 
TO public 
USING (true);

-- Allow managers full control over product_images
DROP POLICY IF EXISTS "Allow managers full control over product_images" ON public.product_images;
CREATE POLICY "Allow managers full control over product_images" 
ON public.product_images FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'manager'
  )
);

-- Data Migration: Migrate existing image_url from products to product_images as primary images (sort_order = 0)
INSERT INTO public.product_images (product_id, image_url, sort_order)
SELECT id, image_url, 0
FROM public.products
WHERE image_url IS NOT NULL AND image_url <> ''
ON CONFLICT DO NOTHING;
