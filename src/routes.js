const express = require('express');

const router = express.Router();

router.use('/records', require('./routes/records'));

module.exports = router;