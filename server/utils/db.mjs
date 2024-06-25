// Create PostgreSQL Connection Pool here !
import * as pg from "pg";
const { Pool } = pg.default;
import "dotenv/config";

console.log(process.env.DB_URL);
const connectionPool = new Pool({
  connectionString: process.env.DB_URL,
});

export default connectionPool;
