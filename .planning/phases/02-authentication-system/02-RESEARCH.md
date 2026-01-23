# Phase 2: Authentication System - Research

**Researched:** 2026-01-22
**Domain:** Supabase Auth with React SPA
**Confidence:** HIGH

## Summary

Authentication in a React SPA with Supabase Auth uses the `@supabase/supabase-js` client library (not `@supabase/ssr`, which is for SSR frameworks). The standard pattern involves creating an AuthContext to manage session state using `onAuthStateChange`, implementing protected routes with React Router v6's `<Outlet>` component, and handling loading states to prevent flash of unauthenticated content (FOUC).

The core flow: Initialize Supabase client → Create AuthProvider with session state → Listen to auth events with `onAuthStateChange` → Wrap protected routes with a component that renders `<Outlet>` when authenticated or `<Navigate to="/login">` when not → Use `signUp()` and `signInWithPassword()` for authentication → Use `getUser()` for secure user verification.

Critical insight: Never use `onAuthStateChange` with async callbacks or call other Supabase methods inside the callback—this causes deadlocks. Always unsubscribe on component unmount. Client-side auth is for UX only; server-side validation is required for actual security.

**Primary recommendation:** Use `@supabase/supabase-js` with React Context for auth state, implement protected routes using the Outlet pattern, handle loading states with a dedicated `isLoading` flag, and always verify auth server-side.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | Latest (2.x+) | Core Supabase client for SPAs | Official library, handles auth, storage, and DB; uses localStorage for sessions in browser-only apps |
| React | 18+ | UI framework | Already in tech stack; Context API for auth state |
| React Router | v6+ | Routing with protected routes | Standard React router; Outlet component simplifies protected route patterns |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| N/A | - | No additional libraries needed | Supabase and React built-ins handle all auth requirements |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @supabase/supabase-js | @supabase/ssr | Only use SSR package if building SSR framework (Next.js, Astro, SvelteKit); for React SPA, stick with supabase-js |
| React Context | Zustand/Redux | Context API is sufficient for auth state; avoid over-engineering unless app already uses state library |
| Protected Route component | Route guards/HOCs | Outlet pattern is cleaner and more maintainable in React Router v6+ |

**Installation:**
```bash
npm install @supabase/supabase-js
# React Router v6+ should already be installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   └── supabase.ts           # Supabase client initialization
├── contexts/
│   └── AuthContext.tsx       # Auth state management
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx     # Login UI
│   │   ├── SignupForm.tsx    # Signup UI
│   │   └── ProtectedRoute.tsx # Route wrapper
│   └── layout/
│       └── Layout.tsx        # App layout (optional)
├── pages/
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   └── DashboardPage.tsx     # Protected page example
└── App.tsx                    # Routes configuration
```

### Pattern 1: Supabase Client Initialization
**What:** Create a singleton Supabase client using environment variables
**When to use:** Once at app initialization
**Example:**
```typescript
// Source: https://supabase.com/docs/guides/auth/quickstarts/react
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### Pattern 2: AuthContext with Session Management
**What:** React Context managing auth state with `onAuthStateChange` listener
**When to use:** Wrap entire app to provide global auth state
**Example:**
```typescript
// Source: https://supabase.com/docs/guides/getting-started/tutorials/with-react
// Combined with best practices from https://supabase.com/docs/reference/javascript/auth-onauthstatechange
import { createContext, useContext, useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  session: Session | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  isLoading: true
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setIsLoading(false)
    })

    // Listen for auth changes
    // CRITICAL: Do NOT use async callback or call other Supabase methods here
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setIsLoading(false)
      }
    )

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ session, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### Pattern 3: Protected Routes with Outlet
**What:** Route wrapper that checks auth and renders children or redirects
**When to use:** Wrap all routes requiring authentication
**Example:**
```typescript
// Source: https://www.robinwieruch.de/react-router-private-routes/
// and https://fireship.dev/react-router-protected-routes-authentication
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function ProtectedRoute() {
  const { session, isLoading } = useAuth()
  const location = useLocation()

  // Show loading state while checking auth
  if (isLoading) {
    return <div>Loading...</div> // Or a proper loading component
  }

  // Redirect to login if not authenticated, preserving intended destination
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Render child routes
  return <Outlet />
}
```

