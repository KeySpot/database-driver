const express = require('express');
const { getdb } = require('@plandid/mongo-utils');
const { ObjectID } = require('mongodb');

const col = getdb().collection('subscriptions');

const router = express.Router();

router.put('/:sub/:plan', async function(req, res, next) {
    try {
        await col.updateOne(
            { sub: req.params.sub },
            { $set: { plan: req.params.plan } },
            { upsert: true }
        );
        res.sendStatus(200);
    } catch (error) {
        next(error);
    }
});

router.delete('/:sub', async function(req, res, next) {
    try {
        await col.deleteOne({ sub: req.params.sub });
        res.sendStatus(200);
    } catch (error) {
        next(error);
    }
});

module.exports = router;