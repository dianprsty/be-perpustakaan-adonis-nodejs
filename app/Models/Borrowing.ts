import { DateTime } from "luxon";
import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

export default class Borrowing extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public tanggalPinjam: DateTime;

  @column()
  public tanggalKembali: DateTime;

  @column()
  public isReturned: boolean;

  @column()
  public userId: number;

  @column()
  public bookId: number;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
