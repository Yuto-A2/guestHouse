const express = require('express');
const router = express.Router();
const guest = require('../controllers/guest');
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');

router.route('/')
.get(guest.Guests)
.post(guest.Register)

router.post('/login', guest.login);

module.exports = router;