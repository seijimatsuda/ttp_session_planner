# Phase 1: Project Setup & Infrastructure - Research

**Researched:** 2026-01-22
**Domain:** Full-stack TypeScript web application setup (Vite + React + Express + Supabase)
**Confidence:** HIGH

## Summary

This phase involves setting up a modern full-stack TypeScript application with strict type checking, production-ready tooling, and deployment pipelines. The standard approach in 2026 is to use Vite for frontend builds (replacing Create React App), Express.js 5 for backend (now stable), Tailwind CSS v4 with its new Vite plugin architecture, and Supabase for database/auth with proper SSR client configuration.

The key technical challenges are: proper TypeScript configuration across frontend and backend, environment variable management across three deployment targets (local, Vercel, Render), CORS configuration between separately-deployed services, and correct Supabase client setup for both browser and server contexts.

Modern best practices emphasize strict TypeScript from day one, ES modules (not CommonJS), and deploying frontend/backend separately rather than monorepo deployments. Tailwind v4 significantly simplifies configuration compared to v3, and Supabase now requires @supabase/ssr for any server-side usage.

**Primary recommendation:** Scaffold with official tools (npm create vite@latest, npx tsc --init), use strict TypeScript configurations, configure CORS early, and set environment variables through platform dashboards rather than .env files in production.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vite | 5.x+ | Frontend build tool | Replaces CRA, 5x faster builds, native ESM, HMR out of box |
| React | 18.x+ | Frontend framework | Industry standard, concurrent features, TypeScript support |
| @vitejs/plugin-react | 5.1.2 | React integration for Vite | Official plugin, enables Fast Refresh and JSX transform |
| TypeScript | 5.x+ | Type system | Strict mode catches errors at compile time, required for scale |
| Tailwind CSS | 4.x | Utility-first CSS | v4 has 5x faster builds, zero-config, automatic content detection |
| @tailwindcss/vite | latest | Tailwind v4 Vite plugin | First-party plugin, replaces PostCSS setup from v3 |
| Express.js | 5.x | Backend framework | Stable as of Oct 2024, native Promise support, security fixes |
| Supabase | Latest | Database + Auth + Storage | Postgres with RLS, built-in auth, real-time, storage included |
| @supabase/supabase-js | 2.90.1+ | Supabase client library | Core client for browser and server |
| @supabase/ssr | 0.8.0+ | SSR helpers for Supabase | Required for server-side auth, replaces deprecated auth-helpers |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| tsx | latest | TypeScript executor | Development - runs TS files directly without build step |
| @types/node | latest | Node.js type definitions | All Node.js projects using TypeScript |
| @types/express | latest | Express type definitions | Express + TypeScript projects |
| cors | latest | CORS middleware | When frontend/backend on different domains (Vercel/Render) |
| @types/cors | latest | CORS type definitions | TypeScript projects using cors package |
| dotenv | latest | Environment variable loader | Local development only, not for production |
| concurrently | latest | Run multiple scripts | Optional: run frontend + backend simultaneously in dev |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vite | Webpack | Webpack is slower, more configuration, but more mature plugin ecosystem |
| Tailwind v4 | Tailwind v3 | v3 requires PostCSS setup, tailwind.config.js, content globs - v4 simpler |
| Express.js | Fastify/Hono | Faster but less ecosystem maturity, Express has most middleware/examples |
| Supabase | Firebase | Firebase vendor lock-in, Supabase is open-source Postgres |
| Separate deploys | Monorepo | Monorepo adds complexity (Turborepo/Nx), separate repos simpler for this scale |
| Render | Railway/Fly.io | Similar features, Render has better free tier and simpler setup |

**Installation:**

