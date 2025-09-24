import mongoose from 'mongoose';

const LoanSchema = new mongoose.Schema({
	workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
	amount: { type: Number, required: true },
	loanDate: { type: Date, required: true },
	notes: { type: String }
}, { timestamps: true });

export const Loan = mongoose.model('Loan', LoanSchema);
