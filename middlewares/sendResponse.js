const { sendApiResponse, constants } = require('../helpers');
module.exports = (req, res) => {
    const { id, responseObj: { result = {}, statusCode = 200 } } = req;
    res.status(statusCode).json(sendApiResponse({
        id,
        responseCode: constants.RESPONSE_CODE.SUCCESS,
        result: result,
        params: {},
    }));
}