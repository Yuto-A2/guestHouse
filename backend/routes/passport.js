const express = require('express');
const router = express.Router();
const passport = require('../controllers/passport');
const catchAsync = require('../utils/catchAsync');


router.route('/:id')
  .put(requireAuth, requireAdmin, catchAsync(passport.updatePassport));

  module.exports = router;