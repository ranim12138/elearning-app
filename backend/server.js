const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const { auth, authorize } = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/elearning')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Routes
const authRoutes = require('./routes/auth');
// NE PAS appliquer le middleware 'auth' aux routes d'authentification de base
app.use('/api/auth', authRoutes);

const courseRoutes = require('./routes/courses');
app.use('/api/courses', auth, courseRoutes);

const contentRoutes = require('./routes/contents');
app.use('/api/contents', auth, contentRoutes);

const uploadRoutes = require('./routes/upload');
app.use('/api/upload', auth, uploadRoutes);
app.use('/uploads', express.static('uploads'));

const quizRoutes = require('./routes/quiz');
app.use('/api/quiz', auth, quizRoutes);

const evaluationRoutes = require('./routes/evaluation');
app.use('/api/evaluation', auth, evaluationRoutes);

const forumRoutes = require('./routes/forum');
app.use('/api/forum', auth, forumRoutes);

const chatRoutes = require('./routes/chat');
app.use('/api/chat', auth, chatRoutes);

// Création du serveur HTTP pour Socket.IO
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Import du modèle Message
const Message = require('./models/message');

// Middleware pour authentification Socket.IO
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentification requise'));
  
  jwt.verify(token, 'secretkey', (err, decoded) => {
    if (err) return next(new Error('Token invalide'));
    socket.user = decoded;
    next();
  });
});

// Stockage des connexions actives
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('Nouvelle connexion:', socket.user.id);
  
  // Stocker l'utilisateur connecté
  activeUsers.set(socket.user.id, socket.id);
  
  // Envoyer la liste des utilisateurs connectés
  io.emit('user-list', Array.from(activeUsers.keys()));
  
  // Gestion des messages
  socket.on('private-message', async ({ receiver, content }) => {
    try {
      // Créer et sauvegarder le message
      const message = new Message({
        sender: socket.user.id,
        receiver,
        content
      });
      
      const savedMessage = await message.save();
      
      // Envoyer au destinataire si connecté
      if (activeUsers.has(receiver)) {
        io.to(activeUsers.get(receiver)).emit('private-message', savedMessage);
      }
      
      // Renvoyer une confirmation à l'expéditeur
      socket.emit('message-sent', savedMessage);
    } catch (err) {
      console.error('Erreur sauvegarde message:', err);
      socket.emit('message-error', {
        error: 'Erreur lors de l\'envoi du message'
      });
    }
  });
  
  // Gestion de la déconnexion
  socket.on('disconnect', () => {
    console.log('Déconnexion:', socket.user.id);
    activeUsers.delete(socket.user.id);
    io.emit('user-list', Array.from(activeUsers.keys()));
  });
});

// Utilisez server.listen() au lieu de app.listen()
server.listen(5000, () => console.log('Server running on http://localhost:5000'));