**Usage in App.tsx:**
```typescript
// Source: Pattern from https://medium.com/@dennisivy/creating-protected-routes-with-react-router-v6-2c4bbaf7bc1c
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            {/* Add more protected routes here */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
```

### Pattern 4: Login Form with Error Handling
**What:** Email/password login form using `signInWithPassword`
**When to use:** Login page
**Example:**
```typescript
// Source: https://supabase.com/docs/reference/javascript/auth-signinwithpassword
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setIsLoading(false)

    if (error) {
      setError(error.message)
    } else {
      // Redirect to intended page or dashboard
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Log in'}
      </button>
    </form>
  )
}
```

### Pattern 5: Signup Form with Email Confirmation
**What:** Email/password signup using `signUp` with confirmation handling
**When to use:** Signup page
**Example:**
```typescript
// Source: https://supabase.com/docs/reference/javascript/auth-signup
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setMessage(null)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin, // Redirect after confirmation
      },
    })

    setIsLoading(false)

    if (error) {
      setError(error.message)
    } else if (data.session) {
      // Email confirmation disabled - user logged in immediately
      setMessage('Account created successfully!')
    } else {
      // Email confirmation enabled - user needs to check email
      setMessage('Check your email to confirm your account!')
    }
  }

  return (
    <form onSubmit={handleSignup}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
        minLength={6}
      />
      {error && <div className="error">{error}</div>}
      {message && <div className="message">{message}</div>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Signing up...' : 'Sign up'}
      </button>
    </form>
  )
}
```

### Pattern 6: Logout Functionality
**What:** Sign out user and redirect to login
**When to use:** Navigation bar or user menu
**Example:**
```typescript
// Source: https://supabase.com/docs/guides/auth/quickstarts/react
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function LogoutButton() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return <button onClick={handleLogout}>Log out</button>
}
```

### Anti-Patterns to Avoid
- **Async callbacks in `onAuthStateChange`:** Causes deadlocks and race conditions. Keep callbacks synchronous.
- **Calling Supabase methods inside `onAuthStateChange`:** Leads to infinite loops. If needed, use `setTimeout(..., 0)` to defer.
- **Not unsubscribing from `onAuthStateChange`:** Memory leaks and stale listeners. Always return cleanup function.
- **Using `getSession()` for authorization:** Not secure on server. Use `getUser()` to verify with auth server.
- **No loading state:** Causes flash of unauthenticated content. Always track `isLoading`.
- **Forgetting to check email confirmation settings:** Behavior changes based on Supabase project config. Handle both cases.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JWT token refresh | Custom refresh logic with timers | `supabase.auth.getSession()` | Automatically refreshes expired tokens; handles race conditions across tabs with LockManager API |
| Session persistence | localStorage/cookie management | Supabase client built-in | Client handles storage automatically; switching storage mediums requires client config, not custom code |
| Auth state synchronization | Custom event emitters across components | React Context + `onAuthStateChange` | Supabase emits events across tabs; Context distributes to components; custom solutions miss edge cases |
| Password validation | Custom regex and rules | Supabase Auth config + client-side hints | Server enforces password policies; client validation is UX only; rolling your own misses security updates |
| Protected route logic | Custom route guards or HOCs | React Router v6 Outlet pattern | Outlet is built for this; custom solutions are more code and less maintainable |

**Key insight:** Supabase Auth handles complex token management, session synchronization, and security edge cases. Custom solutions introduce bugs and security vulnerabilities. Use the framework's patterns.

## Common Pitfalls

### Pitfall 1: Async Callbacks in `onAuthStateChange`
**What goes wrong:** Using async functions as callbacks to `onAuthStateChange` causes deadlocks and race conditions where auth state gets stuck.
**Why it happens:** The auth state change handler isn't designed to wait for async operations; concurrent state changes conflict.
**How to avoid:** Keep callbacks synchronous. If you need to perform async operations (like fetching user data), defer them with `setTimeout(() => { async_operation() }, 0)`.
**Warning signs:** Auth state not updating, login appearing to hang, multiple rapid auth events.

