const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
  etudiant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reponses: [{
    questionId: String,
    reponse: String
  }],
  score: Number, // ✅ champ score déjà présent
  dateSoumission: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QuizResult', quizResultSchema);
