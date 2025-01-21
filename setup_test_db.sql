-- Create the database (run this separately if you're not already in psql)
-- CREATE DATABASE celestial_test;

-- Create the players table
CREATE TABLE players (
    id UUID PRIMARY KEY,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    email VARCHAR NOT NULL,
    createdate DATE DEFAULT CURRENT_DATE,
    decks VARCHAR[] DEFAULT '{}',
    userprogress VARCHAR[] DEFAULT '{}',
    inventory BIT VARYING(1000) DEFAULT B'1000101001011100001',
    completedmissions BIT VARYING(1000) DEFAULT B''
);

-- Insert some test data
INSERT INTO players (id, email) VALUES 
    ('123e4567-e89b-12d3-a456-426614174000', 'test1@example.com'),
    ('223e4567-e89b-12d3-a456-426614174000', 'test2@example.com');

-- Add some test data with more fields populated
INSERT INTO players (
    id, 
    email, 
    wins, 
    losses, 
    decks, 
    userprogress
) VALUES (
    '323e4567-e89b-12d3-a456-426614174000',
    'test3@example.com',
    5,
    2,
    ARRAY['deck1', 'deck2'],
    ARRAY['progress1', 'progress2']
); 