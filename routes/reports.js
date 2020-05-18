const Router = require('express-promise-router');
const router = new Router();
const summaryRoutes = require('./summary');

const { readReport, createReport, deleteReport, updateReport, listReports } = require('../controllers/reports');

const { validateCreateReportAPI, validateReadReportAPI, validateDeleteReportAPI, validateListReportAPI, validateUpdateReportAPI } = require('../middlewares');

module.exports = router;

router.get(
    "/get/:reportId",
    validateReadReportAPI,
    readReport
);

router.post(
    "/create",
    validateCreateReportAPI,
    createReport
);

router.delete(
    "/delete/:reportId",
    validateDeleteReportAPI,
    deleteReport
);

router.patch(
    "/update/:reportId",
    validateUpdateReportAPI,
    updateReport);

router.post(
    "/list",
    validateListReportAPI,
    listReports);

router.use('/summary', summaryRoutes);

