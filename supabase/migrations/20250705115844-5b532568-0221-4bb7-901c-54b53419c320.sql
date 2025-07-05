
-- Update the delivery settings structure in shop_settings table
-- We'll store delivery settings as a JSON object with the required fields
INSERT INTO shop_settings (setting_key, setting_value) 
VALUES ('delivery_settings', '{
  "minDeliveryTime": 25,
  "maxDeliveryTime": 30,
  "deliveryCharges": 150,
  "enableFreeDelivery": false,
  "freeDeliveryThreshold": 1000
}'::jsonb)
ON CONFLICT (setting_key) 
DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  updated_at = now();
