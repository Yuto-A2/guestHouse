// routes/property.js
const express = require('express');
const router = express.Router();
const property = require('../controllers/property');
const { requireAuth } = require('../utils/Auth');

// 一覧
// GET /admin/properties
router.get('/', requireAuth, property.index);

// 作成
// POST /admin/properties
router.post('/', requireAuth, property.createProperties);

// 取得
// GET /admin/properties/:id
router.get('/:id', requireAuth, property.showProperties);

// 更新
// PUT /admin/properties/:id
router.put('/:id', requireAuth, property.updateProperty);

// 削除
// DELETE /admin/properties/:id
router.delete('/:id', requireAuth, property.deleteProperty);

module.exports = router;
