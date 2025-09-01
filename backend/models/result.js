const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  etudiant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
  score: Number,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Result', resultSchema);
