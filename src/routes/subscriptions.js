const express = require('express');
const { getdb } = require('@plandid/mongo-utils');
const { ObjectID } = require('mongodb');

const col = getdb().collection('subscriptions');

const router = express.Router();

router.get('/:sub', async function(req, res, next) {
    try {
        const data = await col
        .find({ sub: req.params.sub })
        .limit(1)
        .next();
        res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put('/', async function(req, res, next) {
    try {
        await col.updateOne(
            { sub: req.body.sub },
            { $set: { plan: req.body.plan, customerId: req.body.customerId } },
            { upsert: true }
        );
        res.sendStatus(200);
    } catch (error) {
        next(error);
    }
});

router.delete('/:customerId', async function(req, res, next) {
    try {
        await col.deleteOne({ customerId: req.params.customerId });
        res.sendStatus(200);
    } catch (error) {
        next(error);
    }
});

module.exports = router;