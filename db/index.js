const { Pool } = require('pg');
const { envVariables } = require('../helpers');

const pool = new Pool({
  host: envVariables.DB.HOST,
  database: envVariables.DB.NAME,
  password: envVariables.DB.PASSWORD,
  user: envVariables.DB.USER,
  port: envVariables.DB.PORT
})

module.exports = {
  query: (text, params) => pool.query(text, params)
}