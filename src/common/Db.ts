import { getMetadata } from "./../metadata";
import { BaseModel } from "./BaseModel";
import { PoolConnection } from "mysql";
import { createPoolConnection } from "./DbConnection";
import { ColumnMetadata } from "../metadata/ColumnMetadata";

export class Db
{
  private connection: PoolConnection;

  constructor(private readonly autoCommit: boolean = false)
  {
  }

  async Connect(): Promise<any>
  {
    if (this.connection)
    {
      return Promise.resolve();
    }

    const pool = await createPoolConnection({
      database: process.env.database,
      username: process.env.username,
      password: process.env.password,
    });

    return new Promise((ok, fail) => 
    {
      pool.getConnection((err, connection) => 
      {
        if (err)
        {
          return fail(err);
        }
        else
        {
          this.connection = connection;
          return ok();
          // this.connection.connect((err) =>
          // {
          //   if (err)
          //   {
          //     return fail(err);
          //   }
          //   else
          //   {
          //     return ok();
          //   }
          // })
        }
      })
    })
  }

  async Disconnect(): Promise<void>
  {
    if (!this.connection)
    {
      return Promise.reject("It isn't connected")
    }
    this.connection.release();
    return Promise.resolve();
  }

  async Insert<T extends BaseModel>(obj: T): Promise<any>
  {
    const target = obj.constructor;

    const tableMetadata = getMetadata().tables.find(table => table.target.name === target.name);

    if (!tableMetadata)
    {
      throw new Error(`Type "${target.name}" not found`);
    }

    const columnsMetadata = getMetadata().columns.filter(column => column.target.name === target.name);

    const primaryColumn = columnsMetadata.find(column => column.primaryKey);
    
    const columnsToQuery: ColumnMetadata[] = [];
    const valuesToQuery: any[] = [];

    for (const prop of columnsMetadata)
    {
      if (prop.primaryKey)
      {
        continue;
      }

      if (!obj.hasOwnProperty(prop.property))
      {
        continue;
      }

      const propValue = obj[prop.property];

      columnsToQuery.push(prop);
      valuesToQuery.push(propValue); // Here we should escape the value so mysql can save it correctly??
    }

    // INSERT INTO tbl_tests (field1, field2) VALUES (value1, value2);
    const sqlCommand = `INSERT INTO ${tableMetadata.name} (${columnsToQuery.map(c => c.name).join(", ")}) VALUES (${columnsToQuery.map(c => "?").join(", ")});`

    // console.log(sqlCommand);

    const dataSet = await this.Query(sqlCommand, valuesToQuery);

    // console.log(dataSet);

    // We should retrieve this object again because the database might have default values
    obj[primaryColumn.property] = dataSet.insertId;

    return Promise.resolve(obj);
  }

  async Update<T extends BaseModel>(obj: T, properties: String[]): Promise<any>
  {
    const target = obj.constructor;

    const tableMetadata = getMetadata().tables.find(table => table.target.name === target.name);

    if (!tableMetadata)
    {
      throw new Error(`Type "${target.name}" not found`);
    }

    const columnsMetadata = getMetadata().columns.filter(column => column.target.name === target.name);

    const primaryColumn = columnsMetadata.find(column => column.primaryKey);
    const primaryColumnValue = obj[primaryColumn.property];
    
    const columnsToQuery: ColumnMetadata[] = [];
    const valuesToQuery: any[] = [];

    // Checking properties required for select
    for (const prop of properties)
    {
      const found = columnsMetadata.find(column => column.property === prop)
      if (!found)
      {
        throw new Error(`Property "${prop}" not found in the type "${tableMetadata.target.name}"`);
      }
      else
      {
        if (found.primaryKey)
        {
          continue;
        }

        if (!obj.hasOwnProperty(found.property))
        {
          continue;
        }

        const propValue = obj[found.property];

        columnsToQuery.push(found);
        valuesToQuery.push(propValue); // Here we should escape the value so mysql can save it correctly??
      }
    }

    // Adding the primary key value into params list to match number of "?"
    valuesToQuery.push(primaryColumnValue);

    // UPDATE tbl_tests SET field1 = value1, field2 = value2 WHERE id=?;
    const sqlCommand = `UPDATE ${tableMetadata.name} SET ${columnsToQuery.map(c => c.name + " = ?").join(", ")} WHERE ${primaryColumn.name}=?;`

    // console.log(sqlCommand);

    const dataSet = await this.Query(sqlCommand, valuesToQuery);

    // console.log(dataSet);

    return Promise.resolve(obj);
  }

  async Delete<T extends BaseModel>(obj: T): Promise<any>
  {
    const target = obj.constructor;

    const tableMetadata = getMetadata().tables.find(table => table.target.name === target.name);

    if (!tableMetadata)
    {
      throw new Error(`Type "${target.name}" not found`);
    }

    const columnsMetadata = getMetadata().columns.filter(column => column.target.name === target.name);

    const primaryColumn = columnsMetadata.find(column => column.primaryKey);
    const primaryColumnValue = obj[primaryColumn.property];

    // DELETE tbl_tests WHERE id=?;
    const sqlCommand = `DELETE FROM ${tableMetadata.name} WHERE ${primaryColumn.name}=?;`

    // console.log(sqlCommand);

    const dataSet = await this.Query(sqlCommand, [primaryColumnValue]);

    // console.log(dataSet);

    return Promise.resolve(obj);
  }

  async FindOneById<T>(target: { new(): T }, id: number): Promise<void>
  {
    return Promise.resolve();
  }
  
  async FindOne<T>(target: { new(): T }, where?: string): Promise<T>
  {
    const result = new target();
    console.log(`FindOne: ${where}`);
    return Promise.resolve(result);
  }

  async Find<T>(target: { new(): T }, properties: String[], where?: string): Promise<T[]>
  {
    const tableMetadata = getMetadata().tables.find(table => table.target.name === target.name);

    if (!tableMetadata)
    {
      throw new Error(`Type "${target.name}" not found`);
    }

    const columnsMetadata = getMetadata().columns.filter(column => column.target.name === target.name);
    const columnsToQuery: ColumnMetadata[] = [];

    // Checking properties required for select
    for (const prop of properties)
    {
      const found = columnsMetadata.find(column => column.property === prop)
      if (!found)
      {
        throw new Error(`Property "${prop}" not found in the type "${tableMetadata.target.name}"`);
      }
      else
      {
        columnsToQuery.push(found);
      }
    }

    let sqlCommand = `SELECT ${columnsToQuery.map(c => c.name).join(', ')} FROM ${tableMetadata.name}`;

    const dataSet = await this.Query(sqlCommand, []);

    const result: T[] = [];

    for (const item of dataSet)
    {
      const columnNames = Object.keys(item);
      const resultItem = new target();
      for (const columnName of columnNames)
      {
        const column = columnsToQuery.find(column => column.name === columnName);
        resultItem[column.property] = item[columnName];
      }
      result.push(resultItem);
    }

    return Promise.resolve(result);
  }

  private async Query(sql: string, params: any): Promise<any>
  {
    return new Promise(async (ok, fail) =>
    {
      try
      {
        const start = Date.now();
        this.connection.query(sql, params, (err, rs) =>
        {
          const end = Date.now();
          const diff = (end-start)/1000 + 's';
          if (err)
          {
            console.log(`Query error (${diff}): ${sql} | ${err}`)
            return fail(err);
          }
          console.log(`Query (${diff}): ${sql}`);
          return ok(rs);
        })
      }
      catch (e)
      {
        return fail(e);
      }
    });
  }
}