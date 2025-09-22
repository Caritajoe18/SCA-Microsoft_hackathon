-- Seed data for Lenoff LMS
-- This creates sample data: 1 organization, 1 track, 1 video

-- Insert sample admin user (you'll need to sign up first to get the actual user ID)
-- This is just for reference - replace with actual user ID after signup

-- Sample organization
INSERT INTO organizations (id, name, description, owner_id) VALUES 
(
  gen_random_uuid(),
  'TechEd Academy', 
  'A leading online technology education platform',
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
);

-- Sample track
INSERT INTO tracks (title, description, organization_id) VALUES 
(
  'Introduction to Web Development',
  'Learn the fundamentals of web development with HTML, CSS, and JavaScript',
  (SELECT id FROM organizations LIMIT 1)
);

-- Sample video
INSERT INTO videos (title, description, video_url, track_id) VALUES 
(
  'Getting Started with HTML',
  'Learn the basics of HTML markup language',
  'https://www.youtube.com/watch?v=UB1O30fR-EE',
  (SELECT id FROM tracks LIMIT 1)
);