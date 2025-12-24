-- Create app_settings table
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read settings
CREATE POLICY "Allow authenticated users to read app_settings" ON public.app_settings
    FOR SELECT
    TO authenticated
    USING (true);

-- Insert default background image setting
INSERT INTO public.app_settings (key, value)
VALUES ('background_image', 'default_background.png')
ON CONFLICT (key) DO NOTHING;
