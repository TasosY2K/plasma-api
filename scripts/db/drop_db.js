require('dotenv').config();
const Pool = require('pg').Pool;

let pool = new Pool({
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
});

pool.query('DROP DATABASE iot_votes_api', (err) => {
    if (err) throw err;
    console.log('[PSQL] Database dropped ✅');
    process.exit();
});


