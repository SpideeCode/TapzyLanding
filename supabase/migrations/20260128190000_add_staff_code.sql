-- Add staff_access_code to restaurants table
ALTER TABLE "public"."restaurants" 
ADD COLUMN IF NOT EXISTS "staff_access_code" text;

-- Create function to verify staff access code
CREATE OR REPLACE FUNCTION verify_staff_access(input_slug text, input_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  restaurant_record record;
BEGIN
  -- Find restaurant by slug and code
  SELECT id, name, slug 
  INTO restaurant_record
  FROM restaurants
  WHERE slug = input_slug 
  AND staff_access_code = input_code;

  IF FOUND THEN
    RETURN json_build_object(
      'success', true,
      'restaurant', json_build_object(
        'id', restaurant_record.id,
        'name', restaurant_record.name,
        'slug', restaurant_record.slug
      )
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'message', 'Code invalide'
    );
  END IF;
END;
$$;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION verify_staff_access(text, text) TO anon, authenticated;
