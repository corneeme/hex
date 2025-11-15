# GitHub Pages Deployment Guide

Your game is now configured to deploy to GitHub Pages! Here's how to enable it:

## Steps to Enable GitHub Pages

1. **Push changes to GitHub**
   ```bash
   git add .
   git commit -m "Setup GitHub Pages deployment"
   git push origin main
   ```

2. **Enable GitHub Pages in your repository**
   - Go to your repository on GitHub
   - Click **Settings** (top right)
   - Scroll down to **Pages** section
   - Under "Build and deployment":
     - Select **Source**: "GitHub Actions"
   - Done! GitHub will automatically build and deploy on every push to main

3. **Your site will be available at**
   - `https://corneeme.github.io/hex/`

## What's Been Set Up

- **GitHub Actions Workflow** (`.github/workflows/deploy.yml`)
  - Automatically builds the client when you push to `main`
  - Deploys the built files to GitHub Pages
  
- **Build Script** (`npm run build:client`)
  - Builds only the client code (React game)
  - Output goes to `dist/public/`

- **Base Path Configuration** (`vite.config.ts`)
  - Automatically uses `/hex/` as the base path for GitHub Pages
  - Ensures all assets load correctly from the subdirectory

## Backend API (Game Progress)

Your game currently has backend endpoints for saving/loading progress:
- `GET /api/progress/:sessionId`
- `POST /api/progress`
- `PUT /api/progress/:sessionId`

Since GitHub Pages only hosts static files, you'll need to:

### Option 1: Use a Serverless Backend (Recommended)
- Deploy backend to **Vercel**, **Netlify**, or **Render**
- Update your API calls in the client to point to the deployed backend
- Example: `https://your-backend.vercel.app/api/progress`

### Option 2: Use a Database Service with API
- Use **Firebase Realtime Database** or **Firestore**
- Use **Supabase** (PostgreSQL + REST API)
- Use **MongoDB Atlas** with a simple Cloud Function

### Option 3: Store Progress Locally
- Use browser **localStorage** or **IndexedDB**
- No backend needed - progress saved on each device

## Deploying the Backend (Optional)

If you want to keep the full-stack experience:

### Deploy to Vercel:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Render:
1. Push your repo to GitHub
2. Connect your repo to Render
3. Create a new Web Service
4. Set environment as Node
5. Build command: `npm install && npm run build`
6. Start command: `node dist/index.js`

## Troubleshooting

**Assets not loading?**
- Check that paths use relative URLs without leading `/`
- Vite automatically handles this with the base path config

**Game progress not saving?**
- You need to deploy the backend separately
- Configure your client to use the deployed backend URL

**Page not showing after deployment?**
- Wait a few minutes for the GitHub Actions workflow to complete
- Check the "Actions" tab in your repository for build status
- Check that GitHub Pages is enabled (Settings → Pages)

## Testing Locally

To test before pushing:
```bash
# Build client
npm run build:client

# Preview the built output
npx vite preview --host
```

This simulates how it will look when deployed.
