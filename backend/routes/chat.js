// backend/routes/chat.js
const express = require('express');
const router = express.Router();
const Message = require('../models/message');

// Récupérer l'historique des messages entre deux utilisateurs
router.get('/:senderId/:receiverId', async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.params.senderId, receiver: req.params.receiverId },
        { sender: req.params.receiverId, receiver: req.params.senderId }
      ]
    }).sort('createdAt');
    
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;