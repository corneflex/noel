create table characters (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  image_url text,
  stats jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS
alter table characters enable row level security;

-- Allow public read access
create policy "Allow public read access"
  on characters for select
  to public
  using (true);

-- Insert dummy data
insert into characters (name, description, image_url, stats) values
  ('Cyber Ninja', 'A futuristic warrior with enhanced reflexes and cybernetic limbs.', 'https://images.unsplash.com/photo-1560674457-12073ed6fae6?auto=format&fit=crop&q=80&w=2787&ixlib=rb-4.0.3', '{"Agility": 95, "Strength": 60, "Tech": 80}'),
  ('Forest Druid', 'Guardian of the ancient woods, commander of nature.', 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?auto=format&fit=crop&q=80&w=2787&ixlib=rb-4.0.3', '{"Magic": 90, "Wisdom": 85, "Strength": 40}'),
  ('Space Marine', 'Elite soldier equipped with heavy power armor.', 'https://images.unsplash.com/photo-1620641159827-048704207914?auto=format&fit=crop&q=80&w=3456&ixlib=rb-4.0.3', '{"Defense": 95, "Firepower": 85, "Speed": 30}'),
  ('Arcane Sorceress', 'Master of the arcane arts, wielder of pure energy.', 'https://images.unsplash.com/photo-1515286157071-33126f5f1906?auto=format&fit=crop&q=80&w=3456&ixlib=rb-4.0.3', '{"Magic": 100, "Intelligence": 95, "Defense": 20}'),
  ('Rogue Agent', 'Expert in stealth and espionage.', 'https://images.unsplash.com/photo-1509378033230-01995ae40224?auto=format&fit=crop&q=80&w=3456&ixlib=rb-4.0.3', '{"Stealth": 98, "Agility": 85, "Charisma": 70}');
