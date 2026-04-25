# BJJ Compass

A training journal + technique tracker for Jiu-Jitsu practitioners. Track sessions, techniques, streaks, and dominate on the mats.

## Features

- **Log Training Sessions** - Track date, duration, type (gi/no-gi/mixed), and intensity
- **Technique Tracking** - Log techniques worked on from your focus areas
- **Session Streak Counter** - Stay accountable with daily streak tracking
- **Dashboard Stats** - Sessions this month, time invested, average intensity
- **Top Techniques** - See your most-used techniques
- **Pre-Roll Breathing** - Guided breathing animation to center yourself before training
- **Motivational Quotes** - Wisdom from BJJ legends
- **Session Notes** - Free-form notes for each session
- **Dark Theme** - Bold, aggressive BJJ aesthetic
- **Progressive Web App (PWA)** - Install on mobile/desktop like a native app
- **Offline Support** - Works without internet after first load

## Development

### Install dependencies
```bash
npm install
```

### Run development server
```bash
npm run dev
```

### Build for production
```bash
npm run build
```

## Deployment to Netlify

### Option 1: Deploy via Netlify UI

1. Push your code to GitHub (instructions below)
2. Go to [Netlify](https://app.netlify.com/)
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select your repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

### Option 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

When prompted:
- Build command: `npm run build`
- Publish directory: `dist`

## Git Setup and Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: BJJ Compass app"
git branch -M main
git remote add origin https://github.com/noahlimjj/bjj-compass.git
git push -u origin main
```

## Installing as a Mobile/Desktop App

This app can be installed directly on your device.

### On Mobile (iOS/Android)

**iPhone/iPad:**
1. Visit the deployed website in Safari
2. Tap the Share button (square with arrow pointing up)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" in the top right corner
5. The app will now appear on your home screen

**Android:**
1. Visit the deployed website in Chrome
2. Tap the three dots menu (⋮) in the top right
3. Tap "Add to Home Screen" or "Install App"
4. Tap "Add" or "Install"
5. The app will now appear on your home screen

### On Desktop

**Chrome/Edge:**
1. Visit the deployed website
2. Look for the install icon (⊕ or computer icon) in the address bar
3. Click it and select "Install"
4. Or go to the three dots menu → "Install BJJ Compass..."

**Safari (macOS):**
1. Visit the deployed website
2. Go to File → "Add to Dock"

### PWA Features

Once installed, the app will:
- Work offline (after first load)
- Open in its own window (no browser UI)
- Appear in your app launcher/dock
- Save your sessions locally (localStorage)
- Load instantly like a native app

## Tech Stack

- React 18
- Vite
- Progressive Web App (PWA) with Service Worker
- CSS3 with gradients and modern styling
- localStorage for data persistence
- Web App Manifest for installability
