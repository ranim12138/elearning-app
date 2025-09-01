// backend/routes/auth.js
const express = require('express')
const router = express.Router()
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// === REGISTER ===
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body

    // Validation des champs requis
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires' })
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Les mots de passe ne correspondent pas" })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères" })
    }

    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(409).json({ message: 'Un utilisateur avec cet email existe déjà' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = new User({ name, email, password: hashedPassword, role })
    await user.save()

    res.status(201).json({ message: 'Utilisateur enregistré avec succès' })
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error)
    res.status(500).json({ message: 'Erreur serveur lors de l\'enregistrement' })
  }
})  

// === LOGIN ===
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation des champs
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' })
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' })
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' })
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1d' });

    res.json({  
      token, 
      user: { 
        _id: user._id,
        name: user.name, 
        email: user.email,
        role: user.role 
      } 
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error)
    res.status(500).json({ message: 'Erreur serveur lors de la connexion' })
  }
});

// Middleware de vérification du token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Accès non autorisé, token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
};

// === GET ALL USERS === (Protégée)
router.get('/users', verifyToken, async (req, res) => {
  try {
    const users = await User.find().select('-password') // cache le mot de passe
    res.json(users)
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// === DELETE USER === (Protégée)
router.delete('/users/:id', verifyToken, async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression:', err)
    res.status(500).json({ message: 'Erreur serveur' });
  }
})

// === UPDATE USER === (Protégée)
router.put('/users/:id', verifyToken, async (req, res) => {
  try {
    const { name, email, role } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({ message: 'Le nom et l\'email sont obligatoires' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
})

// === VERIFY TOKEN ===
router.get('/verify', verifyToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});



// Route pour mot de passe oublié
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Générer un token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 heure

    // Sauvegarder le token
    await ResetToken.create({ userId: user._id, token, expires });

    // Envoyer l'email
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;
    
    const mailOptions = {
      from: 'votreemail@gmail.com',
      to: email,
      subject: 'Réinitialisation de mot de passe',
      html: `<p>Cliquez sur ce lien pour réinitialiser votre mot de passe: <a href="${resetLink}">${resetLink}</a></p>`
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Un email de réinitialisation a été envoyé.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour réinitialiser le mot de passe
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  try {
    const resetToken = await ResetToken.findOne({ token }).populate('userId');
    if (!resetToken || resetToken.expires < new Date()) {
      return res.status(400).json({ message: 'Token invalide ou expiré' });
    }

    const user = resetToken.userId;
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    // Supprimer le token
    await ResetToken.deleteOne({ _id: resetToken._id });

    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour modifier le profil
router.put('/profile/:id', async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier le mot de passe actuel si on veut le changer
    if (newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();
    
    // Ne pas renvoyer le mot de passe
    const userWithoutPassword = await User.findById(user._id).select('-password');
    res.json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
module.exports = router