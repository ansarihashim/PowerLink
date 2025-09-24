import { Router } from 'express';
import mongoose from 'mongoose';
import { Installment } from '../models/Installment.js';
import { Loan } from '../models/Loan.js';
import { error, ok, created } from '../utils/response.js';

function parsePagination(req) {
	const page = Math.max(1, parseInt(req.query.page)||1);
	const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize)||10));
	return { page, pageSize };
}

async function listInstallments(req, res) {
	const { page, pageSize } = parsePagination(req);
	const from = req.query.from ? new Date(req.query.from) : null;
	const to = req.query.to ? new Date(req.query.to) : null;
	const filter = {};
	if (from || to) filter.date = {};
	if (from) filter.date.$gte = from;
	if (to) filter.date.$lte = to;
	const sortBy = req.query.sortBy || 'date';
	const sortDir = req.query.sortDir === 'asc' ? 1 : -1;
	const total = await Installment.countDocuments(filter);
	const docs = await Installment.find(filter)
		.sort({ [sortBy]: sortDir })
		.skip((page-1)*pageSize)
		.limit(pageSize)
		.populate({ path: 'loanId', populate: { path: 'workerId', select: 'name' } });
	const data = docs.map(i => ({
		_id: i._id,
		loanId: i.loanId?._id,
		workerId: i.loanId?.workerId?._id,
		workerName: i.loanId?.workerId?.name,
		amount: i.amount,
		date: i.date,
		method: i.method,
		notes: i.notes
	}));
	return ok(res, { data, meta: { page, pageSize, total } });
}

async function getInstallment(req, res) {
	if (!mongoose.isValidObjectId(req.params.id)) return error(res, 'Invalid id', 'INVALID_ID', 400);
	const i = await Installment.findById(req.params.id).populate({ path: 'loanId', populate: { path: 'workerId', select: 'name' } });
	if (!i) return error(res, 'Not found', 'NOT_FOUND', 404);
	return ok(res, { installment: {
		_id: i._id,
		loanId: i.loanId?._id,
		workerId: i.loanId?.workerId?._id,
		workerName: i.loanId?.workerId?.name,
		amount: i.amount,
		date: i.date,
		method: i.method,
		notes: i.notes
	}});
}

async function createInstallment(req, res) {
	try {
		const { loanId, date, amount, method, notes } = req.body;
		if (!loanId || !date || !amount) return error(res, 'Missing fields', 'VALIDATION_ERROR', 400);
		// basic existence check
		const loan = await Loan.findById(loanId);
		if (!loan) return error(res, 'Loan not found', 'NOT_FOUND', 404);
		const inst = await Installment.create({ loanId, date, amount, method, notes });
		return created(res, { installment: inst });
	} catch (e) { return error(res, e.message, 'VALIDATION_ERROR', 400); }
}

async function updateInstallment(req, res) {
	try {
		if (!mongoose.isValidObjectId(req.params.id)) return error(res, 'Invalid id', 'INVALID_ID', 400);
		const { date, amount, method, notes } = req.body;
		const inst = await Installment.findByIdAndUpdate(req.params.id, { date, amount, method, notes }, { new: true });
		if (!inst) return error(res, 'Not found', 'NOT_FOUND', 404);
		return ok(res, { installment: inst });
	} catch (e) { return error(res, e.message); }
}

async function deleteInstallment(req, res) {
	try {
		if (!mongoose.isValidObjectId(req.params.id)) return error(res, 'Invalid id', 'INVALID_ID', 400);
		const inst = await Installment.findByIdAndDelete(req.params.id);
		if (!inst) return error(res, 'Not found', 'NOT_FOUND', 404);
		return res.status(204).send();
	} catch (e) { return error(res, e.message); }
}

const router = Router();
router.get('/', listInstallments);
router.post('/', createInstallment);
router.get('/:id', getInstallment);
router.put('/:id', updateInstallment);
router.delete('/:id', deleteInstallment);
export default router;