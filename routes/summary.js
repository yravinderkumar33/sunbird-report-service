const Router = require('express-promise-router');
const db = require('../db');
const router = new Router();
const _ = require('lodash');
const { v4 } = require('uuid');
const { envVariables, sendApiResponse, constants } = require('../helpers');
const { asyncErrorHandler } = require('../middlewares');
const SUMMARY_TABLE_NAME = _.get(envVariables, 'SUMMARY_TABLE_NAME');

const { validateListSummaryAPI, validateCreateSummaryAPI } = require('../middlewares');

module.exports = router;

router.post("/list",
    validateListSummaryAPI,
    asyncErrorHandler(async (req, res, next) => {

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
    }));

router.post("/create",
    validateCreateSummaryAPI,
    asyncErrorHandler(async (req, res, next) => {
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
    }));

