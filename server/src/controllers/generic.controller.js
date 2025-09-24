import mongoose from 'mongoose';
import { error, ok, created } from '../utils/response.js';

function parsePagination(req) {
  const page = Math.max(1, parseInt(req.query.page)||1);
  const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize)||10));
  return { page, pageSize };
}

export function makeCrudController(Model, { searchable = [], dateField } = {}) {
  return {
    list: async (req, res) => {
      const { page, pageSize } = parsePagination(req);
      const q = (req.query.q || '').trim();
      const filter = {};
      if (q && searchable.length) {
        filter.$or = searchable.map(f => ({ [f]: { $regex: q, $options: 'i' } }));
      }
      if (dateField) {
        const from = req.query.from ? new Date(req.query.from) : null;
        const to = req.query.to ? new Date(req.query.to) : null;
        if (from || to) filter[dateField] = {};
        if (from) filter[dateField].$gte = from;
        if (to) filter[dateField].$lte = to;
      }
      const sortBy = req.query.sortBy || dateField || 'createdAt';
      const sortDir = (req.query.sortDir === 'asc') ? 1 : -1;
      const total = await Model.countDocuments(filter);
      const rows = await Model.find(filter)
        .sort({ [sortBy]: sortDir })
        .skip((page-1)*pageSize)
        .limit(pageSize)
        .lean();
      return ok(res, { data: rows, meta: { page, pageSize, total } });
    },
    get: async (req, res) => {
      if (!mongoose.isValidObjectId(req.params.id)) return error(res, 'Invalid id', 'INVALID_ID', 400);
      const doc = await Model.findById(req.params.id).lean();
      if (!doc) return error(res, 'Not found', 'NOT_FOUND', 404);
      return ok(res, { item: doc });
    },
    create: async (req, res) => {
      try {
        const doc = await Model.create(req.body);
        return created(res, { item: doc });
      } catch (e) { return error(res, e.message, 'VALIDATION_ERROR', 400); }
    },
    update: async (req, res) => {
      try {
        if (!mongoose.isValidObjectId(req.params.id)) return error(res, 'Invalid id', 'INVALID_ID', 400);
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!doc) return error(res, 'Not found', 'NOT_FOUND', 404);
        return ok(res, { item: doc });
      } catch (e) { return error(res, e.message); }
    },
    remove: async (req, res) => {
      try {
        if (!mongoose.isValidObjectId(req.params.id)) return error(res, 'Invalid id', 'INVALID_ID', 400);
        const doc = await Model.findByIdAndDelete(req.params.id);
        if (!doc) return error(res, 'Not found', 'NOT_FOUND', 404);
        return res.status(204).send();
      } catch (e) { return error(res, e.message); }
    }
  };
}