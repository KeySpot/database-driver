const express = require('express');
const { getdb } = require('@plandid/mongo-utils');
const { ObjectID } = require('mongodb');
const process = require('process');
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');

const jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 20,
        jwksUri: process.env.JWKS_URI,
    }),
    audience: process.env.JWT_AUDIENCE,
    issuer: process.env.JWT_ISSUER,
    algorithms: ['RS256']
});

const col = getdb().collection('records');

const router = express.Router();

router.get('/:accessKey', async function(req, res, next) {
    try {
        let projector = { _id: 0, record: 1,  };
        if (req.query.name) {
            projector['name'] = 1;
        }

        const data = await col
        .find({ _id: new ObjectID(req.params.accessKey) })
        .limit(1)
        .project(projector)
        .next();
        res.json(data ? req.query.name ? data : data.record : null);
    } catch (error) {
        next(error);
    }
});

router.patch('/:accessKey', async function(req, res, next) {
    try {
        let setQuery = {};
        Object.entries(req.body).map(function(kvp) {
            setQuery[`record.${kvp[0]}`] = kvp[1];
        });

        await col
        .updateOne(
            { _id: new ObjectID(req.params.accessKey) }, 
            { $set: setQuery },
            { upsert: true }
        );
        res.sendStatus(200);
    } catch (error) {
        next(error);
    }
});

router.put('/:accessKey', async function(req, res, next) {
    try {
        const setQuery = req.query.name ? 
        { record: req.body, name: req.query.name } :
        { record: req.body };
        await col
        .updateOne(
            { _id: new ObjectID(req.params.accessKey) }, 
            { $set: setQuery },
            { upsert: true }
        );
        res.sendStatus(200);
    } catch (error) {
        next(error);
    }
});

router.use('/records', jwtCheck, require('./routes/records'));
router.use('/subscriptions', jwtCheck, require('./routes/subscriptions'));

module.exports = router;