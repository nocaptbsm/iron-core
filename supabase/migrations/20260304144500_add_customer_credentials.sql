-- Create credentials table
CREATE TABLE public.customer_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  login_id TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customer_credentials ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies
CREATE POLICY "Allow public read customer credentials" ON public.customer_credentials FOR SELECT USING (true);
CREATE POLICY "Allow public insert customer credentials" ON public.customer_credentials FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update customer credentials" ON public.customer_credentials FOR UPDATE USING (true);
CREATE POLICY "Allow public delete customer credentials" ON public.customer_credentials FOR DELETE USING (true);
