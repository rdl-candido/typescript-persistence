import { Pool, createPool, PoolConnection } from "mysql";

interface ConnectionOptions
{
  database: string;
  username: string;
  password: string;
}

let pool: Pool;

export function createPoolConnection(options: ConnectionOptions): Promise<Pool>
{
  return new Promise((ok, fail) =>
  {
    if (pool)
    {
      return Promise.resolve(pool);
    }

    pool = createPool({
      database: options.database,
      user: options.username,
      password: options.password
    });

    pool.getConnection((err, connection: PoolConnection) => 
    {
      if (err)
      {
        return pool.end(() =>
        {
          fail(err)
        });
      }

      connection.release();
      
      ok(pool);
    });
  })
}