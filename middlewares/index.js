const { validateCreateReportAPI, validateReadReportAPI, validateDeleteReportAPI, validateListReportAPI, validateUpdateReportAPI } = require('./validators/validateReport');
const { customErrorHandler } = require('./errorHandlers/customErrorHandler');
const { asyncErrorHandler } = require('./errorHandlers/asyncErrorHandler');
module.exports = {
    asyncErrorHandler, customErrorHandler, validateCreateReportAPI, validateReadReportAPI, validateDeleteReportAPI, validateListReportAPI, validateUpdateReportAPI
}