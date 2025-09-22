/*
  # Initial Lenoff Schema

  1. New Tables
    - `profiles` - User profiles extending auth.users with roles
    - `organizations` - Organizations that admins can create and own
    - `tracks` - Learning tracks within organizations
    - `videos` - Videos within tracks
    - `ratings` - User ratings for videos (1-5 stars)

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Admins can manage their organization's content
    - Learners can view content and rate videos
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  role text DEFAULT 'learner' CHECK (role IN ('admin', 'learner')),
  created_at timestamptz DEFAULT now()
);

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create tracks table
CREATE TABLE IF NOT EXISTS tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  track_id uuid REFERENCES tracks(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  video_id uuid REFERENCES videos(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, video_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Organizations policies
CREATE POLICY "Anyone can read organizations" ON organizations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can create organizations" ON organizations
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Organization owners can update their organizations" ON organizations
  FOR UPDATE TO authenticated USING (owner_id = auth.uid());

-- Tracks policies
CREATE POLICY "Anyone can read tracks" ON tracks
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Organization owners can manage tracks" ON tracks
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM organizations 
      WHERE id = tracks.organization_id AND owner_id = auth.uid()
    )
  );

-- Videos policies
CREATE POLICY "Anyone can read videos" ON videos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Organization owners can manage videos" ON videos
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM organizations o
      JOIN tracks t ON t.organization_id = o.id
      WHERE t.id = videos.track_id AND o.owner_id = auth.uid()
    )
  );

-- Ratings policies
CREATE POLICY "Users can read all ratings" ON ratings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage their own ratings" ON ratings
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();