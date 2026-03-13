const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/image', auth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  // You can later add Cloudinary upload here
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

module.exports = router;