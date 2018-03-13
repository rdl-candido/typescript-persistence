import { getMetadata } from "./../metadata";
import { TableMetadata } from "./../metadata/TableMetadata";

interface TableOptions
{
  name: string;
}

export function Table(): Function;

export function Table(options?: TableOptions): Function;

export function Table(options?: TableOptions): Function
{
  return function (target: any, key: string, desc: string)
  {
    const meta: TableMetadata = 
    {
      name: options && options.name || target.name,
      target: target.prototype.constructor
    }
    getMetadata().tables.push(meta)
  }
}