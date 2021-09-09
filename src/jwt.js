const process = require('process');
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');
const jsonwebtoken = require('jsonwebtoken');

const userSecret = process.env.USER_JWT_SECRET;

const auth0Check = jwt({
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

function userCheck(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1];

    if (token === null) return res.sendStatus(401);

    jsonwebtoken.verify(token, userSecret, (err, sub) => {
        if (err) {
            console.error(err);
            return res.sendStatus(401);
        } else if (req.params.sub && req.params.sub === sub) {
            console.error("sub in jwt doesn't match sub in path");
            return res.sendStatus(401);
        } else {
            console.log('Correct sub: ' + sub);
            next();
        }
    });
}

function generateJwt(payload, secret) {
    return jsonwebtoken.sign(payload, secret);
}

function signUserJwt(sub) {
    return generateJwt({sub: sub}, userSecret);
}

module.exports = {
    auth0Check: auth0Check,
    userCheck: userCheck,
    signUserJwt: signUserJwt,
};