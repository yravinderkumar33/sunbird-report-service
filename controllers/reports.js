const db = require('../db');
const _ = require('lodash');
const { envVariables, sendApiResponse, constants } = require('../helpers');
const { v4 } = require('uuid');
const dateFormat = require('dateformat');
const { ErrorResponse } = require('../utils/errorResponse');
const { asyncErrorHandler } = require('../middlewares');
const REPORT_TABLE_NAME = _.get(envVariables, 'TABLE_NAME');
const REPORT_STATUE_TABLE_NAME = _.get(envVariables, 'REPORT_STATUS_TABLE_NAME');
const axios = require('axios');

/**
 * @description Fetches a report by report id
 */
const readReport = asyncErrorHandler(async (req, res, next) => {
    const { reportId, hash } = _.get(req, "params");

    let query = `SELECT ${REPORT_TABLE_NAME}.*, to_json(array_remove(array_agg(${REPORT_STATUE_TABLE_NAME}), NULL)) AS children FROM ${REPORT_TABLE_NAME}
    LEFT JOIN ${REPORT_STATUE_TABLE_NAME} ON ${REPORT_TABLE_NAME}.reportid = ${REPORT_STATUE_TABLE_NAME}.reportid WHERE ${REPORT_TABLE_NAME}.reportid = '${reportId}' GROUP BY ${REPORT_TABLE_NAME}.reportid`

    if (hash) {
        query = `SELECT ${REPORT_TABLE_NAME}.*, to_json(array_remove(array_agg(${REPORT_STATUE_TABLE_NAME}), NULL)) AS children FROM ${REPORT_TABLE_NAME}
        LEFT JOIN ${REPORT_STATUE_TABLE_NAME} ON ${REPORT_TABLE_NAME}.reportid = ${REPORT_STATUE_TABLE_NAME}.reportid WHERE ${REPORT_TABLE_NAME}.reportid = '${reportId}' AND
         ${REPORT_STATUE_TABLE_NAME}.hashed_val = '${hash}'  GROUP BY ${REPORT_TABLE_NAME}.reportid`
    }

    let {
        rows,
        rowCount,
    } = await db.query(query);
    if (rowCount > 0) {

        if (hash) {
            rows = _.map(rows, row => {
                if (_.get(row, 'children') && _.get(row, 'children.length')) {
                    const reportWithoutChildren = _.omit(row, 'children');
                    return _.assign(reportWithoutChildren, _.omit(row.children[0], ['id', 'reportid']));
                }
                return row;
            });
        }

        const result = {
            reports: rows,
            count: rowCount,
        };

        req.responseObj = {
            result,
            statusCode: 200
        };

        next();

    } else {
        next(new ErrorResponse(constants.MESSAGES.NO_REPORT, 404));
    }
});

/**
 * @description This controller method is used to create a new report
 */
const createReport = asyncErrorHandler(async (req, res, next) => {
    const reqBody = _.get(req, "body.request.report");
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

    req.responseObj = {
        result,
        statusCode: 200
    };
    next();
});

/**
 * @description This controller method is used to delete an existing report
 * delete cascade effect is set on status table.
 */
const deleteReport = asyncErrorHandler(async (req, res, next) => {

    const { reportId, hash } = _.get(req, "params");

    let query = `DELETE FROM ${REPORT_TABLE_NAME} WHERE reportId = '${reportId}'`;

    if (hash) {
        query = `DELETE FROM ${REPORT_STATUE_TABLE_NAME} WHERE reportId = '${reportId}' AND hashed_val = '${hash}'`;
    }

    const {
        rows,
        rowCount,
    } = await db.query(query);

    if (rowCount > 0) {

        const result = {
            reportId,
        };

        req.responseObj = {
            result,
            statusCode: 200
        };
        next();

    } else {
        next(new ErrorResponse(constants.MESSAGES.NO_REPORT, 404));
    }
});

/**
 * @description This controller method is used to update an existing report
 */
