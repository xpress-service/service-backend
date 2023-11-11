const _ = require('lodash');
const {
    BadRequestError
} = require('../../core/ApiError');
// Joi validation options
const validationOptions = {
    abortEarly: false, // abort after the last validation error
    allowUnknown: true, // allow unknown keys that will be ignored
    stripUnknown: true, // remove unknown keys from the validated data
};

module.exports = (req, schema, payload) => {
    /**
     *  defines the different data that could be validated
     */
    const PAYLOAD_ENUM = {
        'req.query': req.query,
        'req.body': req.body,
        'req.params': req.params,
    };
    /**
     * looping to retrieve the data source to be validated
     */
    payload.forEach((element, index) => {
        /**
         * Validate payload using the schema and validation options
         */
        const {
            error,
            value
        } = schema[index].validate(
            _.get(PAYLOAD_ENUM, element),
            validationOptions
        );

        if (error) {
            // Joi Error
            const JoiError = {
                // eslint-disable-next-line no-underscore-dangle
                original: error._original,

                // fetch only message and type from each error
                errors: _.map(error.details, ({
                    message,
                    path
                }) => ({
                    field: path[0],
                    message: message.replace(/['"]/g, ''),
                })),
            };
            // throw error with is then handled by the error handler
            throw new BadRequestError(`${JoiError.errors[0].message}`);
        } else {
            // Replace payload with the data after Joi validation
            if (element === 'req.query') {
                req.query = value;
            } else if (element === 'req.body') {
                req.body = value;
            } else {
                req.params = value;
            }
            return null;
        }
    });
};