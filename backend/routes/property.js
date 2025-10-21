const express = require('express');
const router = express.Router();
const property = require('../controllers/property');
const catchAsync = require('../utils/catchAsync');
const { requireAuth, requireAdmin } = require('../utils/Auth'); 

router.get('/', catchAsync(property.index));
router.get('/:id', catchAsync(property.showProperties));

router.get('/new', requireAuth, requireAdmin, property.renderEditForm);

router.post('/', requireAuth, requireAdmin, catchAsync(property.createProperties));

router.route('/:id')
  .put(requireAuth, requireAdmin, catchAsync(property.updateProperty))
  .delete(requireAuth, requireAdmin, catchAsync(property.deleteProperty));

module.exports = router;
