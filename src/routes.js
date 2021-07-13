const express = require('express');
const { getdb } = require('@plandid/mongo-utils');
const { ObjectID } = require('mongodb');
const jwt = require('express-jwt');

const jwtOptions = {
    secret: process.env.AUTH_SECRET,
    algorithms: ['RS256']
};

const col = getdb().collection('records');

const router = express.Router();

router.get('/:accessKey', async function(req, res, next) {
    try {
        const data = await col
        .find({ _id: new ObjectID(req.params.accessKey) })
        .limit(1)
        .project({ _id: 0, record: 1 })
        .next();
        res.json(data ? data.record : {});
    } catch (error) {
        next(error);
    }
});

router.use(jwt(jwtOptions), async function(req, res, next) {
    console.log(req.user);
});

router.use('/records', require('./routes/records'));

module.exports = router;