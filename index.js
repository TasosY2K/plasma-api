require('dotenv').config();
const fs = require('fs');
const express = require('express');
const Pool = require('pg').Pool;
const ipInfo = require('ipinfo');
const webshot = require('webshot-node');
const moment = require('moment');

const app = express();
const pool = new Pool({
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB
});

const generateId = () => {
    return '_' + Math.random().toString(36).substr(2, 9);
};

const validateIp = (ip) => {
    if (typeof(ip) !== 'string')
        return false;
    if (!ip.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)) {
        return false;
    }
    return ip.split('.').filter(octect => octect >= 0 && octect <= 255).length === 4;
}

app.get('/devices', (req, res) => {
    pool.query('SELECT * FROM Devices', (err, rows) => {
        res.json(rows.rows);
    });    
});

app.get('/devices/search/:term', (req, res) => {
    const term = req.params.term;
    if (term) {
        pool.query('SELECT Devices FROM title WHERE title LIKE $1', ['%' + term + '%'] , (err, rows) => {
            if (err) res.sendStatus(err);
            res.send(rows)
        });
    } else {
        res.sendStatus(400)
    }
});

app.post('/devices/:ipAddress/:statusCode/:title', (req, res) => {
    let {ipAddress, statusCode, title} = req.params;
    if (ipAddress && statusCode && title) {
        if (validateIp(ipAddress)) {
            ipInfo(ipAddress, (err, data) => {
                if (err) res.sendStatus(501);
                const uid = generateId();
                webshot('http://' + ipAddress, './img/' + uid + '.png', (err) => {
                    if (err) res.sendStatus(501);
                    pool.query(`INSERT INTO Devices (
                        id, 
                        ip_address,
                        status_code, 
                        title, 
                        Country, 
                        ISP, 
                        time_located, 
                        image_path, 
                        votes
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [
                        uid, 
                        ipAddress,
                        Number(statusCode), 
                        title, 
                        data.country, 
                        data.org,
                        moment().format('MMMM Do YYYY, h:mm:ss a'),
                        __dirname + '/img/' + uid + '.png',
                        0
                    ], () => {
                        res.sendStatus(200);
                    });
                });
            });
        } else {
            res.sendStatus(400);
        }
    } else {
        res.sendStatus(400);
    }
});

app.get('/img/:id', (req, res) => {
    const id = req.params.id;
    if (id) {
        pool.query('SELECT image_path FROM Devices WHERE id = $1', [id], (err, rows) => {
            if (rows.rows.length > 0) {
                let img = fs.readFileSync(rows.rows[0].image_path);
                res.writeHead(200, {'Content-Type': 'image/png'});
                res.end(img, 'binary');
            } else {
                res.sendStatus(404);
            }
        });
    } else {
        res.sendStatus(400);
    }
});

app.get('*', (req, res) => {
    res.sendStatus(404);
});

app.listen(process.env.PORT, () => {
    console.log('App started at port', process.env.PORT);
})