require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Pool = require('pg').Pool;
const figlet = require('figlet');

const filewalker = require('../scripts/filewalker.js');

console.log(figlet.textSync('plasma-api', {font: 'Graffiti'}));

const app = express();
const pool = new Pool({
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB
});

app.set('json spaces', 2);
app.use(cors());

(async () => {
    const routes = await filewalker.walk(__dirname + '/routes/');

    routes.forEach((route) => {
        const time = new Date().getMilliseconds();
        require(route.path)(app, pool);
        console.log(`[EXPRESS] Loaded route ${route.name} in ${new Date().getMilliseconds() - time}ms`);
    });

    app.get('/', (req, res) => {
        res.sendStatus(200);
    }); 

    app.get('*', (req, res) => {
        res.sendStatus(404);
    }); 
})();

app.listen(process.env.PORT, '0.0.0.0', () => console.log('[EXPRESS] Server started at port', process.env.PORT));