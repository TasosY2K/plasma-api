const extra = require('../../scripts/extras.js');
const moment = require('moment');
const bcrypt = require('bcryptjs');

module.exports = (app, pool) => {
    app.get('/bots', (req, res) => {
        pool.query('SELECT * FROM Bots', (err, rows) => {
            res.json(rows.rows);
        });    
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
            bcrypt.hashSync(token),
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