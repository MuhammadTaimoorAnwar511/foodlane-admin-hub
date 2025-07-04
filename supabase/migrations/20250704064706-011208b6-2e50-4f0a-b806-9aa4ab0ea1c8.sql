
-- Create riders table for delivery riders management
CREATE TABLE public.riders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'offline', 'busy')),
  orders_completed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create schedules table for shop operating hours
CREATE TABLE public.schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  is_closed BOOLEAN NOT NULL DEFAULT false,
  is_24h BOOLEAN NOT NULL DEFAULT false,
  time_blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(day_of_week)
);

-- Insert default schedule for all days (9 AM to 9 PM)
INSERT INTO public.schedules (day_of_week, is_closed, is_24h, time_blocks) VALUES
(0, false, false, '[{"id": "sunday-1", "startTime": "09:00", "endTime": "21:00"}]'::jsonb),
(1, false, false, '[{"id": "monday-1", "startTime": "09:00", "endTime": "21:00"}]'::jsonb),
(2, false, false, '[{"id": "tuesday-1", "startTime": "09:00", "endTime": "21:00"}]'::jsonb),
(3, false, false, '[{"id": "wednesday-1", "startTime": "09:00", "endTime": "21:00"}]'::jsonb),
(4, false, false, '[{"id": "thursday-1", "startTime": "09:00", "endTime": "21:00"}]'::jsonb),
(5, false, false, '[{"id": "friday-1", "startTime": "09:00", "endTime": "21:00"}]'::jsonb),
(6, false, false, '[{"id": "saturday-1", "startTime": "09:00", "endTime": "21:00"}]'::jsonb);

-- Add global shop status to shop_settings if not exists
INSERT INTO public.shop_settings (setting_key, setting_value) 
VALUES ('global_shop_status', '{
  "isOpen": true,
  "closedMessage": "We are temporarily closed. Please check back later!"
}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- Add sample riders
INSERT INTO public.riders (name, phone, password, status, orders_completed) VALUES
('Alex Rodriguez', '+923001234567', 'rider123', 'active', 145),
('Sarah Johnson', '+923001234568', 'rider456', 'active', 98),
('Mike Chen', '+923001234569', 'rider789', 'offline', 67);

-- Enable RLS on new tables
ALTER TABLE public.riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for admin access
CREATE POLICY "Allow all operations on riders" ON public.riders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on schedules" ON public.schedules FOR ALL USING (true) WITH CHECK (true);
