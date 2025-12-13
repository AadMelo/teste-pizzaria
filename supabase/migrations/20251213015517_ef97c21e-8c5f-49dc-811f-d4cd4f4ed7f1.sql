-- Drop the old constraint
ALTER TABLE orders DROP CONSTRAINT orders_status_check;

-- Add the new constraint with 'ready' status included
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
CHECK (status = ANY (ARRAY['pending'::text, 'pending_payment'::text, 'confirmed'::text, 'preparing'::text, 'ready'::text, 'delivering'::text, 'delivered'::text, 'cancelled'::text]));