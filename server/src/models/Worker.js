import mongoose from 'mongoose';

const WorkerSchema = new mongoose.Schema({
	name: { type: String, required: true, trim: true },
	phone: { type: String, required: true, unique: true, trim: true },
	address: { type: String, trim: true },
	joiningDate: { type: Date, required: true },
	photo: { type: String, trim: true }, // base64 / URL
	aadhaarNumber: { type: String, trim: true, unique: true, required: true },
}, { timestamps: true });

export const Worker = mongoose.model('Worker', WorkerSchema);
