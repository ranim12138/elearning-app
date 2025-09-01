const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  correctAnswer: String
});

const quizSchema = new mongoose.Schema({
  titre: String,
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  questions: [questionSchema],
  enseignant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
  