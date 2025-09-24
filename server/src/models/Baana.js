import mongoose from 'mongoose';

const BaanaSchema = new mongoose.Schema({
	date: { type: Date, required: true },
	sacks: { type: Number, required: true },
	notes: { type: String }
}, { timestamps: true });

export const Baana = mongoose.model('Baana', BaanaSchema);
