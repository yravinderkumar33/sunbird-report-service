const Joi = require("@hapi/joi");
const { sendApiResponse, constants } = require('../../helpers');
const _ = require('lodash');

const getBadRequestResponse = ({ id, error }) => sendApiResponse({ id, responseCode: constants.RESPONSE_CODE.CLIENT_ERROR, params: { status: constants.STATUS.FAILED, errmsg: error.details.map(d => d.message), err: constants.RESPONSE_CODE.BAD_REQUEST } });

const summaryValidator = {
    validateCreateSummaryAPI(req, res, next) {
        const id = (req.id = "api.report.summary.create");
        const schema = Joi.object({
            request: Joi.object({
                summary: Joi.object({
                    reportid: Joi.string().required(),
                    createdby: Joi.string().required(),
                    chartid: Joi.string().optional(),
                    summary: Joi.string().required()
                }).required(),
            }).required(),
        });
        const { error, value } = schema.validate(_.get(req, "body"));
        if (error) {
            res.status(400).send(getBadRequestResponse({ id, error }));
        } else {
            next();
        }
    },
    validateListSummaryAPI(req, res, next) {
        const id = (req.id = "api.report.summary.list");
        const schema = Joi.object({
            request: Joi.object({
                filters: Joi.object({
                    reportid: Joi.string().required(),
                    chartid: Joi.string().optional(),
                }).required(),
            }).required(),
        });
        const { error, value } = schema.validate(_.get(req, "body"));
        if (error) {
            res.status(400).send(getBadRequestResponse({ id, error }));
        } else {
            next();
        }
    }
};

module.exports = summaryValidator;
