'use strict'
const { get } = require('lodash');
const env = get(process, 'env');
const fs = require('fs');
const packageObj = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const envVariables = {
    DB: {
        HOST: get(env, 'SUNBIRD_REPORTS_DB_HOST') || 'localhost',
        NAME: get(env, 'SUNBIRD_REPORTS_DB_NAME') || 'report',
        PASSWORD: get(env, 'SUNBIRD_REPORTS_DB_PASSWORD') || '',
        PORT: get(env, 'SUNBIRD_REPORTS_DB_PORT') || 5432,
        USER: get(env, 'SUNBIRD_REPORTS_DB_USER') || ''
    },
    SERVER_PORT: get(env, 'SUNBIRD_SERVER_PORT') || 3030,
    BASE_REPORT_URL: get(env, 'SUNBIRD_BASE_REPORT_URL') || 'report',
    TABLE_NAME: get(env, 'SUNBIRD_REPORTS_TABLE_NAME') || 'report',
    SUMMARY_TABLE_NAME: get(env, 'SUNBIRD_REPORT_SUMMARY_TABLE_NAME') || 'report_summary',
    ENV: get(env, 'SUNBIRD_ENV') || 'https://dev.sunbirded.org',
    DEACTIVATE_JOB_API: {
        HOST: get(env, 'DEACTIVATE_JOB_API_HOST') || '',
        KEY: `Bearer ${get(env, 'DEACTIVATE_JOB_API_KEY')}`
    }
}

module.exports = { envVariables, packageObj };