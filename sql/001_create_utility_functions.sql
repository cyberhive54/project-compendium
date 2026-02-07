-- 001_create_utility_functions.sql
-- Utility functions used by multiple tables

-- Timestamp auto-update function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
