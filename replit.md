# Precedent - Next.js Project

## Overview
Precedent is an opinionated collection of components, hooks, and utilities for Next.js projects. This is a feature-rich starter template that includes authentication, beautiful UI components, and modern development tools.

## Project Architecture
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Animation**: Framer Motion
- **Authentication**: Clerk
- **Analytics**: Vercel Analytics
- **Package Manager**: pnpm

## Current State
✅ **Fully functional and ready for development**

- All dependencies installed
- Environment variables configured for Clerk authentication
- Development server running on port 5000
- Deployment configuration set up for production
- No LSP errors or build issues

## Key Features
- Beautiful, accessible UI components
- Built-in authentication system via Clerk
- Performance optimizations with Next.js primitives
- Responsive design with Tailwind CSS
- Custom hooks and utilities
- Analytics integration
- TypeScript for type safety

## Development Setup
- **Dev Server**: Runs on `http://localhost:5000`
- **Build Command**: `pnpm build`
- **Start Command**: `pnpm start`
- **Dependencies**: Managed with pnpm

## Environment Variables
Required for authentication:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` ✅ Configured
- `CLERK_SECRET_KEY` ✅ Configured

## Recent Changes
- **Project Import** (Today): Successfully imported from GitHub and configured for Replit environment
- **Dependencies**: All packages installed and up to date
- **Configuration**: Next.js configured for Replit hosting
- **Deployment**: Production deployment settings configured
- **Accent Handling** (Today): Implemented comprehensive French accent normalization system
  - Created textNormalization utility for handling accented characters (é → e, à → a, etc.)
  - Fixed Step 3 letter coloring to properly handle accented target words like "pétale"
  - Updated VerseEditor auto-classification to normalize all accented word lists
  - Game logic now uses normalized comparisons while preserving original spelling for display

## User Preferences
- Package manager: pnpm (as specified in project)
- Development approach: Following existing project conventions
- Authentication: Using Clerk as per original project setup