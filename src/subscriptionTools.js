const { getdb } = require('@plandid/mongo-utils');
const { ObjectId } = require('mongodb');
const db = getdb();
const fs = require('fs');

const plans = JSON.parse(fs.readFileSync('plans.json'));

async function getPlan(sub) {
    const subscription = await db.collection('subscriptions')
    .find({ sub: sub })
    .project({ _id: 0, plan: 1 })
    .limit(1)
    .next();
    return subscription ? subscription.plan : 'free';
}

async function recordFull(record, planName) {
    const plan = plans[planName];
    console.log(`secret count violated: ${Boolean(plan.secretsPerRecord && Object.keys(record).length >= plan.secretsPerRecord)}`)
    return Boolean(plan.secretsPerRecord && Object.keys(record).length >= plan.secretsPerRecord);
}

async function recordCountReached(sub, planName) {
    const recordCount = await db.collection('records')
    .find({ sub: sub })
    .count();

    const plan = plans[planName];
    console.log(`record count violated: ${Boolean(plan.records && recordCount >= plan.records)}`)
    return Boolean(plan.records && recordCount >= plan.records);
}

module.exports = {
    getPlan, getPlan,
    recordFull: recordFull,
    recordCountReached: recordCountReached,
};