Frontend:
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install tailwindcss @tailwindcss/vite @supabase/supabase-js @supabase/ssr
```

Backend:
```bash
mkdir backend && cd backend
npm init -y
npm install express@5
npm install -D typescript @types/node @types/express tsx @types/cors cors dotenv
npx tsc --init
```

## Architecture Patterns

### Recommended Project Structure - Frontend (Vite + React)
```
frontend/
├── public/              # Static assets (favicon, etc.)
├── src/
│   ├── assets/          # Images, fonts
│   ├── components/      # Reusable UI components
│   ├── lib/             # Utility functions and Supabase client
│   │   └── supabase.ts  # Browser Supabase client
│   ├── pages/           # Route components
│   ├── types/           # TypeScript interfaces
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css        # @import "tailwindcss"
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
└── package.json
```

### Recommended Project Structure - Backend (Express + TypeScript)
```
backend/
├── src/
│   ├── config/          # Configuration (database, environment)
│   │   └── supabase.ts  # Server Supabase client
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Custom middleware (auth, error handling)
│   ├── routes/          # Route definitions
│   ├── services/        # Business logic
│   ├── types/           # TypeScript interfaces
│   ├── utils/           # Helper functions
│   ├── app.ts           # Express app setup
│   └── server.ts        # HTTP server startup
├── dist/                # Compiled JavaScript (gitignored)
├── tsconfig.json
└── package.json
```

### Pattern 1: Vite Configuration for React + TypeScript + Tailwind
**What:** Configure Vite with React plugin and Tailwind v4 plugin
**When to use:** Always - this is the standard setup for the tech stack
**Example:**
```typescript
// vite.config.ts
// Source: https://vite.dev/guide/ + https://tailwindcss.com/docs/guides/vite
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      // Optional: proxy API calls to backend in development
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})
```

```css
/* src/index.css */
/* Source: https://tailwindcss.com/docs/guides/vite */
@import "tailwindcss";
```

### Pattern 2: TypeScript Strict Configuration
**What:** Enable strict mode with modern module resolution for both frontend and backend
**When to use:** Always - catches errors at compile time, required for production apps
**Example:**
```json
// Frontend tsconfig.json
// Source: https://medium.com/@robinviktorsson/complete-guide-to-setting-up-react-with-typescript-and-vite-2025-468f6556aaf2
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

```json
// Backend tsconfig.json
// Source: https://www.reactsquad.io/blog/how-to-set-up-express-5-in-2025
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Pattern 3: Supabase Client Setup (Browser vs Server)
**What:** Different client initialization for browser (frontend) vs server (backend)
**When to use:** Always when using Supabase - browser client for frontend, server client for backend
**Example:**
```typescript
// Frontend: src/lib/supabase.ts
// Source: https://supabase.com/docs/guides/auth/server-side/creating-a-client
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

```typescript
// Backend: src/config/supabase.ts
// Source: https://supabase.com/docs/guides/auth/server-side/creating-a-client
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for admin operations

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// For user-specific operations, use anon key with user's JWT
export const createSupabaseClient = (accessToken: string) => {
  return createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY!, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  })
}
```

### Pattern 4: Express.js 5 App Setup with TypeScript
**What:** Modern Express setup with ES modules, Promise-based middleware, CORS
**When to use:** Always - this is the baseline Express 5 + TypeScript setup
**Example:**
```typescript
// src/app.ts
// Source: https://www.reactsquad.io/blog/how-to-set-up-express-5-in-2025
import express from 'express'
import cors from 'cors'

const app = express()

// CORS configuration - critical for Vercel + Render setup
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// API routes
// app.use('/api', routes)

// Error handling middleware - Express 5 supports async errors
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

export default app
```

