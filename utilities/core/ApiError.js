// eslint-disable-next-line max-classes-per-file
const {
    AuthFailureResponse,
    BadRequestResponse,
    ForbiddenResponse,
    InternalErrorResponse,
    NotFoundResponse,
    AccessTokenErrorResponse,
    ExpiredTokenErrorResponse,
    DuplicateDataResponse,
} = require('./ApiResponse');

/**
 * @enum an object that's holds all possible API errors. The object.freeze
 * method is called to prevent addition of properties later in the code.
 *  This emulates the ENUM type of other languages like JAVA
 */
const ERROR_TYPE_ENUM = Object.freeze({
    BAD_TOKEN: 'BadTokenError',
    TOKEN_EXPIRED: 'TokenExpiredError',
    UNAUTHORIZED: 'AuthFailureError',
    ACCESS_TOKEN: 'AccessTokenError',
    INTERNAL: 'InternalError',
    NOT_FOUND: 'NotFoundError',
    NO_ENTRY: 'NoEntryError',
    NO_DATA: 'NoDataError',
    DUPLICATE_DATA_ERROR: 'DuplicateDataError',
    BAD_REQUEST: 'BadRequestError',
    FORBIDDEN: 'ForbiddenError',
});

/**
 * @class ApiError
 * @abstract this class cannot be instantiated
 * @classdesc An abstract class that defines and handles errors. Its extends the built-in Error class.
 */
class ApiError extends Error {
    /**
     * @constructor - since the class is abstract, this constructor must be called from the subclass using the super(...)
     * @param errorType - Type of error caught
     * @param message - Error message to be displayed
     * @param errorDetails - Additional details describing the error
     */
    constructor(errorType, message = 'Error', errorDetails) {
        /**
         * since abstract classes cannot be created naturally in javascript, we induced it by throwing an
         * error when this class is instantiated directly and not subclassed
         * @see {@link https://stackoverflow.com/questions/29480569/does-ecmascript-6-have-a-convention-for-abstract-classes/30560792}
         */
        if (new.target === ApiError) {
            throw new TypeError('Cannot Construct Abstract Instance Directly');
        }
        super(message);
        this.type = errorType;
        this.details = errorDetails;
    }

    /**
     * @method Handle
     * @static - this method should be called statically from its subclass
     * @param error - this is the error encountered and thrown.
     * @param res - response type from expressJs
     * @returns {ApiResponse}
     * @description - this method handles the thrown error by using a switch statement to determine the type of error and
     * returns the appropriate response for that error.
     */
    static handle(error, res) {
        switch (error.type) {
            case ERROR_TYPE_ENUM.TOKEN_EXPIRED:
                return new ExpiredTokenErrorResponse(error.message, error.details).send(
                    res
                );
            case ERROR_TYPE_ENUM.BAD_TOKEN:
            case ERROR_TYPE_ENUM.ACCESS_TOKEN:
                return new AccessTokenErrorResponse(error.message, error.details).send(
                    res
                );
            case ERROR_TYPE_ENUM.UNAUTHORIZED:
                return new AuthFailureResponse(error.message, error.details).send(res);
            case ERROR_TYPE_ENUM.INTERNAL:
                return new InternalErrorResponse(error.message, error.details).send(
                    res
                );
            case ERROR_TYPE_ENUM.NOT_FOUND:
            case ERROR_TYPE_ENUM.NO_ENTRY:
            case ERROR_TYPE_ENUM.NO_DATA:
                return new NotFoundResponse(error.message, error.details).send(res);
            case ERROR_TYPE_ENUM.DUPLICATE_DATA_ERROR:
                return new DuplicateDataResponse(error.message, error.details).send(
                    res
                );
            case ERROR_TYPE_ENUM.BAD_REQUEST:
                return new BadRequestResponse(error.message, error.details).send(res);
            case ERROR_TYPE_ENUM.FORBIDDEN:
                return new ForbiddenResponse(error.message, error.details).send(res);
            default: {
                let {
                    message
                } = error;
                // Do not send failure message in production as it may send sensitive data
                if (process.env.NODE_ENV === 'production')
                    message = 'Something wrong happened.';

                return new InternalErrorResponse(message).send(res);
            }
        }
    }
}

/**
 * @class AccessTokenError
 * @classdesc this error class should be thrown when there is an error in decoding JWT Tokens, its subclasses the
 * abstract @see ApiError class and calls its constructor using the @see ERROR_TYPE_ENUM const and the message
 * to be displayed.
 */
class AccessTokenError extends ApiError {
    constructor(message = 'Invalid access token', errorDetails = null) {
        super(ERROR_TYPE_ENUM.ACCESS_TOKEN, message, errorDetails);
    }
}

/**
 * @class AuthFailureError
 * @classdesc this error class should be thrown when there is an error in credential like invalid username or password,
 * its subclasses the abstract @see ApiError class and calls its constructor using the @see ERROR_TYPE_ENUM constant and
 * the message to be displayed.
 */
class AuthFailureError extends ApiError {
    constructor(message = 'Invalid Credentials', errorDetails = null) {
        //console.log(new.target)
        super(ERROR_TYPE_ENUM.UNAUTHORIZED, message, errorDetails);
    }
}

