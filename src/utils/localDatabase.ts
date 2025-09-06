import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // Set your MySQL root password
  database: 'zingalinga_local'
};

export async function getConnection() {
  return await mysql.createConnection(dbConfig);
}

export async function query(sql: string, params?: any[]) {
  const connection = await getConnection();
  try {
    const [results] = await connection.execute(sql, params);
    return results;
  } finally {
    await connection.end();
  }
}