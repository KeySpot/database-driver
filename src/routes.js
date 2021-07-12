const express = require('express');

const router = express.Router();

router.use('/records', require('./routes/records'));
// router.use('/accounts', require('./routes/accounts'));

module.exports = router;