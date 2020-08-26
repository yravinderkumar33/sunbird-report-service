const Joi = require("@hapi/joi");
const { sendApiResponse, constants } = require('../../helpers');
const _ = require('lodash');

const getBadRequestResponse = ({ id, error }) => sendApiResponse({ id, responseCode: constants.RESPONSE_CODE.CLIENT_ERROR, params: { status: constants.STATUS.FAILED, errmsg: error.details.map(d => d.message), err: constants.RESPONSE_CODE.BAD_REQUEST } });

const reportRequestValidator = {
    validateCreateReportAPI(req, res, next) {
        const id = req.id;
        const schema = Joi.object({
            request: Joi.object({
                report: Joi.object({
                    reportid: Joi.string().optional(),
                    description: Joi.string().required(),
                    title: Joi.string().required(),
                    authorizedroles: Joi.array().items(Joi.string()).required(),
                    reportaccessurl: Joi.string().optional(),
                    reportconfig: Joi.object().required(),
                    createdon: Joi.string().optional(),
                    updatedon: Joi.string().optional(),
                    createdby: Joi.string().required(),
                    visibility: Joi.string().valid("public", "private").required(),
                    type: Joi.string().valid("report", "dataset").required(),
                    status: Joi.string()
                        .valid("draft")
                        .trim()
                        .optional(),
                    slug: Joi.string().trim().required(),
                    templateurl: Joi.string().optional(),
                    tags: Joi.array().items(Joi.string()).required(),
                    updatefrequency: Joi.string().required(),
                    reportgenerateddate: Joi.string().required(),
                    reportduration: Joi.object({
                        startdate: Joi.string().required(),
                        enddate: Joi.string().required(),
                    }).required(),
                    parameters: Joi.array().items(Joi.string()).optional()
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
    validateReadReportAPI(req, res, next) {
        const id = req.id;
        const schema = Joi.object({
            reportId: Joi.string().required(),
        });
        const { error, value } = schema.validate(_.get(req.params));
        if (error) {
            res.status(400).send(getBadRequestResponse({ id, error }));
        } else {
            next();
        }
    },
    validateUpdateReportAPI(req, res, next) {
        const id = req.id;
        const schema = Joi.object({
            request: Joi.object({
                report: Joi.object({
                    description: Joi.string().optional(),
                    title: Joi.string().optional(),
                    authorizedroles: Joi.array().items(Joi.string()).optional(),
                    reportaccessurl: Joi.string().optional(),
                    reportconfig: Joi.object().optional(),
                    createdon: Joi.string().optional(),
                    updatedon: Joi.string().optional(),
                    createdby: Joi.string().optional(),
                    visibility: Joi.string().valid("public", "private").optional(),
                    type: Joi.string().valid("report", "dataset").optional(),
                    status: Joi.string()
                        .valid("live", "draft", "retired")
                        .trim()
                        .optional(),
                    slug: Joi.string().trim().optional(),
                    templateurl: Joi.string().optional(),
                    tags: Joi.array().items(Joi.string()).optional(),
                    updatefrequency: Joi.string().optional(),
                    reportgenerateddate: Joi.string().optional(),
                    reportduration: Joi.object({
                        startdate: Joi.string().required(),
                        enddate: Joi.string().required(),
                    }).optional(),
                    parameters: Joi.array().items(Joi.string()).optional()
                }).required(),
            }).required(),
        });
        const { error } = schema.validate(_.get(req, "body"));
        if (error) {
            res.status(400).send(getBadRequestResponse({ id, error }));
        } else {
            next();
        }
    },
    validateDeleteReportAPI(req, res, next) {
        const id = req.id;
        const schema = Joi.object({
            reportId: Joi.string().required(),
        });
        const { error, value } = schema.validate(_.get(req.params));
        if (error) {
            res.status(400).send(getBadRequestResponse({ id, error }));
        } else {
            next();
        }
    },
    validateListReportAPI(req, res, next) {
        const id = req.id;
        const schema = Joi.object({
            request: Joi.object({
                filters: Joi.object({
                    slug: Joi.array().items(Joi.string()).optional(),
                    type: Joi.array()
                        .items(Joi.string().valid("report", "dataset"))
                        .optional(),
                    status: Joi.array()
                        .items(Joi.string().valid("live", "retired", "draft"))
                        .optional(),
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
};

module.exports = reportRequestValidator;
