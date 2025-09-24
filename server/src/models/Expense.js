import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({
	date: { type: Date, required: true },
	category: { type: String, required: true },
	amount: { type: Number, required: true },
	notes: { type: String }
}, { timestamps: true });

export const Expense = mongoose.model('Expense', ExpenseSchema);
