# Lenoff Learning Management System

A modern, full-stack learning management system built with Next.js, Supabase, and Tailwind CSS.

## Features

### Authentication
- Email/password login and signup
- Magic link authentication
- Role-based access (Admin, Learner)

### For Learners
- Browse learning tracks
- Watch embedded YouTube videos
- Rate videos (1-5 stars)
- Track progress through courses

### For Admins
- Create and manage organizations
- Create learning tracks
- Add videos to tracks
- Admin dashboard with analytics
- View student count, track count, and average ratings

## Tech Stack

- **Frontend**: Next.js 13 (Pages Router), React, Tailwind CSS
- **Backend**: Supabase (Database, Auth, RLS)
- **Styling**: Tailwind CSS with custom brand colors
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone and install dependencies**:
```bash
git clone <your-repo>
cd lenoff
npm install
```

2. **Set up Supabase**:
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Settings > API to get your project URL and anon key
   - In the SQL editor, run the migration script from `supabase/migrations/001_initial_schema.sql`
   - Optionally run the seed data from `supabase/seed.sql`

3. **Environment variables**:
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Run the development server**:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### First Steps

1. **Sign up** as an admin at `/auth/signup`
2. **Create an organization** at `/admin/organization`
3. **Add learning tracks** at `/admin/tracks`
4. **Add videos** to tracks at `/admin/videos`
5. **View the admin dashboard** at `/admin/dashboard`

## Database Schema

The app uses 5 main tables:

- **profiles** - User profiles with roles (admin/learner)
- **organizations** - Organizations owned by admins
- **tracks** - Learning tracks within organizations
- **videos** - Videos within tracks (YouTube URLs)
- **ratings** - User ratings for videos (1-5 stars)

## Deployment

### Deploy to Vercel

1. **Push to GitHub** (or your preferred Git provider)

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Add environment variables in project settings
   - Deploy!

3. **Update Supabase settings**:
   - In Supabase dashboard, go to Authentication > URL Configuration
   - Add your Vercel domain to allowed redirect URLs

### Build Command
```bash
npm run build
```

### Environment Variables for Production
Make sure to set these in your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - see LICENSE file for details.