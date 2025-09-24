import { Worker } from '../models/Worker.js';
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
  const from = req.query.from ? new Date(req.query.from) : null;
  const to = req.query.to ? new Date(req.query.to) : null;
  if (from || to) filter.joiningDate = {};
  if (from) filter.joiningDate.$gte = from;
  if (to) filter.joiningDate.$lte = to;
  const sortBy = req.query.sortBy || 'joiningDate';
  const sortDir = (req.query.sortDir === 'asc') ? 1 : -1;
  const total = await Worker.countDocuments(filter);
  const rows = await Worker.find(filter)
    .sort({ [sortBy]: sortDir })
    .skip((page-1)*pageSize)
    .limit(pageSize)
    .lean();
  return ok(res, { data: rows, meta: { page, pageSize, total } });
}

export async function getWorker(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) return error(res, 'Invalid id', 'INVALID_ID', 400);
  const worker = await Worker.findById(req.params.id).lean();
  if (!worker) return error(res, 'Worker not found', 'NOT_FOUND', 404);
  return ok(res, { worker });
}

export async function createWorker(req, res) {
  try {
    const { name, phone, address, joiningDate } = req.body;
    if (!name || !phone || !address || !joiningDate) return error(res, 'Missing fields', 'VALIDATION_ERROR', 400);
    const exists = await Worker.findOne({ phone });
    if (exists) return error(res, 'Phone already exists', 'PHONE_EXISTS', 409);
    const worker = await Worker.create({ name, phone, address, joiningDate });
    return created(res, { worker });
  } catch (e) { return error(res, e.message); }
}

export async function updateWorker(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return error(res, 'Invalid id', 'INVALID_ID', 400);
    const { name, phone, address, joiningDate } = req.body;
    const worker = await Worker.findByIdAndUpdate(req.params.id, { name, phone, address, joiningDate }, { new: true });
    if (!worker) return error(res, 'Worker not found', 'NOT_FOUND', 404);
    return ok(res, { worker });
  } catch (e) { return error(res, e.message); }
}

export async function deleteWorker(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return error(res, 'Invalid id', 'INVALID_ID', 400);
    const worker = await Worker.findByIdAndDelete(req.params.id);
    if (!worker) return error(res, 'Worker not found', 'NOT_FOUND', 404);
    return res.status(204).send();
  } catch (e) { return error(res, e.message); }
}