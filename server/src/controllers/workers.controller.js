import { Worker } from '../models/Worker.js';
import { Loan } from '../models/Loan.js';
import { Installment } from '../models/Installment.js';
import { error, ok, created } from '../utils/response.js';
import mongoose from 'mongoose';

function parsePagination(req) {
  const page = Math.max(1, parseInt(req.query.page)||1);
  const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize)||10));
  return { page, pageSize };
}

export async function listWorkers(req, res) {
  const { page, pageSize } = parsePagination(req);
  const q = (req.query.q || '').trim().toLowerCase();
  const filter = {};
  if (q) filter.$or = [
    { name: { $regex: q, $options: 'i' } },
    { phone: { $regex: q, $options: 'i' } },
    { address: { $regex: q, $options: 'i' } }
  ];
  const sortBy = req.query.sortBy || 'joiningDate';
  const sortDir = (req.query.sortDir === 'asc') ? 1 : -1;
  const total = await Worker.countDocuments(filter);
  const rows = await Worker.find(filter)
    .sort({ [sortBy]: sortDir })
    .skip((page-1)*pageSize)
    .limit(pageSize)
    .lean();

  // Compute loan stats for displayed workers only for efficiency
  const workerIds = rows.map(w => w._id);
  if (workerIds.length) {
    const loanAgg = await Loan.aggregate([
      { $match: { workerId: { $in: workerIds } } },
      { $lookup: { from: 'installments', localField: '_id', foreignField: 'loanId', as: 'installments' } },
      { $addFields: { paid: { $sum: '$installments.amount' } } },
      { $project: { workerId: 1, amount: 1, paid: 1 } }
    ]);
    const map = {};
    loanAgg.forEach(l => {
      const wid = l.workerId.toString();
      if (!map[wid]) map[wid] = { totalLoan: 0, totalPaid: 0 };
      map[wid].totalLoan += l.amount || 0;
      map[wid].totalPaid += l.paid || 0;
    });
    rows.forEach(r => {
      const stat = map[r._id.toString()] || { totalLoan: 0, totalPaid: 0 };
      r.totalLoan = stat.totalLoan;
      r.remainingLoan = Math.max(0, stat.totalLoan - stat.totalPaid);
    });
  }

  return ok(res, { data: rows, meta: { page, pageSize, total } });
}

export async function getWorker(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) return error(res, 'Invalid id', 'INVALID_ID', 400);
  const worker = await Worker.findById(req.params.id).lean();
  if (!worker) return error(res, 'Worker not found', 'NOT_FOUND', 404);

  // Aggregate loans & installments for this worker
  const loans = await Loan.find({ workerId: worker._id }).lean();
  let totalLoan = 0;
  const loanIds = loans.map(l => { totalLoan += l.amount || 0; return l._id; });
  let totalPaid = 0;
  if (loanIds.length) {
    const paidAgg = await Installment.aggregate([
      { $match: { loanId: { $in: loanIds } } },
      { $group: { _id: '$loanId', paid: { $sum: '$amount' } } }
    ]);
    const paidMap = Object.fromEntries(paidAgg.map(p => [p._id.toString(), p.paid]));
    loans.forEach(l => { l.paid = paidMap[l._id.toString()] || 0; l.remaining = Math.max(0, (l.amount||0) - l.paid); totalPaid += l.paid; });
  }
  const remainingLoan = Math.max(0, totalLoan - totalPaid);

  // Gather all installments for those loans
  let installments = [];
  if (loanIds.length) {
    const instDocs = await Installment.find({ loanId: { $in: loanIds } }).sort({ date: -1 }).lean();
    installments = instDocs.map(i => ({ _id: i._id, loanId: i.loanId, amount: i.amount, date: i.date, method: i.method, notes: i.notes }));
  }

  return ok(res, { worker: { ...worker, totalLoan, remainingLoan, loans, installments } });
}

export async function createWorker(req, res) {
  try {
  const { name, phone, address, joiningDate, photo, aadhaarNumber } = req.body;
  if (!name || !phone || !address || !joiningDate || !aadhaarNumber) return error(res, 'Missing fields', 'VALIDATION_ERROR', 400);
    const cleanPhone = String(phone).replace(/[^0-9]/g,'');
    if (cleanPhone.length !== 10) return error(res, 'Phone must be exactly 10 digits', 'PHONE_LEN', 400);
    const exists = await Worker.findOne({ phone: cleanPhone });
    if (exists) return error(res, 'Phone already exists', 'PHONE_EXISTS', 409);
    if (aadhaarNumber) {
      const aExists = await Worker.findOne({ aadhaarNumber });
      if (aExists) return error(res, 'Aadhaar already exists', 'AADHAAR_EXISTS', 409);
    }
    const worker = await Worker.create({ name, phone: cleanPhone, address, joiningDate, photo, aadhaarNumber });
    return created(res, { worker });
  } catch (e) { return error(res, e.message); }
}

export async function updateWorker(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return error(res, 'Invalid id', 'INVALID_ID', 400);
  const { name, phone, address, joiningDate, photo, aadhaarNumber } = req.body;
    // Uniqueness checks when updating
    let cleanPhone;
    if (phone) {
      cleanPhone = String(phone).replace(/[^0-9]/g,'');
      if (cleanPhone.length !== 10) return error(res, 'Phone must be exactly 10 digits', 'PHONE_LEN', 400);
      const phoneExists = await Worker.findOne({ phone: cleanPhone, _id: { $ne: req.params.id } });
      if (phoneExists) return error(res, 'Phone already exists', 'PHONE_EXISTS', 409);
    }
    if (aadhaarNumber) {
      const aExists = await Worker.findOne({ aadhaarNumber, _id: { $ne: req.params.id } });
      if (aExists) return error(res, 'Aadhaar already exists', 'AADHAAR_EXISTS', 409);
    } else return error(res, 'Missing fields', 'VALIDATION_ERROR', 400);
    const update = { name, address, joiningDate, photo, aadhaarNumber };
    if (cleanPhone) update.phone = cleanPhone;
    const worker = await Worker.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!worker) return error(res, 'Worker not found', 'NOT_FOUND', 404);
    return ok(res, { worker });
  } catch (e) { return error(res, e.message); }
}

export async function deleteWorker(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return error(res, 'Invalid id', 'INVALID_ID', 400);
    // Attempt simple sequential cascade (works on standalone + replica set)
    const worker = await Worker.findById(req.params.id);
    if (!worker) return error(res, 'Worker not found', 'NOT_FOUND', 404);
    const loans = await Loan.find({ workerId: worker._id }, '_id');
    const loanIds = loans.map(l => l._id);
    if (loanIds.length) await Installment.deleteMany({ loanId: { $in: loanIds } });
    if (loanIds.length) await Loan.deleteMany({ _id: { $in: loanIds } });
    await Worker.deleteOne({ _id: worker._id });
    return res.status(204).send();
  } catch (e) { return error(res, e.message); }
}