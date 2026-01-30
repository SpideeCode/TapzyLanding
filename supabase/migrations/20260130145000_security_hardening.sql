-- SECURITY HARDENING: PRICE VALIDATION
-- This script prevents price tampering by clients.

-- 1. Function to enforce Item Price from DB
CREATE OR REPLACE FUNCTION public.handle_order_item_price()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    real_price DECIMAL(10,2);
BEGIN
    -- Fetch the actual price from the items table
    SELECT price INTO real_price
    FROM public.items
    WHERE id = NEW.item_id;

    -- If item doesn't exist (should be caught by FK, but safe check), default to 0 or error
    IF real_price IS NULL THEN
        RAISE EXCEPTION 'Item not found';
    END IF;

    -- Override the user-provided price with the real price
    NEW.unit_price := real_price;

    RETURN NEW;
END;
$$;

-- 2. Trigger for Order Items (Before Insert)
DROP TRIGGER IF EXISTS enforce_price ON public.order_items;
CREATE TRIGGER enforce_price
    BEFORE INSERT ON public.order_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_order_item_price();


-- 3. Function to Recalculate Order Total automatically
CREATE OR REPLACE FUNCTION public.update_order_total()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update the parent order's total_price
    -- Sum of (unit_price * quantity) for all items in that order
    -- We do this for the Order ID involved (NEW.order_id or OLD.order_id)
    
    IF (TG_OP = 'DELETE') THEN
        UPDATE public.orders
        SET total_price = (
            SELECT COALESCE(SUM(unit_price * quantity), 0)
            FROM public.order_items
            WHERE order_id = OLD.order_id
        )
        WHERE id = OLD.order_id;
    ELSE
        UPDATE public.orders
        SET total_price = (
            SELECT COALESCE(SUM(unit_price * quantity), 0)
            FROM public.order_items
            WHERE order_id = NEW.order_id
        )
        WHERE id = NEW.order_id;
    END IF;
    
    RETURN NULL;
END;
$$;

-- 4. Trigger for Order Total Maintenance (After changes to items)
DROP TRIGGER IF EXISTS maintain_order_total ON public.order_items;
CREATE TRIGGER maintain_order_total
    AFTER INSERT OR UPDATE OR DELETE ON public.order_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_order_total();

-- 5. Force initial total to 0 for new orders (optional but good practice)
-- Clients create the order first, usually with 0 total, then add items.
-- This ensures they can't create an empty order with "100€" total.
CREATE OR REPLACE FUNCTION public.reset_new_order_total()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.total_price := 0;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS init_order_total ON public.orders;
CREATE TRIGGER init_order_total
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.reset_new_order_total();
