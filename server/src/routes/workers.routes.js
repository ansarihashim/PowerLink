import { Router } from 'express';
import { listWorkers, getWorker, createWorker, updateWorker, deleteWorker } from '../controllers/workers.controller.js';

const router = Router();
router.get('/', listWorkers);
router.post('/', createWorker);
router.get('/:id', getWorker);
router.put('/:id', updateWorker);
router.delete('/:id', deleteWorker);
export default router;