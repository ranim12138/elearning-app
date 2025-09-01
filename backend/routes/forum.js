const express = require('express');
const router = express.Router();
const Forum = require('../models/forum');


// Créer un nouveau post avec catégorie
router.post('/', async (req, res) => {
  try {
    const forum = new Forum({
      titre: req.body.titre,
      contenu: req.body.contenu,
      auteur: req.body.auteurId,
      cours: req.body.courseId,
      categorie: req.body.categorie
    });
    
    await forum.save();
    res.status(201).json(forum);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
});

// Obtenir tous les posts avec filtrage par catégorie
router.get('/', async (req, res) => {
  try {
    const { categorie, cours } = req.query;
    const filter = {};
    
    if (categorie) filter.categorie = categorie;
    if (cours) filter.cours = cours;
    
    const forums = await Forum.find(filter)
      .populate('auteur', 'name role')
      .populate('cours', 'titre')
      .populate('reponses.auteur', 'name role')
      .sort({ date: -1 });
      
    res.json(forums);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Répondre à un post
router.post('/:id/repondre', async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.id);
    if (!forum) return res.status(404).json({ message: 'Post non trouvé' });

    forum.reponses.push({
      contenu: req.body.contenu,
      auteur: req.body.auteurId
    });

    await forum.save();
    res.json(forum);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Obtenir tous les posts
router.get('/', async (req, res) => {
  try {
    const forums = await Forum.find()
      .populate('auteur', 'name role')
      .populate('cours', 'titre')
      .populate('reponses.auteur', 'name role');
      
    res.json(forums);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer un post (admin)
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Forum.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Post non trouvé' });
    
    res.json({ message: 'Post supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Like/Dislike un post
router.post('/:postId/reaction', async (req, res) => {
  try {
    const { userId, action } = req.body; // 'like' or 'dislike'
    const post = await Forum.findById(req.params.postId);
    
    if (!post) return res.status(404).json({ message: 'Post non trouvé' });

    // Retirer les réactions précédentes
    post.likes = post.likes.filter(id => id.toString() !== userId);
    post.dislikes = post.dislikes.filter(id => id.toString() !== userId);

    // Ajouter la nouvelle réaction
    if (action === 'like') {
      post.likes.push(userId);
    } else if (action === 'dislike') {
      post.dislikes.push(userId);
    }

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Like/Dislike une réponse
router.post('/:postId/reponse/:reponseId/reaction', async (req, res) => {
  try {
    const { userId, action } = req.body;
    const post = await Forum.findById(req.params.postId);
    
    if (!post) return res.status(404).json({ message: 'Post non trouvé' });

    const reponse = post.reponses.id(req.params.reponseId);
    if (!reponse) return res.status(404).json({ message: 'Réponse non trouvée' });

    // Retirer les réactions précédentes
    reponse.likes = reponse.likes.filter(id => id.toString() !== userId);
    reponse.dislikes = reponse.dislikes.filter(id => id.toString() !== userId);

    // Ajouter la nouvelle réaction
    if (action === 'like') {
      reponse.likes.push(userId);
    } else if (action === 'dislike') {
      reponse.dislikes.push(userId);
    }

    await post.save();
    res.json(reponse);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;