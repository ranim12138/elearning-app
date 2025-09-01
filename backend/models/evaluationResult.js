const mongoose = require('mongoose');

const evaluationResultSchema = new mongoose.Schema({
  evaluation: { type: mongoose.Schema.Types.ObjectId, ref: 'Evaluation' },
  etudiant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  contenu: String, // texte de réponse
  fichier: String, // URL fichier si uploadé
  note: Number,
  remarque: String,
  dateSoumission: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EvaluationResult', evaluationResultSchema);
