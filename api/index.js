require('dotenv').config();
const express = require('express');
const session = require('express-session');
const Pool = require('pg').Pool;

const filewalker = require('../scripts/filewalker.js');
const extra = require('../scripts/extras.js');

const app = express();
const pool = new Pool({
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB
});

app.use(session({
    secret: extra.generateId(),
    resave: true, 
    saveUninitialized: true
}));

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

app.listen(process.env.PORT, '0.0.0.0', () => console.log('[EXPRESS] Server started at port', process.env.PORT));