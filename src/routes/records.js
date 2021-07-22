const express = require('express');
const { getdb } = require('@plandid/mongo-utils');
const { ObjectID } = require('mongodb');

const col = getdb().collection('records');

const router = express.Router();

router.get('/names/:sub/', async function(req, res, next) {
    try {
        const data = await col
        .find({ sub: req.params.sub })
        .project({ _id: 0, name: 1 })
        .toArray();
        res.json(data.map(function(element) {
            return element.name;
        }));
    } catch (error) {
        next(error);
    }
});

router.get('/count/:sub/', async function(req, res, next) {
    try {
        const data = await col
        .find({ sub: req.params.sub })
        .count();
        res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get('/accessKeys/:sub/', async function(req, res, next) {
    try {
        const data = await col
        .find({ sub: req.params.sub })
        .project({ _id: 1, name: 1})
        .toArray();
        res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get('/:sub/:recordName', async function(req, res, next) {
    try {
        let findQuery = { sub: req.params.sub, name: req.params.recordName };
        if (req.query.accessKey) {
            findQuery = { _id: new ObjectID(req.query.accessKey) };
        } 
        const data = await col
        .find(findQuery)
        .limit(1)
        .next();
        res.json(data);
    } catch (error) {
        next(error);
    }
});

router.patch('/:sub/:recordName', async function(req, res, next) {
    try {
        let setQuery = {};
        Object.entries(req.body).map(function(kvp) {
            setQuery[`record.${kvp[0]}`] = kvp[1];
        });
        await col
        .updateOne(
            { sub: req.params.sub, name: req.params.recordName }, 
            { $set: setQuery },
            { upsert: true }
        );
        res.sendStatus(200);
    } catch (error) {
        next(error);
    }
});

router.put('/:sub/:recordName', async function(req, res, next) {
    try {
        await col
        .updateOne(
            { sub: req.params.sub, name: req.params.recordName }, 
            { $set: { record: req.body } },
            { upsert: true }
        );
        res.sendStatus(200);
    } catch (error) {
        next(error);
    }
});

router.delete('/:sub/:accessKey', async function(req, res, next) {
    try {
        await col
        .deleteOne(
            { _id: new ObjectID(req.params.accessKey) , sub: req.params.sub }
        );
        res.sendStatus(200);
    } catch (error) {
        next(error);
    }
});

module.exports = router;