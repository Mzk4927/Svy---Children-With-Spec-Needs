const express = require('express');
const auth = require('../middleware/auth');
const { listCategories, createCategory } = require('../controllers/categoryController');

const router = express.Router();

router.use(auth);
router.get('/', listCategories);
router.post('/', createCategory);

module.exports = router;
