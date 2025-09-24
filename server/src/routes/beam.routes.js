import { Router } from 'express';
import { makeCrudController } from '../controllers/generic.controller.js';
import { Beam } from '../models/Beam.js';

const c = makeCrudController(Beam, { searchable: [], dateField: 'date' });
const router = Router();
router.get('/', c.list);
router.post('/', c.create);
router.get('/:id', c.get);
router.put('/:id', c.update);
router.delete('/:id', c.remove);
export default router;