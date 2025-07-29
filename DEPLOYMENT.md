# Zinga Linga - Deployment Guide

This guide will help you deploy the Zinga Linga educational platform using **Vercel** for hosting and **Neon** for the PostgreSQL database.

## Prerequisites

- Node.js 18+ installed
- Git installed
- A Vercel account (free tier available)
- A Neon account (free tier available)

## Step 1: Set Up Neon Database

1. **Create a Neon Account**
   - Go to [https://console.neon.tech](https://console.neon.tech)
   - Sign up for a free account
   - Create a new project

2. **Get Database Connection String**
   - In your Neon dashboard, go to "Connection Details"
   - Copy the connection string (it looks like: `postgresql://username:password@hostname/database?sslmode=require`)

3. **Update Environment Variables**
   - Open `.env.local` in your project
   - Replace the `DATABASE_URL` with your actual Neon connection string:
   ```
   DATABASE_URL=postgresql://your-username:your-password@your-hostname/your-database?sslmode=require
   ```

## Step 2: Test Database Connection Locally

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Generate Database Schema**
   ```bash
   npm run db:push
   ```
   This will create the necessary tables in your Neon database.

3. **Test Locally**
   ```bash
   npm run dev
   ```
   - Open [http://localhost:3000](http://localhost:3000)
   - Try logging in with demo credentials:
     - **Admin**: `admin@zingalinga.com` / `Admin123!`
     - **Parent**: `parent@demo.com` / `Parent123!`

## Step 3: Deploy to Vercel

1. **Install Vercel CLI** (optional)
   ```bash
   npm i -g vercel
   ```

2. **Deploy via GitHub** (Recommended)
   - Push your code to GitHub
   - Go to [https://vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables:
     - Add `DATABASE_URL` with your Neon connection string
   - Deploy!

3. **Deploy via CLI** (Alternative)
   ```bash
   vercel
   ```
   - Follow the prompts
   - Add environment variables when prompted

## Step 4: Configure Environment Variables in Vercel

In your Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the following variables:
   - `DATABASE_URL`: Your Neon connection string
   - `NODE_ENV`: `production`

## Step 5: Verify Deployment

1. **Check Database Connection**
   - Visit your deployed app
   - Try logging in with demo credentials
   - Check that data persists after refresh

2. **Test Features**
   - User registration and login
   - Module purchases
   - Admin dashboard functionality
   - Data persistence

## Database Schema

The application automatically creates these tables:
- `users` - User accounts and profiles
- `modules` - Educational modules/courses
- `purchases` - Purchase transactions
- `content_files` - Uploaded content files

## Demo Credentials

**Admin Account:**
- Email: `admin@zingalinga.com`
- Password: `Admin123!`

**Demo Parent Account:**
- Email: `parent@demo.com`
- Password: `Parent123!`

## Troubleshooting

### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Check that your Neon database is active
- Ensure SSL mode is enabled (`?sslmode=require`)

### Deployment Issues
- Check Vercel build logs for errors
- Verify all environment variables are set
- Ensure Node.js version compatibility

### API Route Issues
- Check that API routes are accessible: `/api/auth/login`, `/api/data/load`
- Verify database schema is properly created

## Features

✅ **User Authentication** - Secure login/registration
✅ **Data Persistence** - PostgreSQL with Neon
✅ **Admin Dashboard** - User and content management
✅ **Module System** - Educational content delivery
✅ **Purchase System** - Module purchasing workflow
✅ **Responsive Design** - Mobile-friendly interface
✅ **Real-time Updates** - Live data synchronization

## Architecture

- **Frontend**: Next.js 15 with React 19
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **Hosting**: Vercel
- **Styling**: Tailwind CSS

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review Vercel deployment logs
3. Check Neon database connectivity
4. Verify environment variables are correctly set

The application is now successfully migrated from Firebase to Neon + Vercel for better database management and easier deployment! 🚀