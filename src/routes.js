const express = require('express');

const router = express.Router();

router.use('/records/:sub', require('./routes/records'));

module.exports = router;