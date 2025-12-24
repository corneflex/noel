-- Create character_images table
CREATE TABLE IF NOT EXISTS character_images (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    character_id uuid REFERENCES characters(id) ON DELETE CASCADE,
    image_filename text NOT NULL,
    created_at timestamptz DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE character_images ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON character_images
    FOR SELECT USING (true);

-- Dummy data comment (User needs to populate this manually)
-- INSERT INTO character_images (character_id, image_filename) 
-- VALUES ((SELECT id FROM characters WHERE name = 'Cyber Ninja'), 'cyber-ninja-action.jpg');
