import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { Worker } from '../models/Worker.js';
import { Loan } from '../models/Loan.js';
import { Installment } from '../models/Installment.js';
import { Expense } from '../models/Expense.js';
import { Baana } from '../models/Baana.js';
import { Beam } from '../models/Beam.js';

const r = Router();

// GET /api/stats/summary?from=yyyy-mm-dd&to=yyyy-mm-dd
r.get('/summary', requireAuth, async (req,res,next) => {
  try {
    const { from, to } = req.query;
    const dateFilter = (field) => {
      if (!from && !to) return {};
      const range = {};
      if (from) range.$gte = new Date(from);
      if (to) {
        const dt = new Date(to);
        dt.setHours(23,59,59,999);
        range.$lte = dt;
      }
      return { [field]: range };
    };

    const [workerCount, loanAgg, instAgg, expAgg] = await Promise.all([
      Worker.countDocuments(from || to ? { ...dateFilter('joiningDate') } : {}),
      Loan.aggregate([
        { $match: { ...(from||to? dateFilter('loanDate'): {}) } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Installment.aggregate([
        { $match: { ...(from||to? dateFilter('date'): {}) } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: { ...(from||to? dateFilter('date'): {}) } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const latestBaana = await Baana.findOne().sort({ date: -1 }).lean();
    const latestBeam = await Beam.findOne().sort({ date: -1 }).lean();

    res.json({
      workers: workerCount,
      loansIssued: loanAgg[0]?.total || 0,
      installmentsReceived: instAgg[0]?.total || 0,
      expenses: expAgg[0]?.total || 0,
      lastBaanaDate: latestBaana?.date || null,
      lastBeamDate: latestBeam?.date || null
    });
  } catch(err){ next(err); }
});

export default r;