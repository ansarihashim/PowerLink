import { Router } from 'express';
import { makeCrudController } from '../controllers/generic.controller.js';
import { Beam } from '../models/Beam.js';
import { requireWrite, requireDelete } from '../middlewares/auth.js';

const c = makeCrudController(Beam, { searchable: [], dateField: 'date' });
const router = Router();
router.get('/', c.list);                       // Read - no extra middleware needed
router.post('/', requireWrite, c.create);             // Write permission required
router.get('/:id', c.get);                     // Read - no extra middleware needed
router.put('/:id', requireWrite, c.update);           // Write permission required
router.delete('/:id', requireDelete, c.remove);       // Delete permission required
export default router;