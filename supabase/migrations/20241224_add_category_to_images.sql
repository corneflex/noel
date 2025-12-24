-- Add category column to character_images
ALTER TABLE character_images ADD COLUMN category text NOT NULL DEFAULT 'profile';

-- Comment explaining values
COMMENT ON COLUMN character_images.category IS 'Category of the media: "profile" for the main slideshow, "gallery" for the fullscreen action gallery.';
