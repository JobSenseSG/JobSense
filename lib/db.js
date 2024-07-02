const { Pool } = require('pg');

const pool = new Pool({
    user: 'tsdbadmin',
    host: 'eydi80kwmc.h55gy9wi3m.tsdb.cloud.timescale.com',
    database: 'tsdb',
    password: 'ha3tr6r9irqh003s',
    port: 31425,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = pool;