const updateReport = asyncErrorHandler(async (req, res, next) => {
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

            req.responseObj = {
                result,
                statusCode: 200
            };
            next();

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
    const filters = _.get(req, "body.request.filters") || {};
    const whereClause = _.keys(filters).length
        ? `WHERE ${_.join(
            _.map(
                filters,
                (value, key) =>
                    `${REPORT_TABLE_NAME}.${key} IN (${_.join(
                        _.map(value, (val) => `'${val}'`),
                        ", "
                    )})`
            ),
            " AND "
        )}`
        : "";

    const query = `SELECT ${REPORT_TABLE_NAME}.*, to_json(array_remove(array_agg(${REPORT_STATUE_TABLE_NAME}), NULL)) AS children FROM ${REPORT_TABLE_NAME}

    LEFT JOIN ${REPORT_STATUE_TABLE_NAME} ON ${REPORT_TABLE_NAME}.reportid = ${REPORT_STATUE_TABLE_NAME}.reportid ${whereClause} GROUP BY ${REPORT_TABLE_NAME}.reportid`

    const { rows, rowCount } = await db.query(query);
    const result = {
        reports: rows,
        count: rowCount,
    };

    req.responseObj = {
        result,
        statusCode: 200
    };
    next();
});

/**
 * @description find all jobsIds from a report
 * @param {*} reportConfig
 * @returns
 */
const getJobIds = reportConfig => {
    const dataSourcesObj = _.get(reportConfig, 'dataSource');
    const dataSources = (_.isArray(dataSourcesObj) && dataSourcesObj) || [];
    return _.map(dataSources, 'id');
}

/**
 * @description deactives an analytics job
 * @param {*} jobId
 * @returns
 */
const deactivateJob = jobId => {
    var config = {
        method: 'post',
        url: `${envVariables.DEACTIVATE_JOB_API.HOST}/${jobId}`,
        headers: {
            'Authorization': envVariables.DEACTIVATE_JOB_API.KEY,
            'Content-Type': 'application/json'
        }
    };
    return axios(config).then(response => {
        const { err, errmsg, status } = _.get(response, 'data.params');
        if (status === 'failed' || (err && errmsg)) {
            throw new Error(JSON.stringify({ err, errmsg, status }));
        }
    });
}

/**
 * @description deactivates all jobs whenever a report is retired
 * @param {*} report
 */
const deactivateAllJobsForReport = async jobIds => {
    try {
        const response = await Promise.all(_.map(jobIds, id => deactivateJob(id)));
        return true;
    } catch (error) {
        console.log(JSON.stringify(error));
        return false;
    }
}

/**
 * @description publish a report as live
 */
const publishOrRetireReport = (status) => asyncErrorHandler(async (req, res, next) => {

    const { reportId, hash } = req.params;

    if (status === 'retired' && !hash) {
        const reportConfig = _.get(req, 'responseObj.result.reports[0].reportconfig');
        if (reportConfig) {
            const jobIds = getJobIds(reportConfig);
            if (jobIds.length) {
                const success = await deactivateAllJobsForReport(jobIds);
                if (!success) {
                    return next(new ErrorResponse('failed to retire report', 500));
                }
            }
        }
    }

    let query = `UPDATE ${REPORT_TABLE_NAME} SET status = '${status}' where reportid = '${reportId}'`;

    if (hash) {

        let selectQuery = `SELECT * FROM ${REPORT_STATUE_TABLE_NAME} WHERE reportId = '${reportId}' AND hashed_val = '${hash}'`;

        const { rowCount } = await db.query(selectQuery);

        if (rowCount > 0) {
            query = `UPDATE ${REPORT_STATUE_TABLE_NAME} SET status = '${status}' where reportid = '${reportId}' AND hashed_val = '${hash}'`;
        } else {
            query = `INSERT into ${REPORT_STATUE_TABLE_NAME}(reportid, status, hashed_val) VALUES( '${reportId}', '${status}', '${hash}')`;
        }
    }

    const { rowCount } = await db.query(query);

    if (rowCount > 0) {

        const result = {
            reportId,
            ...(hash && { parameter_hash: hash })
        };

        req.responseObj = {
            result,
            statusCode: 200
        };

        next();

    } else {
        next(new ErrorResponse(constants.MESSAGES.NO_REPORT, 404));
    }
});

module.exports = {
    readReport, updateReport, listReports, deleteReport, createReport, publishOrRetireReport
}