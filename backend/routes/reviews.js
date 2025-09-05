const express = require('express');
const router = express.Router({ mergeParams: true });
const reviews = require('../controllers/reviews');
const catchAsync = require('../utils/catchAsync');

router.post('/',catchAsync(reviews.createReview))

router.delete('/:reviewId',catchAsync(reviews.deleteReview))

module.exports = router;