/**
 * @class BadRequestError
 * @classdesc this error class should be thrown when there is a bad request i.e the server cannot understand the request
 * its subclasses the abstract @see ApiError class and calls its constructor using the @see ERROR_TYPE_ENUM const and the message
 * to be displayed.
 */
class BadRequestError extends ApiError {
    constructor(message = 'Bad Request', errorDetails = null) {
        super(ERROR_TYPE_ENUM.BAD_REQUEST, message, errorDetails);
    }
}

/**
 * @class BadTokenError
 * @classdesc this error class should be thrown when a completely wrong token is sent, its subclasses the
 * abstract @see ApiError class and calls its constructor using the @see ERROR_TYPE_ENUM const and the message
 * to be displayed.
 */
class BadTokenError extends ApiError {
    constructor(message = 'Token is not valid', errorDetails = null) {
        super(ERROR_TYPE_ENUM.BAD_TOKEN, message, errorDetails);
    }
}

/**
 * @class ExpiredTokenError
 * @classdesc this error class should be thrown when there is an error in decoding JWT Tokens, its subclasses the
 * abstract @see ApiError class and calls its constructor using the @see ERROR_TYPE_ENUM const and the message
 * to be displayed.
 */
class ExpiredTokenError extends ApiError {
    constructor(message = 'Expired access token', errorDetails = null) {
        super(ERROR_TYPE_ENUM.TOKEN_EXPIRED, message, errorDetails);
    }
}

/**
 * @class ForbiddenError
 * @classdesc this error class should be thrown when a user is not authorized to access a resource, its subclasses the
 * abstract @see ApiError class and calls its constructor using the @see ERROR_TYPE_ENUM const and the message
 * to be displayed.
 */
class ForbiddenError extends ApiError {
    constructor(message = 'Permission denied', errorDetails = null) {
        super(ERROR_TYPE_ENUM.FORBIDDEN, message, errorDetails);
    }
}

/**
 * @class InternalError
 * @classdesc this error class should be thrown when a server error occurs within the API, its subclasses the
 * abstract @see ApiError class and calls its constructor using the @see ERROR_TYPE_ENUM const and the message
 * to be displayed.
 */
class InternalError extends ApiError {
    constructor(
        message = 'An error occurred. Please try again later',
        errorDetails = null
    ) {
        super(ERROR_TYPE_ENUM.INTERNAL, message, errorDetails);
    }
}

/**
 * @class NoDataError
 * @classdesc this error class should be thrown when no data was not found on the specified resource, its subclasses the
 * abstract @see ApiError class and calls its constructor using the @see ERROR_TYPE_ENUM const and the message
 * to be displayed.
 */
class NoDataError extends ApiError {
    constructor(message = 'No data available', errorDetails = null) {
        super(ERROR_TYPE_ENUM.NO_DATA, message, errorDetails);
    }
}

/**
 * @class NoEntryError
 * @classdesc this error class should be thrown when a query parameter for instance is wrong, its subclasses the
 * abstract @see ApiError class and calls its constructor using the @see ERROR_TYPE_ENUM const and the message
 * to be displayed.
 */
class NoEntryError extends ApiError {
    constructor(message = "Entry don't exists", errorDetails = null) {
        super(ERROR_TYPE_ENUM.NO_ENTRY, message, errorDetails);
    }
}
/**
 * @class DuplicateDataError
 * @classdesc this error class should be thrown when that provided by user already exist, its subclasses the
 * abstract @see ApiError class and calls its constructor using the @see ERROR_TYPE_ENUM const and the message
 * to be displayed.
 */
class DuplicateDataError extends ApiError {
    constructor(message = 'Data provided already exists', errorDetails = null) {
        super(ERROR_TYPE_ENUM.DUPLICATE_DATA_ERROR, message, errorDetails);
    }
}

/**
 * @class NotFoundError
 * @classdesc this error class should be thrown when a resource like route path could not be found, its subclasses the
 * abstract @see ApiError class and calls its constructor using the @see ERROR_TYPE_ENUM const and the message
 * to be displayed.
 */
class NotFoundError extends ApiError {
    constructor(message = 'Not Found', errorDetails = null) {
        super(ERROR_TYPE_ENUM.NOT_FOUND, message, errorDetails);
    }
}

/**
 * @class TokenExpiredError
 * @classdesc this error class should be thrown when an expired JWT Token is sent, its subclasses the
 * abstract @see ApiError class and calls its constructor using the @see ERROR_TYPE_ENUM const and the message
 * to be displayed.
 */
class TokenExpiredError extends ApiError {
    constructor(message = 'Token is expired', errorDetails = null) {
        super(ERROR_TYPE_ENUM.TOKEN_EXPIRED, message, errorDetails);
    }
}

// exports all subclasses of the ApiError class as module
module.exports = {
    AccessTokenError,
    ApiError,
    AuthFailureError,
    BadRequestError,
    BadTokenError,
    ExpiredTokenError,
    DuplicateDataError,
    ForbiddenError,
    InternalError,
    NoDataError,
    NoEntryError,
    NotFoundError,
    TokenExpiredError,
};