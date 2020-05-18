const db = require('../db');
const _ = require('lodash');
const { v4 } = require('uuid');
const { envVariables, sendApiResponse, constants } = require('../helpers');
const { asyncErrorHandler } = require('../middlewares');
const SUMMARY_TABLE_NAME = _.get(envVariables, 'SUMMARY_TABLE_NAME');

/**
 * @description This controller method returns the summary history for a report or a chart within a report
 */
const listSummaries = asyncErrorHandler(async (req, res, next) => {

    const id = _.get(req, "id") || "api.report.summary.list";
    const filters = _.get(req, "body.request.filters") || {};
    const whereClause = _.keys(filters).length
        ? `WHERE ${_.join(
            _.map(
                filters,
                (value, key) => `${key} = '${value}'`
            ),
            " AND "
        )}`
        : "";

    const query = `SELECT * FROM ${SUMMARY_TABLE_NAME} ${whereClause}`;
    const { rows, rowCount } = await db.query(query);
    const result = {
        summaries: rows,
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

/**
 * @description This controller method is used to create a report or chart summary
 */
const createSummary = asyncErrorHandler(async (req, res, next) => {
    const reqBody = _.get(req, "body.request.summary");
    const id = _.get(req, "id") || "api.report.summary.create";
    const summaryId = v4();
    const body = { id: summaryId, ...reqBody };
    const query = `INSERT INTO ${SUMMARY_TABLE_NAME} (${_.join(
        _.keys(body),
        ","
    )}) SELECT ${_.join(_.keys(body), ",")} FROM jsonb_populate_record(NULL::${
        SUMMARY_TABLE_NAME
        }, '${JSON.stringify(body)}')`;

    const { rows, rowCount } = await db.query(query);
    const result = {
        summaryId
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
 * @description This controller method is used to fetch the latest report summary
 */
const getReportSummary = asyncErrorHandler(async (req, res, next) => {
    const id = _.get(req, "id") || "api.report.summary.get";
    const { rows, rowCount } = await db.query(
        `SELECT * FROM ${SUMMARY_TABLE_NAME} WHERE reportid = $1 AND chartid IS NULL ORDER BY createdon DESC LIMIT 1`,
        [req.params.reportid]
    );
    const result = {
        summaries: rows,
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

/**
 * @description This controller method is used to fetch the latest chart summary within a report
 */
const getChartSummary = asyncErrorHandler(async (req, res, next) => {
    const id = _.get(req, "id") || "api.report.summary.get";
    const { rows, rowCount } = await db.query(
        `SELECT * FROM ${SUMMARY_TABLE_NAME} WHERE reportid = $1 AND chartid = $2 ORDER BY createdon DESC LIMIT 1`,
        [req.params.reportid, req.params.chartid]
    );
    const result = {
        summaries: rows,
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
    createSummary, listSummaries, getChartSummary, getReportSummary
}