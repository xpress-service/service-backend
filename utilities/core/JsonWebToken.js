/**
 * @file Creates and Verifies Json Web Tokens
 * @author Gabriel <gabrielsonchia@gmail.com> <16/11/2020 08:32pm>
 * @since 1.0.0
 *  Last Modified: Gabriel <gabrielsonchia@gmail.com> <02/01/2021 06:59am>
 */
const jwt = require('jsonwebtoken');
const {
BadTokenError,
TokenExpiredError,
AccessTokenError,
BadRequestError,
} = require('./ApiError');

const ALGORITHM = 'HS256';
const ISSUER = 'EDGE-APP';
const AUDIENCE = ['superAdmin', 'admin', 'manager', 'hr'];
const {JWT_EXPIRE_ACCESS, ACCESS_TOKEN_SECRET} = process.env;
/**
 * @class JsonWebToken
 * @classdesc A class for creating and verifying Json Web Tokens.
 */
class JsonWebToken {
constructor(payload) {
    this.expiresInAcc = JWT_EXPIRE_ACCESS;
    this.algorithm = ALGORITHM;
    this.secret = ACCESS_TOKEN_SECRET;
    this.issuer = ISSUER;
    this.audience = AUDIENCE;
    this.payload = payload;
}

/**
* @description get jwt token from authorization headers
* @param req - current request to the server
* @return {string|null} - returns token or null if nothing found
*/
static getToken(req) {
    if (
    req.headers &&
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer'
    ) {
    return req.headers.authorization.split(' ')[1];
    }
    return null;
}

/**
* @description claims to be validated when token is being verified
* @return {{audience: [string, string], issuer: string, algorithm: string}}
*/
static validateClaims() {
    return {
    algorithm: ALGORITHM,
    issuer: ISSUER,
    audience: AUDIENCE,
    };
}

/**
* @description checks if token provided is valid, if yes set user property in request object
* @return {Promise<*>}
*/
// eslint-disable-next-line no-unused-vars
static async verifyToken(req, res, next) {
    const token = JsonWebToken.getToken(req);

    if (token) {
    try {
        const decoded = jwt.verify(
        token,
        ACCESS_TOKEN_SECRET,
        JsonWebToken.validateClaims()
        );
        req.user = {
        id: decoded.sub,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        email: decoded.email,
        role: decoded.aud,
        };
        req.token = token;
        next();
    } catch (e) {
        if (e.name === 'TokenExpiredError') next(new TokenExpiredError());
        if (e.message === 'jwt malformed') next(new BadTokenError());
        console.log(e);
        next(new AccessTokenError());
    }
    } else {
    next(
        new BadRequestError(
        'No Token Provided',
        "Please send an Authorization Header with value - Bearer 'Token'"
        )
    );
    }
}

/**
* @description generates jwt access token by signing app and reserved claims and jwt secret for access token
* @return {String} - token
*/
createAccessToken() {
    return jwt.sign(
    this.getClaims().application,
    this.secret,
    this.getClaims(this.expiresInAcc).reserved
    );
}

/**
* @description generates application and reserved claims
* @return {{application: {name: string, email}, reserved: {expiresIn: string, audience: [string, string], subject, issuer: string, algorithm: string}}}
*/
getClaims(expires = null) {
    const claims = {
    reserved: {
        algorithm: this.algorithm,
        issuer: this.issuer,
        audience: this.payload.role,
        expiresIn: expires,
        subject: this.payload.id.toString(),
    },
    application: {
        firstName: this.payload.firstName,
        lastName: this.payload.lastName,
        email: this.payload.email
    },
    };
    return claims;
}
}

module.exports = JsonWebToken;