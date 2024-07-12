const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres.vajvudbmcgzbyivvtlvy',
    host: 'aws-0-ap-northeast-2.pooler.supabase.com',
    database: 'postgres',
    password: 'adi20040904@home',
    port: 6543,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = pool;
