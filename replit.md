# Monster Hunter - Idle Game

## Overview

Monster Hunter is a 3D idle/incremental game built with React Three Fiber where players fight endless waves of enemies. The game features a persistent upgrade system using death currency, allowing players to purchase permanent upgrades through a skill tree. Players control a character that moves on a grid-based arena, battling enemies with the help of pets. The game includes multiple phases (menu, playing, death, skill tree) and supports both manual movement and auto-attack mechanics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework Stack:**
- React 18 with TypeScript for UI components
- React Three Fiber (R3F) for 3D rendering and game scene management
- Three.js as the underlying 3D graphics library
- Vite as the build tool and development server

**State Management:**
- Zustand with subscribeWithSelector middleware for global game state
- Local storage integration for persistence of death currency and skill tree purchases
- Separate stores for different concerns (game state, audio, monster game logic)

**Styling & UI:**
- Tailwind CSS for utility-first styling
- Radix UI primitives for accessible component foundations
- shadcn/ui component library for pre-built UI components
- Custom CSS variables for theming (supports dark mode)

**3D Rendering:**
- Canvas-based rendering with React Three Fiber
- Custom 3D game objects (Player, Enemy, Pet, GridPlane)
- Shadow mapping and lighting effects
- Camera positioned at [0, 15, 20] with 50° FOV for isometric-style view

**Game Loop:**
- useFrame hook from R3F for animation and game logic updates
- Raycasting for mouse click-to-move mechanics
- Real-time position interpolation for smooth movement
- Frame-based enemy spawning and combat calculations

### Backend Architecture

**Server Framework:**
- Express.js for HTTP server and API routing
- TypeScript with ESM modules
- Vite middleware integration for development hot-reloading

**Storage Layer:**
- In-memory storage implementation (MemStorage class)
- Interface-based design (IStorage) allowing future database integration
- Currently implements basic user CRUD operations
- Database schema defined with Drizzle ORM for future PostgreSQL integration

**API Design:**
- RESTful API endpoints prefixed with `/api`
- Request/response logging middleware for debugging
- JSON body parsing and URL-encoded form support
- Error handling middleware with status code normalization

**Development vs Production:**
- Development: Vite dev server with HMR
- Production: Static file serving from dist/public
- Separate build processes for client and server bundles

### External Dependencies

**Database:**
- Drizzle ORM configured for PostgreSQL
- Neon Database serverless driver (@neondatabase/serverless)
- Schema location: `./shared/schema.ts`
- Migrations directory: `./migrations`
- Currently using in-memory storage with planned PostgreSQL migration

**UI Component Libraries:**
- Radix UI (30+ primitive components for accessibility)
- cmdk for command palette functionality
- class-variance-authority for component variant management
- tailwind-merge and clsx for className utilities

**3D Graphics:**
- @react-three/fiber - React renderer for Three.js
- @react-three/drei - Useful helpers and abstractions for R3F
- @react-three/postprocessing - Post-processing effects
- vite-plugin-glsl - GLSL shader support
- Support for GLTF/GLB 3D models and audio files

**State & Data Fetching:**
- Zustand for client-side state management
- TanStack Query (React Query) for server state management
- Local storage utilities for persistence

**Development Tools:**
- tsx for running TypeScript server in development
- esbuild for production server bundling
- drizzle-kit for database migrations and schema management
- @replit/vite-plugin-runtime-error-modal for development error overlay

**Build Configuration:**
- Path aliases: `@/*` → `./client/src/*`, `@shared/*` → `./shared/*`
- TypeScript strict mode enabled
- ESNext module resolution with bundler strategy
- Asset handling for 3D models (.gltf, .glb) and audio files (.mp3, .ogg, .wav)