const express = require ('express');
const router = express.Router();
const property = require('../controllers/property');
const catchAsync = require('../utils/catchAsync');

router.get('/', catchAsync(property.index));

router.get('/new', property.renderEditForm);


router.post('/', catchAsync(property.createProperties));

router.route('/:id')
.get(catchAsync(property.showProperties))
.put(catchAsync(property.updateProperty))
.delete(catchAsync(property.deleteProperty));

module.exports = router;