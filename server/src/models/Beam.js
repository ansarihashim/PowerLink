import mongoose from 'mongoose';

const BeamSchema = new mongoose.Schema({
	date: { type: Date, required: true },
	bunches: { type: Number, required: true },
	notes: { type: String }
}, { timestamps: true });

export const Beam = mongoose.model('Beam', BeamSchema);
