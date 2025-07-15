-- Add columns for price source and timestamp tracking
ALTER TABLE public.feed_ingredients 
ADD COLUMN price_source text DEFAULT 'manual',
ADD COLUMN price_updated_at timestamp with time zone DEFAULT now(),
ADD COLUMN is_price_custom boolean DEFAULT true;

-- Update existing ingredients to have proper price tracking
UPDATE public.feed_ingredients 
SET price_source = 'manual', 
    price_updated_at = now(), 
    is_price_custom = true 
WHERE price_source IS NULL;