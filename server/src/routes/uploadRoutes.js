const express = require('express');
const auth = require('../middleware/auth');
const { uploadImage } = require('../controllers/uploadController');
const router = express.Router();

router.post('/image', auth, uploadImage);

module.exports = router;