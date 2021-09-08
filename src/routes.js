const express = require('express');
const { getdb } = require('@plandid/mongo-utils');
const { ObjectID } = require('mongodb');
const jwt = require('./jwt');
const { getPlan, recordViolatesPlan, getOwner } = require('./subscriptionTools.js');

const col = getdb().collection('records');

const router = express.Router();

router.use('/records', jwt.auth0Check, require('./routes/records'));
router.use('/subscriptions', jwt.auth0Check, require('./routes/subscriptions'));
router.use('/tokens', jwt.auth0Check, require('./routes/tokens'));

router.use('/user-records', jwt.userCheck, require('./routes/records'));

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
        const plan = await getPlan(await getOwner(req.params.accessKey));

        if (await recordViolatesPlan(req.body, plan)) {
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