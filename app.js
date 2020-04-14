const express = require('express');
const mountRoutes = require('./routes');
const app = express();
const { envVariables } = require('./helpers');

mountRoutes(app);

app.listen(envVariables.SERVER_PORT, () => {
    console.log(`server is running on port ${envVariables.SERVER_PORT}`);
});
