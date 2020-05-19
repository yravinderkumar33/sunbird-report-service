const Router = require('express-promise-router');
const router = new Router();
const summaryRoutes = require('./summary');

const { readReport, createReport, deleteReport, updateReport, listReports, publishOrRetireReport } = require('../controllers/reports');

const { validateCreateReportAPI, validateReadReportAPI, validateDeleteReportAPI, validateListReportAPI, validateUpdateReportAPI, setApiResponseId } = require('../middlewares');

module.exports = router;

router.get(
    "/get/:reportId",
    setApiResponseId("api.report.read"),
    validateReadReportAPI,
    readReport
);

router.post(
    "/create",
    setApiResponseId("api.report.create"),
    validateCreateReportAPI,
    createReport
);

router.delete(
    "/delete/:reportId",
    setApiResponseId("api.report.delete"),
    validateDeleteReportAPI,
    deleteReport
);

router.patch(
    "/update/:reportId",
    setApiResponseId("api.report.update"),
    validateUpdateReportAPI,
    updateReport);

router.post(
    "/list",
    setApiResponseId("api.report.list"),
    validateListReportAPI,
    listReports);

router.get(
    "/publish/:reportId",
    setApiResponseId('api.report.publish'),
    publishOrRetireReport('live')
)

router.get(
    "/retire/:reportId",
    setApiResponseId('api.report.retire'),
    publishOrRetireReport('retired')
)

router.use('/summary', summaryRoutes);

