const express = require('express')
const multer = require('multer')
const app = express()

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '.pdf')
})

const upload = multer({ storage })

app.post('/test-upload', upload.single('pdf'), (req, res) => {
  console.log('Fichier uploadé:', req.file)
  res.send('OK')
})

app.listen(3001, () => console.log('Test upload sur port 3001'))
