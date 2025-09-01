const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  titre: String,
  description: String,
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  enseignant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dateLimite: Date
}, { timestamps: true });

module.exports = mongoose.model('Evaluation', evaluationSchema);
  