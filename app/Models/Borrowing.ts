import { DateTime } from "luxon";
import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

/**
 * @swagger
 * components:
 *  schemas:
 *      Borrowing:
 *        type: object
 *        properties:
 *          id:
 *            type: number
 *          tanggal_pinjam:
 *            type: string
 *          tanggal_kembali:
 *            type: string
 *          is_returned:
 *            type: boolean
 *          user_id:
 *            type: number
 *          createdAt:
 *            type: string
 *          updatedAt:
 *            type: string
 *
 */
export default class Borrowing extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public tanggalPinjam: string | null;

  @column()
  public tanggalKembali: string | null;

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
