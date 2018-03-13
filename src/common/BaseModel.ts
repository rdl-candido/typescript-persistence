export abstract class BaseModel
{
  public async Insert<T>(): Promise<void>
  {
    return Promise.resolve();
  }
  
  public async Update<T>(): Promise<void>
  {
    return Promise.resolve();
  }

  public async Delete<T>(): Promise<void>
  {
    return Promise.resolve();
  }

  static async FindOneById<T>(): Promise<void>
  {
    return Promise.resolve();
  }
  static async FindOne<T>(): Promise<void>
  {
    return Promise.resolve();
  }
  static async Find<T>(): Promise<void>
  {
    return Promise.resolve();
  }
}