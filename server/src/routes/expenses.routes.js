import { Router } from 'express';
import { makeCrudController } from '../controllers/generic.controller.js';
import { Expense } from '../models/Expense.js';
import { requireAuth } from '../middlewares/auth.js';
import mongoose from 'mongoose';

const c = makeCrudController(Expense, { searchable: ['category'], dateField: 'date' });
const router = Router();
router.get('/', c.list);
router.post('/', c.create);
// Expense comparison aggregation: /api/expenses/aggregate?group=month|day
router.get('/aggregate', requireAuth, async (req,res)=> {
	try {
		const group = req.query.group === 'day' ? 'day' : 'month';
		const pipeline = [];
		pipeline.push({
			$group: {
				_id: group === 'day' ? {
					y: { $year: '$date' }, m: { $month: '$date' }, d: { $dayOfMonth: '$date' }
				} : {
					y: { $year: '$date' }, m: { $month: '$date' }
				},
				total: { $sum: '$amount' }
			}
		});
		pipeline.push({ $sort: { '_id.y': 1, '_id.m': 1, ...(group==='day'? {'_id.d':1}: {}) } });
		const rows = await Expense.aggregate(pipeline);
		return res.json({ data: rows });
	} catch(e){ return res.status(500).json({ message: e.message }); }
});
router.get('/:id', c.get);
router.put('/:id', c.update);
router.delete('/:id', c.remove);
export default router;