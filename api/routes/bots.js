const extra = require('../../scripts/extras.js');
const moment = require('moment');

module.exports = (app, pool) => {
    app.get('/bots', (req, res) => {
        pool.query('SELECT * FROM Bots', (err, rows) => {
            res.json(rows.rows);
        });    
    });

    app.post('/bots/register', (req, res) => {
        const uid = extra.generateId();
        const token = extra.generateId();
        pool.query(`INSERT INTO Bots (
            id,
            token,
            ip_address,
            time_registered,
            time_last_seen,
            requests
        ) VALUES ($1,$2,$3,$4,$5,$6)`, [
            uid,
            token,
            req.ip,
            moment().format('YYYY-MM-DD HH:mm:ss'),
            moment().format('YYYY-MM-DD HH:mm:ss'),
            0
        ], (err) => {
            if (err) res.sendStatus(500);
            res.status(200, token);
        });
    });
};