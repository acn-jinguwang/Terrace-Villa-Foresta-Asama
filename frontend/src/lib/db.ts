import mysql from 'mysql2/promise';

let pool: mysql.Pool | undefined;

export function getDb(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host:             process.env.DB_HOST     || 'localhost',
      port:             Number(process.env.DB_PORT || 3306),
      user:             process.env.DB_USER     || 'root',
      password:         process.env.DB_PASS     || '',
      database:         process.env.DB_NAME     || 'foresta_asama',
      waitForConnections: true,
      connectionLimit:  5,
      charset:          'utf8mb4',
      // RDS requires SSL; disable for local MySQL by omitting DB_SSL
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    });
  }
  return pool;
}
