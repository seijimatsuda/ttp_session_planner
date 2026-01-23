import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import { supabaseAdmin } from './config/supabase.js'

const app = express()

// CORS configuration - will be updated with actual frontend URL in production
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'soccer-session-planner-api'
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

// Test Supabase connection endpoint
app.get('/api/test-db', async (req: Request, res: Response) => {
  try {
    const { error } = await supabaseAdmin.from('_test').select('*').limit(1)
    // PGRST205 = table not found (expected for test), PGRST116 = no rows (also OK)
    if (error && error.code !== 'PGRST205' && error.code !== 'PGRST116' && error.code !== '42P01') {
      throw error
    }
    res.json({
      status: 'connected',
      message: 'Supabase connection successful'
    })
  } catch (err) {
    console.error('Supabase test error:', err)
    res.status(500).json({
      status: 'error',
      message: err instanceof Error ? err.message : 'Unknown error'
    })
  }
})

// Error handling middleware - Express 5 supports async errors natively
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

export default app
