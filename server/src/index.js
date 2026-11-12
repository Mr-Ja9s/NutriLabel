import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import dishRoutes from './routes/dishRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const MONGODB_URI = process.env.MONGODB_URI;

// Trust reverse proxy for deployment on Render, Heroku, or Cloudflare
app.set('trust proxy', 1);

// Configure allowed CORS origins
const allowedOrigins = CLIENT_ORIGIN.includes(',')
  ? CLIENT_ORIGIN.split(',').map((o) => o.trim())
  : [CLIENT_ORIGIN];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes('*') ||
        (origin && origin.endsWith('.vercel.app'))
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

// Rate limiter: 60 requests per minute per IP on /api
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute per IP
  standardHeaders: true, // Return standard RateLimit-* headers
  legacyHeaders: false, // Disable legacy X-RateLimit-* headers
  message: {
    error: 'Too many requests from this IP, please try again after a minute.',
  },
});

// JSON body parser
app.use(express.json());

// Apply rate limiting to all /api routes
app.use('/api', apiLimiter);

// Health check endpoint
// Returns { ok: true } to verify the server is running and accessible
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Mount dish and nutrition estimation routes
app.use('/api', dishRoutes);

// Mount admin management routes (protected by x-admin-password header)
app.use('/api/admin', adminRoutes);

// Optional MongoDB connection (won't crash the server if DB is temporarily offline)
const isDirectRun = process.argv[1] && (process.argv[1].endsWith('src/index.js') || process.argv[1].endsWith('src\\index.js'));

if (isDirectRun && MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB successfully.');
    })
    .catch((err) => {
      console.warn('MongoDB connection warning:', err.message);
      console.warn('The server is still running, and /api/health is operational.');
    });
}

// Start HTTP server only if executed directly
if (isDirectRun && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`NutriLabel Server listening on http://localhost:${PORT}`);
  });
}

export default app;

