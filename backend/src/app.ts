import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import { supabaseAdmin } from './config/supabase.js'

const app = express()

// CORS configuration - handles both local and production
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.warn(`CORS blocked origin: ${origin}`)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint (Render uses this)
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'soccer-session-planner-api',
    environment: process.env.NODE_ENV || 'development'
  })
})

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Soccer Session Planner API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      testDb: '/api/test-db'
    }
  })
})

// Database connection test
app.get('/api/test-db', async (req: Request, res: Response) => {
  try {
    const { error } = await supabaseAdmin.from('_test').select('*').limit(1)
    if (error && error.code !== '42P01' && error.code !== 'PGRST116') {
      throw error
    }
    res.json({
      status: 'connected',
      message: 'Supabase connection successful'
    })
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err instanceof Error ? err.message : 'Unknown error'
    })
  }
})

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

export default app
