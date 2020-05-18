const { sendApiResponse, constants } = require('../../helpers');

const customErrorHandler = (err, req, res, next) => {
    const { statusCode = 500, message = message, err: error = null } = err;
  
    res.status(statusCode).send(
        sendApiResponse({
            id: req.id || 'api.report',
            params: {
                err: JSON.stringify(error),
                status: constants.STATUS.FAILED,
                errmsg: message,
            },
            responseCode: constants.RESPONSE_CODE.SERVER_ERROR,
        })
    );
}

module.exports = {
    customErrorHandler
}