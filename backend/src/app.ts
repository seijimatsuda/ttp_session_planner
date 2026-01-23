import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'

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
      health: '/health'
    }
  })
})

// Error handling middleware - Express 5 supports async errors natively
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

export default app
