
-- Fix the numeric precision for nutritional percentages to allow larger values
-- Current precision (5,2) only allows values up to 999.99, but some ingredients like vegetable oil have 99% fat
-- Change to precision (8,2) to allow values up to 999999.99

ALTER TABLE feed_ingredients 
ALTER COLUMN protein_percentage TYPE numeric(8,2);

ALTER TABLE feed_ingredients 
ALTER COLUMN fat_percentage TYPE numeric(8,2);

ALTER TABLE feed_ingredients 
ALTER COLUMN fiber_percentage TYPE numeric(8,2);

ALTER TABLE feed_ingredients 
ALTER COLUMN moisture_percentage TYPE numeric(8,2);

ALTER TABLE feed_ingredients 
ALTER COLUMN ash_percentage TYPE numeric(8,2);

ALTER TABLE feed_ingredients 
ALTER COLUMN calcium_percentage TYPE numeric(8,2);

ALTER TABLE feed_ingredients 
ALTER COLUMN phosphorus_percentage TYPE numeric(8,2);

ALTER TABLE feed_ingredients 
ALTER COLUMN cost_per_kg TYPE numeric(8,2);

-- Also ensure the energy field can handle larger values
ALTER TABLE feed_ingredients 
ALTER COLUMN energy_kcal_per_kg TYPE integer;
