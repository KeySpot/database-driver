const express = require('express');
const { getdb } = require('@plandid/mongo-utils');
const { ObjectID } = require('mongodb');
const process = require('process');
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');
const { getPlan, recordFull } = require('./subscriptionTools.js');

const jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 20,
        jwksUri: new URL('/.well-known/jwks.json', process.env.JWT_ISSUER).href,
    }),
    audience: process.env.AUTH0_AUDIENCE,
    issuer: new URL('/', process.env.JWT_ISSUER).href,
    algorithms: ['RS256']
});

const col = getdb().collection('records');

const router = express.Router();

router.use('/records', jwtCheck, require('./routes/records'));
router.use('/subscriptions', jwtCheck, require('./routes/subscriptions'));

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

// Deprecated because we need to be able to check the size of the new record.
// router.patch('/:accessKey', async function(req, res, next) {
//     try {
//         let setQuery = {};
//         Object.entries(req.body).map(function(kvp) {
//             setQuery[`record.${kvp[0]}`] = kvp[1];
//         });

//         await col
//         .updateOne(
//             { _id: new ObjectID(req.params.accessKey) }, 
//             { $set: setQuery },
//             { upsert: true }
//         );
//         res.sendStatus(200);
//     } catch (error) {
//         next(error);
//     }
// });

router.patch('/:accessKey', async function(req, res, next) {
    try {
        const plan = await getPlan(req.sub);

        if (await recordFull(req.body, plan)) {
            res.json({ message: 'Record full: Subscribe for more secrets' });
            return;
        }

        const setQuery = req.query.name ? 
        { record: req.body, name: req.query.name } :
        { record: req.body };
        await col
        .updateOne(
            { _id: new ObjectID(req.params.accessKey) }, 
            { $set: setQuery },
        );
        res.json({ message: 'Success' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;