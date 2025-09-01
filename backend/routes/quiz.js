const express = require('express');
const router = express.Router();
const Quiz = require('../models/quiz');
const Result = require('../models/result'); // ✅ utilise Result partout

// === Créer un quiz ===
router.post('/', async (req, res) => {
  try {
    const quiz = new Quiz(req.body);
    await quiz.save();
    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
});

// === Récupérer les quiz d’un cours ===
router.get('/course/:courseId', async (req, res) => {
  try {
    const quizzes = await Quiz.find({ course: req.params.courseId });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// === Passer un quiz ===
router.post('/:quizId/passer', async (req, res) => {
  const { etudiantId, reponses } = req.body;
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz non trouvé' });

    // Vérifier si l'étudiant a déjà passé ce quiz
    const existing = await Result.findOne({ etudiant: etudiantId, quiz: quiz._id });
    if (existing) {
      return res.status(400).json({ message: 'Vous avez déjà passé ce quiz' });
    }

    // Correction automatique
    let score = 0;
    quiz.questions.forEach(q => {
      const r = reponses.find(r => r.questionId == q._id.toString());
      if (r && r.reponse === q.correctAnswer) score++;
    });

    // Enregistrer le résultat
    const result = new Result({
      etudiant: etudiantId,
      quiz: quiz._id,
      reponses,
      score
    });
    await result.save();

    res.json({ message: 'Quiz soumis', score });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// === Voir résultats d’un étudiant ===
router.get('/results/:etudiantId', async (req, res) => {
  try {
    const results = await Result.find({ etudiant: req.params.etudiantId })
      .populate('quiz', 'titre');
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// === Voir tous les résultats d’un quiz ===
router.get('/:quizId/results', async (req, res) => {
  try {
    const results = await Result.find({ quiz: req.params.quizId })
      .populate('etudiant', 'name email'); // ✅ affiche nom + email étudiant
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// === Supprimer un quiz ===
router.delete('/:quizId', async (req, res) => {
  try {
    const deleted = await Quiz.findByIdAndDelete(req.params.quizId);
    if (!deleted) {
      return res.status(404).json({ message: 'Quiz non trouvé' });
    }
    res.json({ message: 'Quiz supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


module.exports = router;