### Pitfall 2: Calling Supabase Methods Inside `onAuthStateChange`
**What goes wrong:** Calling `supabase.auth.*` or other Supabase methods inside the auth change callback creates infinite loops or deadlocks.
**Why it happens:** Supabase methods can trigger new auth state changes, creating circular dependencies.
**How to avoid:** Extract session/user data from the callback parameters. Never make new Supabase calls inside the callback. If absolutely necessary, defer with `setTimeout`.
**Warning signs:** Browser hanging, infinite re-renders, auth state oscillating.

### Pitfall 3: Not Handling Loading States
**What goes wrong:** Flash of unauthenticated content (FOUC) where protected pages briefly show before redirect, or users see "not logged in" message while session is being loaded.
**Why it happens:** `getSession()` is async; initial render happens before session is retrieved.
**How to avoid:** Add `isLoading` state that's `true` initially, set to `false` after session check completes. Show loading UI while `isLoading === true`.
**Warning signs:** Flickering UI on page load, brief flash of login page before redirecting to dashboard.

### Pitfall 4: Using `getSession()` for Server-Side Authorization
**What goes wrong:** Trusting session data from `getSession()` on the server allows attackers to forge sessions because it only validates JWT locally.
**Why it happens:** Developers assume `getSession()` is secure everywhere; it's only safe on client.
**How to avoid:** Always use `getUser()` for server-side authorization checks—it validates with the auth server.
**Warning signs:** Security audits flag weak auth, users accessing data they shouldn't.

### Pitfall 5: Forgetting to Unsubscribe from `onAuthStateChange`
**What goes wrong:** Memory leaks, stale listeners firing after component unmounts, causing errors or unexpected behavior.
**Why it happens:** React `useEffect` requires cleanup; forgetting to unsubscribe leaves listener active.
**How to avoid:** Always return cleanup function from `useEffect`: `return () => subscription.unsubscribe()`.
**Warning signs:** Memory usage growing over time, errors after navigating away from pages, duplicate auth events.

### Pitfall 6: Hardcoding Redirect After Login
**What goes wrong:** Users redirected to dashboard after login even when they tried to access a specific protected page.
**Why it happens:** Login handler always navigates to `/dashboard` instead of preserving original destination.
**How to avoid:** Save intended location in `Navigate`'s state: `<Navigate to="/login" state={{ from: location }} />`, then redirect to `location.state?.from?.pathname || '/dashboard'`.
**Warning signs:** Poor UX, users complaining about losing their place after login.

### Pitfall 7: Exposing Service Role Key on Client
**What goes wrong:** Service role key bypasses Row Level Security (RLS) and grants full database access; exposing it on client is catastrophic security breach.
**Why it happens:** Confusion between `anon` (public) key and `service_role` (admin) key.
**How to avoid:** Only use `SUPABASE_PUBLISHABLE_DEFAULT_KEY` (or `anon` key) on client. Keep `service_role` key server-side only, never in `.env` files committed to git.
**Warning signs:** Security scans flagging exposed secrets, unauthorized data access.

### Pitfall 8: Ignoring Email Confirmation Settings
**What goes wrong:** App assumes user is logged in immediately after signup, but session is null because email confirmation is enabled.
**Why it happens:** Supabase projects can have email confirmation on or off; developers test with one config and deploy with another.
**How to avoid:** Check both `data.session` and `data.user` after `signUp()`. Show appropriate message: "Check your email" vs "Account created, you're logged in."
**Warning signs:** Users reporting they can't log in after signing up, confusion about email confirmation.

## Code Examples

Verified patterns from official sources:

### Environment Variables Setup
```bash
# .env.local
# Source: https://supabase.com/docs/guides/auth/quickstarts/react
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key
```

### Complete AuthContext Implementation
```typescript
// src/contexts/AuthContext.tsx
// Source: Compiled from official Supabase docs
import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  session: Session | null
  user: User | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setIsLoading(false)
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    session,
    user: session?.user ?? null,
    isLoading,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
```

### Protected Route with Loading State
```typescript
// src/components/auth/ProtectedRoute.tsx
// Source: Compiled from React Router v6 best practices
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function ProtectedRoute() {
  const { session, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="loading-container">
        <div>Loading...</div>
      </div>
    )
  }

  return session ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  )
}
```

