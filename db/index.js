const { Pool } = require('pg');
const { envVariables } = require('../helpers');

// post is not required
// port: envVariables.DB.PORT

const pool = new Pool({
  host: envVariables.DB.HOST,
  database: envVariables.DB.NAME,
  password: envVariables.DB.PASSWORD,
  user: envVariables.DB.USER
})

module.exports = {
  query: (text, params) => pool.query(text, params)
}