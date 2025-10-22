const express = require('express');
const router = express.Router();
const guest = require('../controllers/guest');
const catchAsync = require('../utils/catchAsync');

router.get('/new', guest.renderEditForm);

router.route('/')
.get(guest.Guests)
.post(guest.Register)

router.post('/login', guest.login);

router.get('/logout', guest.logout);

router.get('/id', guest.getSelfId);

router.route('/:id')
.get(catchAsync(guest.showGuests))
.put(catchAsync(guest.updateGuest))
.delete(catchAsync(guest.deleteGuest));

router.get('/:guestId/reservations', catchAsync(guest.listReservationsByGuest));

module.exports = router;