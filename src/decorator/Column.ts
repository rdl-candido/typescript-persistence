import { getMetadata } from "./../metadata";
import { ColumnMetadata } from "../metadata/ColumnMetadata";

interface ColumnOptions {
  name?: string;
  type?: string;
  primaryKey?: boolean;
}

export function Column(): Function;

export function Column(options?: ColumnOptions): Function;

export function Column(options?: ColumnOptions): Function 
{
  return function (target: any, key: string, descriptor: PropertyDescriptor)
  {
    let columnName = options && options.name || key;
    let columnType = options && options.type || undefined;

    let reflectType = Reflect.getMetadata("design:type", target, key);
    switch (reflectType.name)
    {
      // Left: javascript type 
      // Right: database type (mysql)
      case "Number": columnType = "number"; break;
    }

    const meta: ColumnMetadata = 
    {
      name: columnName,
      property: key,
      target: target.constructor,
      type: columnType,
      primaryKey: options && options.primaryKey || false
    }

    getMetadata().columns.push(meta);
  }
}