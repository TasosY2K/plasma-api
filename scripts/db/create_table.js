require('dotenv').config();
const fs = require('fs');
const Pool = require('pg').Pool;

let pool = new Pool({
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
});

pool.query('CREATE DATABASE iot_votes_api', (err) => {
    if (err) throw err;
    pool = new Pool({
        port: process.env.DB_PORT,
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB
    });
    pool.query(fs.readFileSync(__dirname + "/sql/create_table_Users.sql").toString(), (err) => {
        if (err) throw err;
        pool.query(fs.readFileSync(__dirname + "/sql/create_table_Devices.sql").toString(), (err) => {
            if (err) throw err;
            console.log('Database setup complete ✅');
            process.exit();
        });
    });
});
