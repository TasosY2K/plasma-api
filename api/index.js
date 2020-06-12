require('dotenv').config();
const express = require('express');
const Pool = require('pg').Pool;

const filewalker = require('../scripts/filewalker.js');

const app = express();
const pool = new Pool({
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB
});

app.set('json spaces', 2);

(async () => {
    const routes = await filewalker.walk(__dirname + '/routes/');

    routes.forEach((route) => {
        const time = new Date().getMilliseconds();
        require(route.path)(app, pool);
        console.log(`[ROUTE] Loaded route ${route.name} in ${new Date().getMilliseconds() - time}ms`);
    });

    app.get('*', (req, res) => {
        res.sendStatus(404);
    }); 
})();

app.listen(process.env.PORT, () => {
    console.log('[EXPRESS] App started at port', process.env.PORT);
})