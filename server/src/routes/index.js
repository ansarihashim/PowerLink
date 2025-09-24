import { Router } from 'express';
import authRoutes from './auth.routes.js';
import workersRoutes from './workers.routes.js';
import loansRoutes from './loans.routes.js';
import installmentsRoutes from './installments.routes.js';
import expensesRoutes from './expenses.routes.js';
import baanaRoutes from './baana.routes.js';
import beamRoutes from './beam.routes.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/workers', requireAuth, workersRoutes);
router.use('/loans', requireAuth, loansRoutes);
router.use('/installments', requireAuth, installmentsRoutes);
router.use('/expenses', requireAuth, expensesRoutes);
router.use('/baana', requireAuth, baanaRoutes);
router.use('/beam', requireAuth, beamRoutes);

export default router;
