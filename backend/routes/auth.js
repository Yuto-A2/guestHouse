const express = require('express');
const router = express.Router();
const { requireAuth } = require('../utils/Auth');

router.get('/', requireAuth, (req, res) => {
  const u = req.user;
  res.json({
    _id: u._id,
    fname: u.fname,
    lname: u.lname,
    email: u.email,
    phone_num: u.phone_num,
    role: u.role,
  });
});

module.exports = router;
