import { Router } from 'express';
import mongoose from 'mongoose';
import { Loan } from '../models/Loan.js';
import { Installment } from '../models/Installment.js';
import { error, ok, created } from '../utils/response.js';

function parsePagination(req) {
	const page = Math.max(1, parseInt(req.query.page)||1);
	const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize)||10));
	return { page, pageSize };
}

async function listLoans(req, res) {
	const { page, pageSize } = parsePagination(req);
	const from = req.query.from ? new Date(req.query.from) : null;
	const to = req.query.to ? new Date(req.query.to) : null;
	const filter = {};
	if (req.query.workerId) filter.workerId = req.query.workerId;
	if (from || to) filter.loanDate = {};
	if (from) filter.loanDate.$gte = from;
	if (to) filter.loanDate.$lte = to;
	const sortBy = req.query.sortBy || 'loanDate';
	const sortDir = req.query.sortDir === 'asc' ? 1 : -1;

	const total = await Loan.countDocuments(filter);
	const loans = await Loan.find(filter)
		.sort({ [sortBy]: sortDir })
		.skip((page-1)*pageSize)
		.limit(pageSize)
		.populate('workerId', 'name');

	const loanIds = loans.map(l => l._id);
	const sums = await Installment.aggregate([
		{ $match: { loanId: { $in: loanIds } } },
		{ $group: { _id: '$loanId', paid: { $sum: '$amount' } } }
	]);
	const paidMap = Object.fromEntries(sums.map(s => [s._id.toString(), s.paid]));
	const data = loans.map(l => {
		const paid = paidMap[l._id.toString()] || 0;
		return {
			_id: l._id,
			workerId: l.workerId?._id,
			workerName: l.workerId?.name,
			amount: l.amount,
			loanDate: l.loanDate,
			notes: l.notes,
			remaining: Math.max(0, l.amount - paid)
		};
	});
	return ok(res, { data, meta: { page, pageSize, total } });
}

async function getLoan(req, res) {
	if (!mongoose.isValidObjectId(req.params.id)) return error(res, 'Invalid id', 'INVALID_ID', 400);
	const loan = await Loan.findById(req.params.id).populate('workerId','name');
	if (!loan) return error(res, 'Not found', 'NOT_FOUND', 404);
	const paid = await Installment.aggregate([
		{ $match: { loanId: loan._id } },
		{ $group: { _id: null, paid: { $sum: '$amount' } } }
	]);
	const remaining = loan.amount - (paid[0]?.paid || 0);
	return ok(res, { loan: {
		_id: loan._id,
		workerId: loan.workerId?._id,
		workerName: loan.workerId?.name,
		amount: loan.amount,
		loanDate: loan.loanDate,
		notes: loan.notes,
		remaining
	}});
}

async function createLoan(req, res) {
	try {
		const { workerId, amount, loanDate, notes } = req.body;
		if (!workerId || !amount || !loanDate) return error(res, 'Missing fields', 'VALIDATION_ERROR', 400);
		const loan = await Loan.create({ workerId, amount, loanDate, notes });
		return created(res, { loan });
	} catch (e) { return error(res, e.message, 'VALIDATION_ERROR', 400); }
}

async function updateLoan(req, res) {
	try {
		if (!mongoose.isValidObjectId(req.params.id)) return error(res, 'Invalid id', 'INVALID_ID', 400);
		const { amount, loanDate, notes } = req.body;
		const loan = await Loan.findByIdAndUpdate(req.params.id, { amount, loanDate, notes }, { new: true });
		if (!loan) return error(res, 'Not found', 'NOT_FOUND', 404);
		return ok(res, { loan });
	} catch (e) { return error(res, e.message); }
}

async function deleteLoan(req, res) {
	try {
		if (!mongoose.isValidObjectId(req.params.id)) return error(res, 'Invalid id', 'INVALID_ID', 400);
		const del = await Loan.findByIdAndDelete(req.params.id);
		if (!del) return error(res, 'Not found', 'NOT_FOUND', 404);
		// Cascade remove installments for this loan to avoid orphans
		await Installment.deleteMany({ loanId: del._id });
		return res.status(204).send();
	} catch (e) { return error(res, e.message); }
}
const router = Router();
router.get('/', listLoans);
router.post('/', createLoan);
router.get('/:id', getLoan);
router.put('/:id', updateLoan);
router.delete('/:id', deleteLoan);
export default router;