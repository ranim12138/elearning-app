const mongoose = require('mongoose');

const forumSchema = new mongoose.Schema({
  titre: String,
  contenu: String,
  auteur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now },
  cours: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course',
    required: true
  },
  categorie: { 
    type: String, 
    enum: ['général', 'questions', 'discussions', 'aide', 'projets'],
    default: 'général'
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reponses: [{
    contenu: String,
    auteur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }]
});

module.exports = mongoose.model('Forum', forumSchema);