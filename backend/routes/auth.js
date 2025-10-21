const express = require('express');
const router = express.Router();
const guest = require('../controllers/guest');
const catchAsync = require('../utils/catchAsync');
const { requireAuth } = require('../utils/Auth');

router.get('/', requireAuth, catchAsync(guest.getAdminInfo));

module.exports = router;
