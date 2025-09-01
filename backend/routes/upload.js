const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const router = express.Router()

// S'assurer que le dossier uploads existe
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    // Utiliser un nom de fichier plus simple et éviter les caractères spéciaux
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

// Filtrage des types de fichiers
const fileFilter = (req, file, cb) => {
  // Autoriser les documents et vidéos
  if (file.mimetype.startsWith('image/') || 
      file.mimetype.startsWith('video/') || 
      file.mimetype.startsWith('application/') ||
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    cb(null, true)
  } else {
    cb(new Error('Type de fichier non supporté'), false)
  }
}

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // Limite de 50MB
  }
})

// Route pour upload de fichier
router.post('/', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier envoyé' })
    }

    // Retourner le chemin relatif pour plus de flexibilité
    const fileUrl = `/uploads/${req.file.filename}`
    res.json({ 
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      originalname: req.file.originalname
    })
  } catch (error) {
    console.error('Erreur upload:', error)
    res.status(500).json({ message: 'Erreur lors de l\'upload du fichier' })
  }
})

// Gestion des erreurs Multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Fichier trop volumineux' })
    }
  }
  res.status(400).json({ message: error.message })
})

module.exports = router