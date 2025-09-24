import mongoose from 'mongoose';

const InstallmentSchema = new mongoose.Schema({
	loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
	date: { type: Date, required: true },
	amount: { type: Number, required: true },
	method: { type: String },
	notes: { type: String }
}, { timestamps: true });

export const Installment = mongoose.model('Installment', InstallmentSchema);
