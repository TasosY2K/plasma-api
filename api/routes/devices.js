const fs = require('fs');
const axios = require('axios');
const ipInfo = require('ipinfo');
const webshot = require('webshot-node');
const moment = require('moment');

const extra = require('../../scripts/extras.js');

module.exports = (app, pool) => {
    app.get('/devices', (req, res) => {
        pool.query('SELECT * FROM Devices', (err, rows) => {
            res.json(rows.rows);
        });
    });

    app.get('/devices/id/:id', (req, res) => {
        const id = req.params.id;
        if (id) {
            pool.query('SELECT * FROM Devices WHERE id = $1', [id], (err, rows) => {
                res.json(rows.rows);
            });
        } else {
            res.sendStatus(400);
        }
    });

    app.get('/devices/num/:start/:end', (req, res) => {
        const start = req.params.start;
        const end = req.params.end;
        if (start && end) {
            pool.query('SELECT * FROM Devices WHERE num BETWEEN $1 and $2', [start, end], (err, rows) => {
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

    app.get('/devices/ip/:ip', (req, res) => {
        const ip = req.params.ip;
        if (extra.validateIp(ip)) {
            pool.query('SELECT * FROM Devices WHERE ip_address = $1', [ip], (err, rows) => {
                res.json(rows.rows);
            });
        } else {
            res.sendStatus(400);
        }
    });
    
    app.get('/devices/country/:country', (req, res) => {
        const country = req.params.country;
        if (country) {
            pool.query('SELECT * FROM Devices WHERE Country = $1', [country], (err, rows) => {
                res.json(rows.rows);
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

    app.get('/devices/search/region/:term', (req, res) => {
        const term = req.params.term;
        if (term) {
            pool.query('SELECT * FROM Devices WHERE region LIKE $1', ['%' + term + '%'] , (err, rows) => {
                if (err) res.sendStatus(err);
                res.send(rows.rows);
            });
        } else {
            res.sendStatus(400);
        }
    });

    app.get('/devices/search/isp/:term', (req, res) => {
        const term = req.params.term;
        if (term) {
            pool.query('SELECT * FROM Devices WHERE isp LIKE $1', ['%' + term + '%'] , (err, rows) => {
                if (err) res.sendStatus(err);
                res.send(rows.rows);
            });
        } else {
            res.sendStatus(400);
        }
    });
    
    app.post('/devices/:ipAddress/:botToken', (req, res) => {
        let {ipAddress, botToken} = req.params;
        if (ipAddress && botToken) {
            if (extra.validateIp(ipAddress)) {
                pool.query('SELECT requests FROM Bots WHERE token = $1', [botToken], (err, rows) => {
                    const botRows = rows;                    
                    if (!botRows.rows.length) {
                        res.sendStatus(401);
                    } else {
                        pool.query('SELECT id FROM Devices WHERE ip_address = $1', [ipAddress], (err, rows) => {
                            if (rows.rows.length > 0) {
                                res.sendStatus(409);
                            } else {
                                axios({
                                    method: 'get',
                                    url: 'http://' + ipAddress
                                }).then((response) => {
                                    let title;
                                    if (!response.data || !response.data.includes('<title>') || response.data.includes('�')) {
                                        title = 'No Title';
                                    } else {
                                        title = response.data.toString().split('<title>')[1].split('</title>')[0];
                                    }
                                    const statusCode = response.status;
                                    if (statusCode != 200) {
                                        res.sendStatus(502);
                                    } else {
                                        ipInfo(ipAddress, (err, data) => {                            
                                            if (err) {
                                                res.sendStatus(500);
                                            } else {
                                                const uid = extra.generateId();
                                                const imagePath = 'api/img/' + uid + '.png'
                                                webshot('http://' + ipAddress, imagePath, err => {
                                                    if (err) {
                                                        res.sendStatus(500);
                                                    } else {
                                                        pool.query(`INSERT INTO Devices (
                                                            id, 
                                                            ip_address,
                                                            status_code, 
                                                            title, 
                                                            country,
                                                            region,
                                                            city, 
                                                            isp,
                                                            location,
                                                            time_located, 
                                                            image_path
                                                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`, [
                                                            uid, 
                                                            ipAddress,
                                                            Number(statusCode), 
                                                            title, 
                                                            data.country,
                                                            data.region,
                                                            data.city,
                                                            data.org,
                                                            data.loc,
                                                            moment().format('YYYY-MM-DD HH:mm:ss'),
                                                            imagePath
                                                        ], () => {
                                                            pool.query('UPDATE Bots SET ip_address = $1, time_last_seen = $2, requests = $3 WHERE token = $4', [
                                                                req.ip, moment().format('YYYY-MM-DD HH:mm:ss'), parseInt(botRows.rows[0].requests) + 1, botToken
                                                            ], () => {
                                                                console.log(`[BOT] upload from ${req.ip} | ${botToken}`);
                                                                res.sendStatus(201);
                                                            });
                                                        });
                                                    }
                                                });
                                            }
                                        }); 
                                    }
                                }).catch(err => {
                                    if (err) res.sendStatus(406);
                                });
                            }
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
    
    /* Not really safe for now
    app.delete('/devices/:id', (req, res) => {
        const id = req.params.id;
        if (id) {
            pool.query('SELECT * FROM Devices WHERE id = $1', [id], (err, rows) => {
                if (err) res.sendStatus(500);
                if (rows.rows.length > 0) {
                    fs.unlinkSync(rows.rows[0].image_path);
                    pool.query('DELETE FROM Devices WHERE id = $1', [id], (err) => {
                        if (err) res.sendStatus(500);
                        res.sendStatus(200);
                    });
                } else {
                    res.sendStatus(404);
                }
            });
        } else {
            res.sendStatus(400);   
        }
    });
    */
};