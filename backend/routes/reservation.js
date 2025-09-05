const express = require('express');
const router = express.Router({ mergeParams: true });
const guest = require('../controllers/guest');
const property = require('../controllers/property');
const reservation = require('../controllers/reservation');
const catchAsync = require('../utils/catchAsync');

router.route('/')
    .post(catchAsync(reservation.createReservation))

router.route('/:id')
    .get(catchAsync(reservation.showReservation))
    .put(catchAsync(reservation.updateReservation))
    .delete(catchAsync(reservation.deleteReservation));

module.exports = router;
