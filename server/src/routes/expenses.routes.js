import { Router } from 'express';
import { makeCrudController } from '../controllers/generic.controller.js';
import { Expense } from '../models/Expense.js';
import { requireAuth } from '../middlewares/auth.js';
import mongoose from 'mongoose';

const c = makeCrudController(Expense, { searchable: ['category'], dateField: 'date' });
const router = Router();
router.get('/', c.list);
router.post('/', c.create);
// Expense comparison aggregation: /api/expenses/aggregate?from=YYYY-MM-DD&to=YYYY-MM-DD&group=month|day
router.get('/aggregate', requireAuth, async (req,res)=> {
	try {
		const from = req.query.from ? new Date(req.query.from) : null;
		const to = req.query.to ? new Date(req.query.to) : null;
		const group = req.query.group === 'day' ? 'day' : 'month';
		const match = {};
		if (from || to) {
			match.date = {};
			if (from) match.date.$gte = from;
			if (to) match.date.$lte = to;
		}
		const pipeline = [];
		if (Object.keys(match).length) pipeline.push({ $match: match });
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