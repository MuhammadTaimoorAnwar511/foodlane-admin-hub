
-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  variants JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create deals table
CREATE TABLE public.deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'ended')),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  price DECIMAL(10,2) NOT NULL,
  offer_price DECIMAL(10,2),
  pricing_mode TEXT NOT NULL DEFAULT 'fixed' CHECK (pricing_mode IN ('fixed', 'calculated')),
  discount_percent INTEGER DEFAULT 0,
  count_stock BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  start_date DATE,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coupons table
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_delivery')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_discount_amount DECIMAL(10,2),
  usage_limit INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
  start_date DATE,
  end_date DATE,
  is_first_order_only BOOLEAN NOT NULL DEFAULT false,
  applicable_categories JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shop_settings table for delivery settings and other shop configurations
CREATE TABLE public.shop_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default delivery settings
INSERT INTO public.shop_settings (setting_key, setting_value) VALUES 
('delivery_settings', '{
  "deliveryFee": 50,
  "freeDeliveryThreshold": 500,
  "deliveryRadius": 10,
  "estimatedDeliveryTime": 30,
  "enableFreeDelivery": true
}'::jsonb),
('shop_profile', '{
  "name": "FastFood Restaurant",
  "description": "Delicious fast food delivered to your door",
  "address": "123 Main Street, City",
  "phone": "+1234567890",
  "email": "info@fastfood.com"
}'::jsonb);

-- Enable Row Level Security (RLS) but allow all operations for now since we're skipping authentication
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_settings ENABLE ROW LEVEL SECURITY;

-- Create permissive policies that allow all operations (since we're skipping auth for now)
CREATE POLICY "Allow all operations on categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on deals" ON public.deals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on coupons" ON public.coupons FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on shop_settings" ON public.shop_settings FOR ALL USING (true) WITH CHECK (true);

-- Add some sample data
INSERT INTO public.categories (name, description, is_active) VALUES 
('Burgers', 'Delicious burgers and sandwiches', true),
('Beverages', 'Refreshing drinks and beverages', true),
('Sides', 'Tasty sides and appetizers', true),
('Desserts', 'Sweet treats and desserts', true);

INSERT INTO public.products (name, description, price, category_id, is_available, stock_quantity, variants) VALUES 
('Zinger Burger', 'Crispy chicken burger with spicy sauce', 450.00, (SELECT id FROM public.categories WHERE name = 'Burgers'), true, 50, '["Regular", "Spicy"]'::jsonb),
('Chicken Burger', 'Classic chicken burger', 350.00, (SELECT id FROM public.categories WHERE name = 'Burgers'), true, 30, '[]'::jsonb),
('Fries', 'Crispy golden fries', 150.00, (SELECT id FROM public.categories WHERE name = 'Sides'), true, 100, '["Small", "Medium", "Large"]'::jsonb),
('Drink', 'Refreshing soft drinks', 120.00, (SELECT id FROM public.categories WHERE name = 'Beverages'), true, 200, '["345ml", "500ml", "1.5L"]'::jsonb),
('Chicken Pieces', 'Tender chicken pieces', 800.00, (SELECT id FROM public.categories WHERE name = 'Burgers'), true, 25, '["4 pcs", "6 pcs", "8 pcs"]'::jsonb);
