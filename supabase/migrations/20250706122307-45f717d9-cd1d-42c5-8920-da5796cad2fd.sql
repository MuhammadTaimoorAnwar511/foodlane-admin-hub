
-- 1. Remove duplicate shop_profile entry from shop_settings table
DELETE FROM shop_settings WHERE setting_key = 'shop_profile';

-- 2. Add database constraints for delivery settings
ALTER TABLE shop_settings 
ADD CONSTRAINT check_delivery_times 
CHECK (
  CASE 
    WHEN setting_key = 'delivery_settings' THEN
      (setting_value->>'minDeliveryTime')::integer >= 0 AND
      (setting_value->>'maxDeliveryTime')::integer >= 0 AND
      (setting_value->>'minDeliveryTime')::integer <= (setting_value->>'maxDeliveryTime')::integer AND
      (setting_value->>'deliveryCharges')::integer >= 0 AND
      (setting_value->>'freeDeliveryThreshold')::integer >= 0
    ELSE true
  END
);

-- 3. Add constraints for products table
ALTER TABLE products 
ADD CONSTRAINT check_product_pricing 
CHECK (
  price >= 0 AND
  (stock_quantity IS NULL OR stock_quantity >= 0)
);

-- 4. Add constraints for deals table
ALTER TABLE deals 
ADD CONSTRAINT check_deal_pricing 
CHECK (
  price >= 0 AND
  (offer_price IS NULL OR offer_price >= 0) AND
  (offer_price IS NULL OR offer_price <= price) AND
  (discount_percent IS NULL OR (discount_percent >= 0 AND discount_percent <= 100))
);

-- 5. Add constraints for coupons table
ALTER TABLE coupons 
ADD CONSTRAINT check_coupon_constraints 
CHECK (
  discount_value >= 0 AND
  (discount_type != 'percentage' OR discount_value <= 100) AND
  (min_order_amount IS NULL OR min_order_amount >= 0) AND
  (usage_limit IS NULL OR usage_limit >= 0) AND
  discount_type IN ('percentage', 'fixed_amount') -- Remove free_delivery option
);

-- 6. Update existing coupons that might have 'free_delivery' discount type
UPDATE coupons 
SET discount_type = 'fixed_amount', discount_value = 0 
WHERE discount_type = 'free_delivery';