### Complete App.tsx with Routes
```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| @supabase/auth-helpers-react | @supabase/supabase-js for SPAs, @supabase/ssr for SSR | 2024 | Auth helpers deprecated; use supabase-js directly for React SPAs |
| Manual token refresh logic | `getSession()` auto-refresh | Always standard | Developers wasted time on token management; now built-in |
| HOCs for protected routes | Outlet pattern in React Router v6 | React Router v6 release (2021) | Cleaner, more declarative route protection |
| Class components with lifecycle methods | Hooks (`useEffect`, `useState`) | React 16.8+ (2019) | Simpler auth state management in functional components |
| Environment keys: `ANON_KEY` | `PUBLISHABLE_DEFAULT_KEY` | Recent Supabase update (2024-2025) | Improved naming clarity; both work currently |

**Deprecated/outdated:**
- `@supabase/auth-helpers-react`: Replaced by using `@supabase/supabase-js` directly for SPAs
- `@supabase/auth-helpers-*`: All framework-specific helpers consolidated into `@supabase/ssr` for SSR frameworks only
- Manual JWT decoding for user info: Use `session.user` from Supabase client
- `getClaims()` for user identity in browser: Use `getUser()` for secure verification, but on client `session.user` is acceptable

## Open Questions

1. **Email Confirmation Configuration**
   - What we know: Supabase projects can enable/disable email confirmation; behavior of `signUp()` changes accordingly
   - What's unclear: Need to check the specific Supabase project settings in Phase 1
   - Recommendation: Handle both cases in UI—check if `data.session` exists after signup to determine if user is logged in immediately or needs to check email

2. **Password Requirements**
   - What we know: Supabase enforces password policies configured in project settings
   - What's unclear: Specific password requirements for this project (min length, complexity)
   - Recommendation: Check Supabase project auth settings and add client-side validation hints matching those requirements

3. **Session Duration and Refresh**
   - What we know: `getSession()` automatically refreshes tokens; Supabase handles this
   - What's unclear: Default session expiration time for the project
   - Recommendation: Review Supabase project JWT expiry settings; default is likely fine for MVP

## Sources

### Primary (HIGH confidence)
- Supabase Official Docs - Auth Quickstart React: https://supabase.com/docs/guides/auth/quickstarts/react
- Supabase Official Docs - React Tutorial: https://supabase.com/docs/guides/getting-started/tutorials/with-react
- Supabase Official Docs - Server-Side Client Creation: https://supabase.com/docs/guides/auth/server-side/creating-a-client
- Supabase API Reference - onAuthStateChange: https://supabase.com/docs/reference/javascript/auth-onauthstatechange
- Supabase API Reference - signUp: https://supabase.com/docs/reference/javascript/auth-signup
- Supabase API Reference - signInWithPassword: https://supabase.com/docs/reference/javascript/auth-signinwithpassword
- Supabase API Reference - getSession: https://supabase.com/docs/reference/javascript/auth-getsession
- Supabase API Reference - getUser: https://supabase.com/docs/reference/javascript/auth-getuser
- GitHub Discussion - @supabase/supabase-js vs @supabase/ssr: https://github.com/orgs/supabase/discussions/28997

### Secondary (MEDIUM confidence)
- React Router Protected Routes Pattern (Robin Wieruch): https://www.robinwieruch.de/react-router-private-routes/
- Protected Routes with React Router (Fireship): https://fireship.dev/react-router-protected-routes-authentication
- Supabase Common Mistakes (Hrekov): https://hrekov.com/blog/supabase-common-mistakes
- Medium - Creating Protected Routes in React Router v6: https://medium.com/@dennisivy/creating-protected-routes-with-react-router-v6-2c4bbaf7bc1c

### Tertiary (LOW confidence - WebSearch only)
- Various blog posts and tutorials from LogRocket, OpenReplay, and community sources confirming patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Supabase docs explicitly recommend @supabase/supabase-js for SPAs
- Architecture: HIGH - Patterns verified in official documentation and widely adopted in community
- Pitfalls: HIGH - Documented in official API reference (e.g., onAuthStateChange warnings) and reputable sources

**Research date:** 2026-01-22
**Valid until:** 2026-02-22 (30 days - stable library, but auth best practices evolve)
