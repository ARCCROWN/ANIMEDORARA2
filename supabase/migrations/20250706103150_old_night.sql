/*
  # Add set_config function for RLS context

  1. New Functions
    - `set_config` function to allow setting session variables for RLS policies
  
  2. Security
    - Function is accessible to public role for setting user context
*/

-- Create a function to set configuration variables for RLS
CREATE OR REPLACE FUNCTION set_config(setting_name text, setting_value text, is_local boolean DEFAULT false)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM set_config(setting_name, setting_value, is_local);
  RETURN setting_value;
END;
$$;

-- Grant execute permission to public (authenticated users)
GRANT EXECUTE ON FUNCTION set_config(text, text, boolean) TO public;