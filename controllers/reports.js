const db = require('../db');
const _ = require('lodash');
const { envVariables, sendApiResponse, constants } = require('../helpers');
const { v4 } = require('uuid');
const dateFormat = require('dateformat');
const { ErrorResponse } = require('../utils/errorResponse');
const { asyncErrorHandler } = require('../middlewares');
const REPORT_TABLE_NAME = _.get(envVariables, 'TABLE_NAME');

/**
 * @description Fetches a report by report id
 */
const readReport = asyncErrorHandler(async (req, res, next) => {
    const { reportId } = _.get(req, "params");
    const id = _.get(req, "id") || "api.report.get";
    const {
        rows,
        rowCount,
    } = await db.query(
        `SELECT * FROM ${REPORT_TABLE_NAME} WHERE reportId = $1`,
        [reportId]
    );
    if (rowCount > 0) {
        const result = {
            reports: rows,
            count: rowCount,
        };
        res.status(200).send(
            sendApiResponse({
                id,
                responseCode: constants.RESPONSE_CODE.SUCCESS,
                result,
                params: {},
            })
        );
    } else {
        next(new ErrorResponse(constants.MESSAGES.NO_REPORT, 404));
    }
});

/**
 * @description This controller method is used to create a new report
 */
const createReport = asyncErrorHandler(async (req, res, next) => {
    const reqBody = _.get(req, "body.request.report");
    const id = _.get(req, "id") || "api.report.create";

    const reportid = _.get(reqBody, "reportid") || v4();
    const reportaccessurl =
        _.get(reqBody, "reportaccessurl") ||
        `${envVariables.ENV}/dashBoard/reports/${reportid}`;
    const body = { reportid, reportaccessurl, ...reqBody };
    const query = `INSERT INTO ${REPORT_TABLE_NAME} (${_.join(
        _.keys(body),
        ","
    )}) SELECT ${_.join(_.keys(body), ",")} FROM jsonb_populate_record(NULL::${
        REPORT_TABLE_NAME
        }, '${JSON.stringify(body)}')`;

    const { rows, rowCount } = await db.query(query);
    const result = {
        reportId: reportid,
        reportaccessurl,
    };
    res.status(200).send(
        sendApiResponse({
            id,
            responseCode: constants.RESPONSE_CODE.SUCCESS,
            result,
            params: {},
        })
    );
});

/**
 * @description This controller method is used to delete an existing report
 */
const deleteReport = asyncErrorHandler(async (req, res, next) => {
    const id = _.get(req, "id") || "api.report.delete";
    const { reportId } = _.get(req, "params");

    const {
        rows,
        rowCount,
    } = await db.query(
        `DELETE FROM ${REPORT_TABLE_NAME} WHERE reportId = $1`,
        [reportId]
    );
    if (rowCount > 0) {
        const result = {
            reportId,
        };
        res.status(200).send(
            sendApiResponse({
                id,
                responseCode: constants.RESPONSE_CODE.SUCCESS,
                result,
                params: {},
            })
        );
    } else {
        next(new ErrorResponse(constants.MESSAGES.NO_REPORT, 404));
    }
});

/**
 * @description This controller method is used to update an existing report
 */
const updateReport = asyncErrorHandler(async (req, res, next) => {
    const id = _.get(req, "id") || "api.report.update";
    const { reportId } = _.get(req, "params");
    const reqBody = _.get(req, "body.request.report");

    if (_.keys(reqBody).length) {
        const updatedon = dateFormat(new Date());
        const body = { ...reqBody, updatedon };
        const query = `UPDATE ${REPORT_TABLE_NAME} SET ${_.join(
            _.map(
                body,
                (value, key) =>
                    `${key} = '${
                    typeof value === "object" ? JSON.stringify(value) : value
                    }'`
            ),
            ", "
        )} WHERE reportid = $1`;

        const { rows, rowCount } = await db.query(query, [reportId]);
        if (rowCount > 0) {
            const result = {
                reportId,
            };
            res.status(200).send(
                sendApiResponse({
                    id,
                    responseCode: constants.RESPONSE_CODE.SUCCESS,
                    result,
                    params: {},
                })
            );
        } else {
            next(new ErrorResponse(constants.MESSAGES.NO_REPORT, 404));
        }
    } else {
        next(new ErrorResponse(constants.MESSAGES.NO_COLUMNS_TO_UPDATE, 400));
    }
});

/**
 * @description This controller method is used to list all the reports in the system
 */
const listReports = asyncErrorHandler(async (req, res, next) => {
    const id = _.get(req, "id") || "api.report.list";
    const filters = _.get(req, "body.request.filters") || {};
    const whereClause = _.keys(filters).length
        ? `WHERE ${_.join(
            _.map(
                filters,
                (value, key) =>
                    `${key} IN (${_.join(
                        _.map(value, (val) => `'${val}'`),
                        ", "
                    )})`
            ),
            " AND "
        )}`
        : "";

    const query = `SELECT * FROM ${REPORT_TABLE_NAME} ${whereClause}`;
    const { rows, rowCount } = await db.query(query);
    const result = {
        reports: rows,
        count: rowCount,
    };
    res.status(200).send(
        sendApiResponse({
            id,
            responseCode: constants.RESPONSE_CODE.SUCCESS,
            result,
            params: {},
        })
    );
});

module.exports = {
    readReport, updateReport, listReports, deleteReport, createReport
}