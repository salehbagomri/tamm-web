-- Migration: Create stock_movements table for tracking inventory changes
-- Date: 2026-05-21

CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('import', 'sale', 'cancel_return', 'manual_adjustment')),
    quantity_before INT NOT NULL,
    quantity_after INT NOT NULL,
    quantity_change INT NOT NULL,
    notes TEXT,
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- Policy to allow managers full access (read, write, update, delete)
CREATE POLICY "Allow managers full access to stock_movements" 
ON public.stock_movements 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'manager'
  )
);
