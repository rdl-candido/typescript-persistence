import { TableMetadata } from "./metadata/TableMetadata";
import { ColumnMetadata } from "./metadata/ColumnMetadata";

class Metadata
{
  readonly tables: TableMetadata[] = [];
  readonly columns: ColumnMetadata[] = [];
}

let globalMetadata: Metadata;

export function getMetadata(): Metadata
{
  if (!globalMetadata)
  {
    globalMetadata = new Metadata();
  }
  return globalMetadata;
}