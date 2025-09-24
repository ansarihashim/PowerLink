import { Router } from 'express';
import { makeCrudController } from '../controllers/generic.controller.js';
import { Baana } from '../models/Baana.js';

const c = makeCrudController(Baana, { searchable: [], dateField: 'date' });
const router = Router();
router.get('/', c.list);
router.post('/', c.create);
router.get('/:id', c.get);
router.put('/:id', c.update);
router.delete('/:id', c.remove);
export default router;