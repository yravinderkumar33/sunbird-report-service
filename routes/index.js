const reports = require('./reports');
const { envVariables, sendApiResponse, constants } = require('../helpers');
const bodyParser = require('body-parser')


module.exports = app => {
  app.use(`/${envVariables.BASE_REPORT_URL}`, bodyParser.json({ limit: '1mb' }), reports);
  app.all('*', (req, res) => {
    const response = sendApiResponse({ id: 'api.report', responseCode: constants.RESPONSE_CODE.CLIENT_ERROR, result: {}, params: { status: constants.STATUS.FAILED, errmsg: constants.MESSAGES.NO_API } });
    res.status(400).send(response);
  })
};