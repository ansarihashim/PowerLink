import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.js';
import apiRoutes from './routes/index.js';
import { notFound, errorHandler } from './middlewares/error.js';

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(compression());
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Rate limit for auth endpoints
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/auth', authLimiter);

app.get('/', (req, res) => res.json({ message: 'PowerLink API', status: 'running', version: '1.0.0' }));
app.get('/api', (req, res) => res.json({ message: 'PowerLink API', status: 'running', endpoints: ['/api/health', '/api/auth', '/api/workers', '/api/loans', '/api/expenses', '/api/baana', '/api/beam'] }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
