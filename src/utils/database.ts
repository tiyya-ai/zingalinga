import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Secureweb2028!',
  database: process.env.DB_NAME || 'zingalinga',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool: mysql.Pool | null = null;

export const getConnection = async () => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
};

export const executeQuery = async (query: string, params: any[] = []) => {
  try {
    const connection = await getConnection();
    const [results] = await connection.execute(query, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};