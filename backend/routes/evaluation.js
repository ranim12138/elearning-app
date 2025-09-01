const express = require('express');
const router = express.Router();
const Evaluation = require('../models/evaluation');
const EvaluationResult = require('../models/evaluationResult');

// === Créer une évaluation ===
router.post('/', async (req, res) => {
  try {
    const evaluation = new Evaluation(req.body);
    await evaluation.save();
    res.status(201).json(evaluation);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
});

// === Récupérer les évaluations d’un cours ===
router.get('/course/:courseId', async (req, res) => {
  try {
    const evaluations = await Evaluation.find({ course: req.params.courseId });
    res.json(evaluations);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// === Soumettre une évaluation (une seule tentative par étudiant) ===
router.post('/:evaluationId/soumettre', async (req, res) => {
  const { etudiantId, contenu, fichier } = req.body;
  try {
    // Vérifier si déjà soumis
    const existing = await EvaluationResult.findOne({
      evaluation: req.params.evaluationId,
      etudiant: etudiantId
    });
    if (existing) {
      return res.status(400).json({ message: 'Vous avez déjà soumis cette évaluation' });
    }

    // Créer la soumission
    const result = new EvaluationResult({
      evaluation: req.params.evaluationId,
      etudiant: etudiantId,
      contenu,
      fichier
    });
    await result.save();

    res.json({ message: 'Évaluation soumise' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


router.put('/corriger/:resultId', async (req, res) => {
  const { note, remarque } = req.body;
  try {
    const updated = await EvaluationResult.findByIdAndUpdate(
      req.params.resultId,
      { note, remarque },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


// === Voir toutes les soumissions d'une évaluation ===
router.get('/:evaluationId/results', async (req, res) => {
  try {
    const results = await EvaluationResult.find({ evaluation: req.params.evaluationId })
      .populate('etudiant', 'name email'); // ✅ ici le champ fichier est inclus par défaut
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


// === Voir la soumission d'un étudiant pour une évaluation ===
router.get('/:evaluationId/etudiant/:etudiantId', async (req, res) => {
  try {
    const result = await EvaluationResult.findOne({
      evaluation: req.params.evaluationId,
      etudiant: req.params.etudiantId
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


// === Supprimer une évaluation ===
router.delete('/:evaluationId', async (req, res) => {
  try {
    const deleted = await Evaluation.findByIdAndDelete(req.params.evaluationId);
    if (!deleted) {
      return res.status(404).json({ message: 'Évaluation non trouvée' });
    }
    res.json({ message: 'Évaluation supprimée avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


module.exports = router;
