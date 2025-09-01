const express = require('express')
const router = express.Router()
const Content = require('../models/Content')

// === Ajouter un contenu ===
router.post('/', async (req, res) => {
  try {
    const content = new Content(req.body)
    await content.save()
    res.status(201).json(content)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err })
  }
})

// === Afficher les contenus d’un cours ===
router.get('/course/:courseId', async (req, res) => {
  try {
    const contents = await Content.find({ course: req.params.courseId })
    res.json(contents)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// === Supprimer un contenu ===
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Content.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ message: 'Contenu non trouvé' })
    res.json({ message: 'Contenu supprimé avec succès' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

module.exports = router