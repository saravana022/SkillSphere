const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    domain: { type: String },
    assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assigned_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    points: { type: Number, default: 10 },
    deadline: { type: Date },
    status: { type: String, enum: ['pending', 'submitted', 'completed', 'rejected'], default: 'pending' },
    feedback: { type: String },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', taskSchema);
