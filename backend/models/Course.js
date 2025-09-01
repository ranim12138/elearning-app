const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
  titre: String,
  description: String,
  niveau: String,
  categorie: String,
  enseignant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  inscrits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true })

module.exports = mongoose.model('Course', courseSchema)
