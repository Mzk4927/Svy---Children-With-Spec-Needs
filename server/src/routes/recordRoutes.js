const express = require('express');
const {
  getAll, getOne, create, update, delete: deleteRecord, search, getStats, getReviews, addReview
} = require('../controllers/recordController');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth); // all routes below require auth

router.get('/', getAll);
router.get('/stats', getStats);
router.get('/search', search);
router.get('/:id/reviews', getReviews);
router.post('/:id/reviews', addReview);
router.get('/:id', getOne);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', deleteRecord);

module.exports = router;