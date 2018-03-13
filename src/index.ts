process.env.database = "test";
process.env.username = "root";
process.env.password = "abc123##";

import 'reflect-metadata';

import { Db } from "./common/Db";
import { BaseModel } from "./common/BaseModel";
import { Column } from "./decorator/column";
import { Table } from './decorator/table';

@Table({ name: "tbl_tests" })
class Test extends BaseModel
{
  @Column({ primaryKey: true })
  id: number;

  @Column({ name: "name", type: "string" })
  name: string;

  @Column()
  age: number;
}

const db = new Db();

(async function ()
{
  try
  {

  await db.Connect();
  
  const a = new Test();

  // const all = await db.Find<Test>(Test, ["id", "name", "age"]);
  // console.log(all);

  // a.name = "Carol";
  // a.age = 29;
  // await db.Insert<Test>(a);

  // a.id = 20;
  // a.age = 44;
  // a.name = "Alessandra";
  // await db.Update<Test>(a, ["name", "age"]);

  // a.id = 18;
  // await db.Delete<Test>(a);

  process.exit(0);

  }
  catch (e)
  {
    console.error(e);
    process.exit(1);
  }

})()