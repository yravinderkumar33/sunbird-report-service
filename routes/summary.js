const Router = require('express-promise-router');
const router = new Router();

const { listSummaries, createSummary, getChartSummary, getReportSummary } = require('../controllers/report-summary');

const { validateListSummaryAPI, validateCreateSummaryAPI } = require('../middlewares');

module.exports = router;

router.post("/list",
    validateListSummaryAPI,
    listSummaries
);

router.post("/create",
    validateCreateSummaryAPI,
    createSummary
);

router.get("/:reportid",
    getReportSummary
)

router.get("/:reportid/:chartid",
    getChartSummary
)
