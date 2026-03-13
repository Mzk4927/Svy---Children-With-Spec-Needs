const express = require('express');
const { login, register, refresh, changePassword } = require('../controllers/authController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/refresh', refresh);
router.post('/change-password', auth, changePassword);

module.exports = router;