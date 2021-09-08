const express = require('express');
const { getdb } = require('@plandid/mongo-utils');
const jwt = require('../jwt');

const col = getdb().collection('tokens');

const router = express.Router();

router.get('/:sub', async function(req, res, next) {
    try {
        res.json(jwt.signUserJwt(req.params.sub));
    } catch (error) {
        next(error);
    }
});

module.exports = router;