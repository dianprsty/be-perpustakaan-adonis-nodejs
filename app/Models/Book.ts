import { DateTime } from "luxon";
import { BaseModel, HasMany, column, hasMany } from "@ioc:Adonis/Lucid/Orm";
import Borrowing from "./Borrowing";

/**
 * @swagger
 * components:
 *  schemas:
 *      Book:
 *        type: object
 *        properties:
 *          id:
 *            type: number
 *          judul:
 *            type: string
 *          ringkasan:
 *            type: string
 *          tahun_terbit:
 *            type: string
 *          halaman:
 *            type: number
 *          stock:
 *            type: number
 *          kategori_id:
 *            type: number
 *          createdAt:
 *            type: string
 *          updatedAt:
 *            type: string
 *          borrows:
 *            type: array
 *
 */
export default class Book extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public judul: string;

  @column()
  public ringkasan: string;

  @column()
  public tahun_terbit: string;

  @column()
  public halaman: number;

  @column()
  public stock: number;

  @column()
  public kategori_id: number;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @hasMany(() => Borrowing)
  public borrows: HasMany<typeof Borrowing>;
}