```typescript
// src/server.ts
import app from './app.js'

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

```json
// package.json - ES modules configuration
{
  "type": "module",
  "main": "dist/server.js",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

### Pattern 5: Environment Variables Configuration
**What:** Different handling for local dev vs Vercel vs Render
**When to use:** Always - proper env var management is critical for deployment
**Example:**
```bash
# Frontend .env.local (local dev only, gitignored)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_API_URL=http://localhost:3000

# Backend .env (local dev only, gitignored)
PORT=3000
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

**Production configuration:**
- **Vercel**: Add via Project Settings > Environment Variables (prefix client vars with VITE_)
- **Render**: Add via Dashboard > Environment tab (use secrets for sensitive data)
- **CRITICAL**: Never commit .env files, always use platform dashboards for production

### Anti-Patterns to Avoid
- **Using .env files in production:** Vercel and Render don't read .env files - use their dashboards
- **Not enabling TypeScript type checking in build:** Vite doesn't check types by default - add `tsc && vite build`
- **Using CommonJS in new projects:** Express 5 + modern tools work better with ES modules ("type": "module")
- **Wildcard CORS in production:** Always specify exact frontend origin, never use "*" with credentials
- **Using @supabase/auth-helpers:** Deprecated - use @supabase/ssr instead
- **Hardcoding URLs:** Use environment variables for all external URLs (API, Supabase, etc.)
- **Service role key in frontend:** NEVER expose service_role key to browser - it bypasses RLS
- **Not separating concerns in Express:** Keep business logic in services, not controllers

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CORS middleware | Custom header setters | cors package | Handles preflight, credentials, methods, complex origins correctly |
| Environment variables in production | Reading .env files | Platform dashboards (Vercel/Render) | .env files aren't read in production, values need redeployment |
| TypeScript execution in dev | ts-node or manual builds | tsx | 10x faster, better ESM support, watch mode built-in |
| Supabase server client | Manual JWT handling | @supabase/ssr helpers | Cookie management, token refresh, SSR patterns |
| File watching and rebuilds | nodemon with tsc | tsx watch | Faster, single tool, no build step needed |
| Multi-tenant data isolation | Application-level filtering | Supabase RLS policies | Database-level security, can't be bypassed, tested by Postgres |
| API request proxying in dev | Custom proxy | Vite's server.proxy config | Built-in, handles WebSocket upgrade, zero setup |

**Key insight:** Infrastructure setup has well-established tooling. Custom solutions introduce bugs (CORS edge cases, env var precedence, TypeScript module resolution). Use official tools and packages that handle edge cases you haven't thought of yet.

## Common Pitfalls

### Pitfall 1: TypeScript Errors Not Caught Until CI/CD
**What goes wrong:** Vite doesn't type-check during development or builds by default. Code runs locally but fails in CI.
**Why it happens:** Vite transpiles TypeScript to JavaScript without type checking for speed. Developers assume errors would show during build.
**How to avoid:**
- Add type checking to build script: `"build": "tsc --noEmit && vite build"`
- Use vite-plugin-checker for dev-time type checking
- Add `tsc --noEmit` as a separate npm script for manual checks
**Warning signs:**
- Code works locally but CI fails with "TS2345: Argument of type..."
- No TypeScript errors in terminal during development

### Pitfall 2: Environment Variables Not Available in Production
**What goes wrong:** App works locally but crashes on Vercel/Render with "undefined" errors for env vars.
**Why it happens:**
- Frontend: Forgot VITE_ prefix, so Vite doesn't expose the variable
- Vercel/Render: .env files aren't read in production, need to use platform dashboards
- Forgot to redeploy after adding new env var
**How to avoid:**
- Frontend vars must start with VITE_ to be exposed by Vite
- Add all env vars through Vercel/Render dashboards
- Remember: env var changes require redeployment
- Use `import.meta.env.VITE_*` in frontend, `process.env.*` in backend
**Warning signs:**
- TypeError: Cannot read property of undefined
- "ReferenceError: process is not defined" in browser console

### Pitfall 3: CORS Errors Between Vercel and Render
**What goes wrong:** Frontend on Vercel can't make requests to backend on Render, browser shows CORS error.
**Why it happens:**
- CORS middleware not installed or configured
- Using wildcard "*" origin with credentials: true (not allowed)
- Forgot to include credentials in fetch requests
- Trailing slash mismatch (https://example.com vs https://example.com/)
**How to avoid:**
- Install cors package: `npm install cors @types/cors`
- Set exact frontend origin: `cors({ origin: process.env.FRONTEND_URL, credentials: true })`
- Include credentials in fetch: `fetch(url, { credentials: 'include' })`
- Match URLs exactly (including trailing slashes)
**Warning signs:**
- "Access to fetch at ... from origin ... has been blocked by CORS policy"
- Request works in Postman but not in browser

### Pitfall 4: Supabase RLS Policies Not Enabled
**What goes wrong:** Users can access other users' data, or service_role key bypasses all security.
**Why it happens:**
- RLS not enabled on tables
- Policies written but RLS toggle is off
- Using service_role key from frontend (bypasses RLS)
- Testing with service_role key and assuming RLS works
**How to avoid:**
- Enable RLS on all tables from day one
- Use anon key in frontend, service_role only in backend for admin operations
- Test policies by connecting as actual users, not with service_role
- Add tenant_id or user_id columns, index them, use in policies
**Warning signs:**
- Users can see data they shouldn't
- Policies exist but don't seem to work
- Security audit shows data leakage

### Pitfall 5: Using Deprecated Supabase Auth Helpers
**What goes wrong:** Following old tutorials that use @supabase/auth-helpers-nextjs or similar packages.
**Why it happens:** Many tutorials from 2023-2024 use deprecated auth-helpers packages. Documentation updated but old content remains online.
**How to avoid:**
- Always use @supabase/ssr (consolidated package as of 2024)
- Check Supabase docs migration guide
- Verify tutorial/article date - if before mid-2024, check for updates
**Warning signs:**
- Installing @supabase/auth-helpers-* packages
- Deprecation warnings in npm install

### Pitfall 6: Node.js Version Mismatch
**What goes wrong:** App runs locally on Node 18 but fails on Render/Vercel using Node 22, or vice versa.
**Why it happens:**
- Express 5 requires Node.js 18+
- Vite 5+ requires Node.js 18+
- Local environment uses different version than deployment
**How to avoid:**
- Add "engines" field to package.json: `"engines": { "node": ">=18.0.0" }`
- Use nvm locally to match production version
- Check Vercel/Render default Node version, set explicitly if needed
**Warning signs:**
- "Error: The engine 'node' is incompatible with this module"
- Works locally but deployment fails with cryptic errors

### Pitfall 7: TypeScript Path Aliases Not Working After Build
**What goes wrong:** Import aliases like `@/components/Button` work in dev but break in production build.
**Why it happens:**
- tsconfig.json has path aliases but vite.config.ts doesn't
- Backend path aliases configured in tsconfig but not resolved by Node.js at runtime
**How to avoid:**
- Frontend: Add resolve.alias to vite.config.ts to match tsconfig paths
- Backend: Either avoid path aliases or use tsconfig-paths package
- Keep it simple: relative imports are more reliable
**Warning signs:**
- Build succeeds but runtime errors: "Cannot find module '@/...'"
- Dev works but production shows module not found

## Code Examples

Verified patterns from official sources:

### Scaffolding New Projects
```bash
# Frontend
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install tailwindcss @tailwindcss/vite
npm install @supabase/supabase-js @supabase/ssr

# Backend
mkdir backend && cd backend
npm init -y
npm install express@5
npm install -D typescript @types/node @types/express @types/cors tsx
npm install cors dotenv
npx tsc --init
```

### Tailwind v4 Setup
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

```css
/* src/index.css */
@import "tailwindcss";
```

### Express 5 Async Error Handling
```typescript
// Source: https://expressjs.com/2025/03/31/v5-1-latest-release.html
// Express 5 natively catches rejected promises from async route handlers

app.get('/users/:id', async (req, res) => {
  // If this promise rejects, Express 5 catches it automatically
  const user = await db.getUserById(req.params.id)
  res.json(user)
})

// No need for try/catch or .catch() - Express 5 handles it
```

### Fetch with Credentials for CORS
```typescript
// Frontend making authenticated request to backend
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/data`, {
  method: 'POST',
  credentials: 'include', // Critical for CORS with cookies
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data)
})
```

### Render Deployment Configuration
```json
// package.json - Backend
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "tsx watch src/server.ts"
  }
}
```

**Render Dashboard Settings:**
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Environment Variables: Add through dashboard (PORT auto-set to 10000)

### Vercel Deployment Configuration
```json
// vercel.json (optional - Vercel auto-detects Vite)
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

**Vercel Environment Variables:**
- Must prefix with VITE_ for client exposure
- Set through Project Settings > Environment Variables
- Select environment: Production, Preview, Development

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Create React App | Vite | 2023+ | 10x faster builds, native ESM, better DX |
| Tailwind v3 with PostCSS | Tailwind v4 with Vite plugin | Late 2024 | No tailwind.config.js needed, 5x faster builds |
| @supabase/auth-helpers-* | @supabase/ssr | Mid 2024 | Single package for all frameworks, better maintained |
| Express.js 4 | Express.js 5 | Oct 2024 (stable) | Native async/await, Promise error handling, security fixes |
| ts-node | tsx | 2023+ | 10x faster TypeScript execution, better ESM support |
| CommonJS | ES Modules | 2024+ (Express 5) | Native Node.js support, better tree-shaking, modern standard |
| webpack | Vite/Rollup | 2022+ | Faster dev server, simpler config, better HMR |

**Deprecated/outdated:**
- **Create React App:** No longer maintained, Vite is the recommended replacement
- **@supabase/auth-helpers packages:** Replaced by @supabase/ssr
- **Tailwind v3 PostCSS setup:** v4 uses Vite plugin, no PostCSS config needed
- **ts-node:** tsx is faster and has better ESM support
- **Express 4 with callback error handling:** Express 5 handles Promise rejections natively
- **vercel.json for simple Vite apps:** Auto-detection works, config rarely needed

## Open Questions

Things that couldn't be fully resolved:

1. **Monorepo vs Separate Repos**
   - What we know: This project uses separate repos (frontend/, backend/). Monorepo with pnpm workspaces and shared types is possible but adds complexity (Turborepo, Nx, or pnpm workspaces).
   - What's unclear: Whether future phases will need shared TypeScript types between frontend/backend, which would benefit from monorepo.
   - Recommendation: Start with separate repos as planned. If type sharing becomes critical, can migrate to monorepo later or use git submodules for shared types package.

2. **Video Streaming Proxy Implementation**
   - What we know: Backend needs to proxy video streaming with Range request support for iOS. express-range library exists but unclear if it's the best solution.
   - What's unclear: Best practice for implementing Range request proxying in Express 5 with Supabase Storage.
   - Recommendation: Research this in Phase 5 (Video Management) when implementing the feature. Supabase Storage supports Range requests directly, so backend may just need to forward headers correctly.

3. **Database Migration Strategy**
   - What we know: Supabase supports migrations via CLI or dashboard. Multi-tenant RLS needs proper setup from start.
   - What's unclear: Whether to use Supabase CLI migrations or dashboard for schema changes during development.
   - Recommendation: Start with dashboard for initial schema (faster prototyping), switch to CLI migrations when schema stabilizes (version control, team collaboration).

## Sources

### Primary (HIGH confidence)
- Vite official docs: https://vite.dev/guide/
- Tailwind CSS v4 with Vite: https://tailwindcss.com/docs/guides/vite
- Supabase SSR docs: https://supabase.com/docs/guides/auth/server-side/creating-a-client
- Express.js 5 release: https://expressjs.com/2025/03/31/v5-1-latest-release.html
- Vercel environment variables: https://vercel.com/docs/environment-variables
- Render Express deployment: https://render.com/docs/deploy-node-express-app

### Secondary (MEDIUM confidence)
- [Complete Guide to Setting Up React with TypeScript and Vite (2026)](https://medium.com/@robinviktorsson/complete-guide-to-setting-up-react-with-typescript-and-vite-2025-468f6556aaf2)
- [How to Set Up Express 5 For Production In 2025](https://www.reactsquad.io/blog/how-to-set-up-express-5-in-2025)
- [How to Set Up TailwindCSS in a React + Vite Project (2026 Edition)](https://medium.com/@fasihuddin102/how-to-set-up-tailwindcss-in-a-react-vite-project-2025-edition-999e0541a493)
- [Supabase Error Codes](https://supabase.com/docs/guides/auth/debugging/error-codes)
- [Multi-Tenant Applications with RLS on Supabase](https://www.antstack.com/blog/multi-tenant-applications-with-rls-on-supabase-postgress/)
- [Best Practices for Supabase](https://www.leanware.co/insights/supabase-best-practices)

### Tertiary (LOW confidence)
- [Express TypeScript project structure best practices](https://medium.com/@narendran.a.i/building-a-robust-express-js-backend-with-typescript-a-step-by-step-guide-84cb57d6e5bd) - General patterns, not version-specific
- [Vercel CORS handling community discussions](https://community.vercel.com/t/different-ways-to-handle-cors-on-vercel/5127) - Community suggestions, not official

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All versions verified from npm registry and official docs (Jan 2026)
- Architecture: HIGH - Patterns sourced from official documentation and recent production guides
- Pitfalls: MEDIUM-HIGH - Based on official troubleshooting docs, recent community issues, and established patterns

**Research date:** 2026-01-22
**Valid until:** 2026-02-22 (30 days - relatively stable stack, but monitor for Vite 6, Tailwind CSS updates)
