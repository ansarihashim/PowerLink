import mongoose from 'mongoose';
import { Loan } from './Loan.js';
import { Installment } from './Installment.js';

const WorkerSchema = new mongoose.Schema({
	name: { type: String, required: true, trim: true },
	phone: { type: String, required: true, unique: true, trim: true },
	address: { type: String, trim: true },
	joiningDate: { type: Date, required: true }
}, { timestamps: true });

// Cascade delete loans and installments when a worker is removed via findOneAndDelete / findByIdAndDelete / deleteOne
WorkerSchema.pre(['findOneAndDelete','findOneAndRemove','deleteOne'], { document: false, query: true }, async function(next){
	try {
		const filter = this.getFilter();
		const doc = await this.model.findOne(filter).select('_id');
		if(!doc) return next();
		const workerId = doc._id;
		const loans = await Loan.find({ workerId }, '_id');
		const loanIds = loans.map(l => l._id);
		if (loanIds.length) await Installment.deleteMany({ loanId: { $in: loanIds } });
		if (loanIds.length) await Loan.deleteMany({ _id: { $in: loanIds } });
		next();
	} catch(err){ next(err); }
});

// Also handle direct document.remove() calls
WorkerSchema.pre('remove', async function(next){
	try {
		const workerId = this._id;
		const loans = await Loan.find({ workerId }, '_id');
		const loanIds = loans.map(l => l._id);
		if (loanIds.length) await Installment.deleteMany({ loanId: { $in: loanIds } });
		if (loanIds.length) await Loan.deleteMany({ _id: { $in: loanIds } });
		next();
	} catch(err){ next(err); }
});

export const Worker = mongoose.model('Worker', WorkerSchema);
