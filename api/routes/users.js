module.exports = (app, pool) => {
    app.get('/users', (req, res) => {
        pool.query('SELECT * FROM Users', (err, rows) => {
            res.json(rows.rows);
        });    
    });
};