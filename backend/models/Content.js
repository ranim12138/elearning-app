const mongoose = require('mongoose')

const contentSchema = new mongoose.Schema({
  type: { type: String, enum: ['document', 'video'], required: true },
  titre: String,
  description: String,
  fichier: String, // chemin du fichier (pas URL externe)
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  enseignant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true })

module.exports = mongoose.model('Content', contentSchema)
