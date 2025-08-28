const express = require ('express');
const router = express.Router();
const property = require('../controllers/property');
const catchAsync = require('../utils/catchAsync');

router.get('/', catchAsync(property.index));

router.post('/', catchAsync(property.createProperties));

router.route('/:id')
.get(catchAsync(property.showProperties));

module.exports = router;