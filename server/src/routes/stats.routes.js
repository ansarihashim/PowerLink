import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { Worker } from '../models/Worker.js';
import { Loan } from '../models/Loan.js';
import { Installment } from '../models/Installment.js';
import { Expense } from '../models/Expense.js';
import { Baana } from '../models/Baana.js';
import { Beam } from '../models/Beam.js';

const r = Router();

// GET /api/stats/summary
r.get('/summary', requireAuth, async (req,res,next) => {
  try {
    const [workerCount, loanAgg, instAgg, expAgg] = await Promise.all([
      Worker.countDocuments({}),
      Loan.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Installment.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
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