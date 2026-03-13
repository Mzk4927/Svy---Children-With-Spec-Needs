const express = require('express');
const { getStatistics } = require('../controllers/statsController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, getStatistics);

module.exports = router;
