const { getdb } = require('@plandid/mongo-utils');
const { ObjectId } = require('mongodb');
const fs = require('fs');
const db = getdb();

const plans = JSON.parse(fs.readFileSync('plans.json'));

async function getOwner(accessKey) {
    const record = await db.collection('records')
    .find({ _id: new ObjectId(accessKey) })
    .limit(1)
    .project({ _id: 0, sub: 1 })
    .next();
    
    return record.sub;
}

async function getPlan(sub) {
    const subscription = await db.collection('subscriptions')
    .find({ sub: sub })
    .project({ _id: 0, plan: 1 })
    .limit(1)
    .next();

    return subscription ? subscription.plan : 'free';
}

async function recordViolatesPlan(record, planName) {
    const plan = plans[planName];
    return Boolean(plan.secretsPerRecord && Object.keys(record).length > plan.secretsPerRecord);
}

async function recordCountReached(sub, planName) {
    const recordCount = await db.collection('records')
    .find({ sub: sub })
    .count();

    const plan = plans[planName];
    return Boolean(plan.records && recordCount >= plan.records);
}

module.exports = {
    getOwner: getOwner,
    getPlan, getPlan,
    recordViolatesPlan: recordViolatesPlan,
    recordCountReached: recordCountReached,
};