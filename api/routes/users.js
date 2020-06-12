module.exports = (app, pool) => {
    app.get('/users', (req, res) => {
        pool.query('SELECT * FROM Users', (err, rows) => {
            res.json(rows.rows);
        });    
    });

    app.post('/users/register/:username/:password', (req, res) => {
        let {username, password} = req.params;
        if (username && password) {
            const uuid = extra.generateId();
            pool.query(`INSERT INTO Users (
                id,
                username,
                password,
                ip_address,
                time_registered
            ) VALUES ($1,$2,$3,$4,$5)`, [
                uuid,
                username,
                bcrypt.hashSync(password),
                req.ip,
                moment().format('YYYY-MM-DD HH:mm:ss')
            ], (err) => {
                if (err) res.send(err);
                res.sendStatus(201);
            });
        }
    });

    app.post('/users/login/:username/:password', (req, res) => {
        let {username, password} = req.params;
        if (username && password) {
             pool.query('SELECT password FROM Users WHERE username = $1', [username], (err, rows) => {
                 if (bcrypt.compareSync(password, rows.rows[0].password)) {
                     req.session.logedin = true;
                     res.sendStatus(200);
                 } else {
                     res.sendStatus(400);
                 }
             });
        } else {
            res.sendStatus(400);
        }
    });

    app.get('/logout', (req, res) => {
        req.session.destroy();
        res.redirect('/devices');
    });
};