const Router = require('express-promise-router');
const router = new Router();
const summaryRoutes = require('./summary');

const { readReport, createReport, deleteReport, updateReport, listReports, publishOrRetireReport } = require('../controllers/reports');

const { validateCreateReportAPI, validateReadReportAPI, validateDeleteReportAPI, validateListReportAPI, validateUpdateReportAPI, setApiResponseId, sendResponse } = require('../middlewares');

module.exports = router;

router.get(
    "/get/:reportId",
    setApiResponseId("api.report.read"),
    validateReadReportAPI,
    readReport,
    sendResponse
);

router.get(
    "/get/:reportId/:hash",
    setApiResponseId("api.report.read"),
    validateReadReportAPI,
    readReport,
    sendResponse
);

router.post(
    "/create",
    setApiResponseId("api.report.create"),
    validateCreateReportAPI,
    createReport,
    sendResponse
);

router.delete(
    "/delete/:reportId",
    setApiResponseId("api.report.delete"),
    validateDeleteReportAPI,
    deleteReport,
    sendResponse
);

router.delete(
    "/delete/:reportId/:hash",
    setApiResponseId("api.report.delete"),
    validateDeleteReportAPI,
    deleteReport,
    sendResponse
);

router.patch(
    "/update/:reportId",
    setApiResponseId("api.report.update"),
    validateUpdateReportAPI,
    updateReport,
    sendResponse);

router.post(
    "/list",
    setApiResponseId("api.report.list"),
    validateListReportAPI,
    listReports,
    sendResponse);

router.get(
    "/publish/:reportId",
    setApiResponseId('api.report.publish'),
    publishOrRetireReport('live'),
    sendResponse
)

router.get(
    "/publish/:reportId/:hash",
    setApiResponseId('api.report.publish'),
    publishOrRetireReport('live'),
    sendResponse
)

router.get(
    "/retire/:reportId",
    setApiResponseId('api.report.retire'),
    readReport,
    publishOrRetireReport('retired'),
    sendResponse
)

router.get(
    "/retire/:reportId/:hash",
    setApiResponseId('api.report.retire'),
    publishOrRetireReport('retired'),
    sendResponse
)

router.use('/summary', summaryRoutes);

