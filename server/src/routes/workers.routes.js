import { Router } from 'express';
import { listWorkers, getWorker, createWorker, updateWorker, deleteWorker } from '../controllers/workers.controller.js';
import { requireWrite, requireDelete } from '../middlewares/auth.js';

const router = Router();
router.get('/', listWorkers);           // Read - no extra middleware needed
router.post('/', requireWrite, createWorker);      // Write permission required
router.get('/:id', getWorker);          // Read - no extra middleware needed
router.put('/:id', requireWrite, updateWorker);    // Write permission required
router.delete('/:id', requireDelete, deleteWorker); // Delete permission required
export default router;