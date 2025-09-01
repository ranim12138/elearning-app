const mongoose = require('mongoose');
const express = require('express')
const router = express.Router()
const Course = require('../models/Course')
const User = require('../models/user');


// === Créer un cours ===
router.post('/', async (req, res) => {
  try {
    const course = new Course(req.body)
    await course.save()
    res.status(201).json(course)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err })
  }
})

// === Récupérer tous les cours ===
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().populate('enseignant', 'name email')
    res.json(courses)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

/* 🔁 CORRECTION ICI : on place cette route AVANT /:id */
// === Cours auxquels l’étudiant est inscrit ===
router.get('/mescours/:userId', async (req, res) => {
  try {
    const userId = req.params.userId
    
    // Vérification de l'ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID utilisateur invalide' })
    }

    const courses = await Course.find({ inscrits: userId })
      .populate('enseignant', 'name email')
    res.json(courses)
  } catch (err) {
    console.error('Erreur dans /mescours/:userId 👉', err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// === Récupérer un seul cours + étudiants inscrits ===
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('enseignant', 'name email')
      .populate('inscrits', 'name email role')

    if (!course) return res.status(404).json({ message: 'Cours non trouvé' })

    res.json(course)
  } catch (err) {
    console.error('Erreur cours/:id 👉', err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})


// === Modifier un cours ===
router.put('/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!course) return res.status(404).json({ message: 'Cours non trouvé' })
    res.json(course)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// === Supprimer un cours ===
router.delete('/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id)
    if (!course) return res.status(404).json({ message: 'Cours non trouvé' })
    res.json({ message: 'Cours supprimé avec succès' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// === Inscrire un étudiant à un cours ===
router.post('/:id/inscrire', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
    if (!course) return res.status(404).json({ message: 'Cours non trouvé' })

    if (course.inscrits.includes(req.body.userId)) {
      return res.status(400).json({ message: 'Déjà inscrit à ce cours' })
    }

    course.inscrits.push(req.body.userId)
    await course.save()

    res.json({ message: 'Inscription réussie' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

module.exports = router
