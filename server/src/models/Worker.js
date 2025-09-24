import mongoose from 'mongoose';

const WorkerSchema = new mongoose.Schema({
	name: { type: String, required: true, trim: true },
	phone: { type: String, required: true, unique: true, trim: true },
	address: { type: String, trim: true },
	joiningDate: { type: Date, required: true }
}, { timestamps: true });

export const Worker = mongoose.model('Worker', WorkerSchema);
