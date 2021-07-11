const express = require('express');
const { getdb } = require('@plandid/mongo-utils');

const db = getdb();

const router = express.Router();

router.get('/:sub', async function(req, res, next) {
    try {
        const data = await db.collection("userRecords")
        .find({ sub: req.params.sub })
        .project({ _id: 0, records: 1 })
        .next();
        res.json(data.records);
    } catch (error) {
        next(error);
    }
});

router.put()

module.exports = router;