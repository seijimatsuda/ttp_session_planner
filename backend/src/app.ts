import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import { supabaseAdmin } from './config/supabase.js'
import { mediaRouter } from './routes/media.js'

const app = express()

// CORS configuration - handles both local and production
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
].filter(Boolean)

// Media-specific CORS with Range headers exposed for iOS Safari video streaming
app.use('/api/media', cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.warn(`CORS blocked origin: ${origin}`)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length']
}))

// Mount media router after its CORS middleware
app.use('/api/media', mediaRouter)

// General CORS for other routes
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
      testDb: '/api/test-db',
      media: '/api/media/:bucket/:path'
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

// Debug endpoint to test storage access - REMOVE AFTER DEBUGGING
app.get('/api/debug/storage', async (req: Request, res: Response) => {
  try {
    // List buckets to verify storage access
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets()

    if (bucketsError) {
      res.json({
        status: 'error',
        stage: 'listBuckets',
        error: bucketsError
      })
      return
    }

    // Try to list files in drill-media bucket
    const { data: files, error: filesError } = await supabaseAdmin.storage
      .from('drill-media')
      .list('', { limit: 5 })

    if (filesError) {
      res.json({
        status: 'error',
        stage: 'listFiles',
        buckets: buckets?.map(b => b.name),
        error: filesError
      })
      return
    }

    res.json({
      status: 'ok',
      buckets: buckets?.map(b => b.name),
      sampleFiles: files?.slice(0, 5).map(f => f.name),
      message: 'Storage access working'
    })
  } catch (err) {
    res.status(500).json({
      status: 'exception',
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
