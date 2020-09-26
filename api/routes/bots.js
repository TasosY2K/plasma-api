const moment = require('moment');

const extra = require('../../scripts/extras.js');

module.exports = (app, pool) => {
    app.get('/bots/token/:token', (req, res) => {
        const token = req.params.token;
        if (token) {
            pool.query('SELECT * FROM Bots WHERE token = $1', [token], (err, rows) => {
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

    app.post('/bots/register', (req, res) => {
        const uuid = extra.generateId();
        const token = extra.generateId();
        pool.query(`INSERT INTO Bots (
            id,
            token,
            ip_address,
            time_registered,
            time_last_seen,
            requests
        ) VALUES ($1,$2,$3,$4,$5,$6)`, [
            uuid,
            token,
            req.ip,
            moment().format('YYYY-MM-DD HH:mm:ss'),
            moment().format('YYYY-MM-DD HH:mm:ss'),
            0
        ], (err) => {
            if (err) res.send(err);
            res.json({
                "id": uuid,
                "token": token 
            });
        });
    });
};