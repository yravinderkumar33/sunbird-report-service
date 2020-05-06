const reportValidators = require('./validators/validateReport');
const summaryValidators = require('./validators/validateSummary');
const { customErrorHandler } = require('./errorHandlers/customErrorHandler');
const { asyncErrorHandler } = require('./errorHandlers/asyncErrorHandler');

module.exports = {
    ...summaryValidators, asyncErrorHandler, customErrorHandler, ...reportValidators
}