-- Add new columns
ALTER TABLE players 
ADD COLUMN lastactive DATE NOT NULL DEFAULT NOW(),
ADD COLUMN elo INTEGER NOT NULL DEFAULT 1000;

-- Remove userprogress column
ALTER TABLE players 
DROP COLUMN userprogress;

-- Add default values to existing columns that were missing them
-- ALTER TABLE players 
-- ALTER COLUMN createdate SET DEFAULT NOW(),
-- ALTER COLUMN wins SET DEFAULT 0,
-- ALTER COLUMN losses SET DEFAULT 0,
-- ALTER COLUMN decks SET DEFAULT '{}'::character varying[]; 
