const fs = require('fs');
const extra = require('../../scripts/extras.js');
const axios = require('axios');
const ipInfo = require('ipinfo');
const webshot = require('webshot-node');
const moment = require('moment');

module.exports = (app, pool) => {
    app.get('/devices', (req, res) => {
        pool.query('SELECT * FROM Devices', (err, rows) => {
            res.json(rows.rows);
        });    
    });

    app.get('/devices/:id', (req, res) => {
        const id = req.params.id;
        if (extra.validateIp(id)) {
            pool.query('SELECT * FROM Devices WHERE ip_address = $1', [id], (err, rows) => {
                if (rows.rows.length > 0) {
                    res.json(rows.rows);
                } else {
                    res.sendStatus(404);
                }
            });
        } else if (id) {
            pool.query('SELECT * FROM Devices WHERE id = $1', [id], (err, rows) => {
                if (rows.rows.length > 0) {
                    res.json(rows.rows);
                } else {
                    res.sendStatus(404);
                }
            });
        } else {
            res.sendStatus(400);
        }
    });

    app.get('/devices/img/:id', (req, res) => {
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

    app.get('/devices/search/title/:term', (req, res) => {
        const term = req.params.term;
        if (term) {
            pool.query('SELECT * FROM Devices WHERE title LIKE $1', ['%' + term + '%'] , (err, rows) => {
                if (err) res.sendStatus(err);
                res.send(rows.rows);
            });
        } else {
            res.sendStatus(400);
        }
    });
    
    app.get('/devices/search/ip/:term', (req, res) => {
        const term = req.params.term;
        if (term) {
            pool.query('SELECT * FROM Devices WHERE ip_address LIKE $1', ['%' + term + '%'] , (err, rows) => {
                if (err) res.sendStatus(err);
                res.send(rows.rows);
            });
        } else {
            res.sendStatus(400);
        }
    });

    app.post('/devices/:ipAddress', (req, res) => {
        let {ipAddress} = req.params;
        if (ipAddress) {
            if (extra.validateIp(ipAddress)) {
                axios({
                    method: 'get',
                    url: 'http://' + ipAddress
                }).then((response) => {
                    const title = response.data.split("<title>")[1].split("</title>")[0];
                    const statusCode = response.status;
                    if (statusCode != 200) {
                        res.send(502);
                    } else {
                        ipInfo(ipAddress, (err, data) => {
                            if (err) res.sendStatus(500);
                            const uid = extra.generateId();
                            const imagePath = __dirname + '/img/' + uid + '.png'
                            webshot('http://' + ipAddress, imagePath, (err) => {
                                if (err) res.sendStatus(500);
                                pool.query(`INSERT INTO Devices (
                                    id, 
                                    ip_address,
                                    status_code, 
                                    title, 
                                    Country, 
                                    ISP, 
                                    time_located, 
                                    image_path, 
                                    votes,
                                    views
                                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [
                                    uid, 
                                    ipAddress,
                                    Number(statusCode), 
                                    title, 
                                    data.country, 
                                    data.org,
                                    moment().format('MMMM Do YYYY, h:mm:ss a'),
                                    imagePath,
                                    0,
                                    0
                                ], () => {
                                    res.sendStatus(201);
                                });
                            });
                        }); 
                    }
                });
            } else {
                res.sendStatus(400);
            }
        } else {
            res.sendStatus(400);
        }
    });
    
    app.get('*', (req, res) => {
        res.sendStatus(404);
    });
    
};