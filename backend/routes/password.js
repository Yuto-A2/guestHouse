const express = require('express');
const router = express.Router();
const password = require('../controllers/password');
const catchAsync = require('../utils/catchAsync');


router.route('/:id')
  .put(requireAuth, requireAdmin, catchAsync(password.updatePassword));

  module.exports = router;