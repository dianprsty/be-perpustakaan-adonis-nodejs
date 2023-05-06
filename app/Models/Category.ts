import { DateTime } from "luxon";
import { BaseModel, HasMany, column, hasMany } from "@ioc:Adonis/Lucid/Orm";
import Book from "./Book";

/**
 * @swagger
 * components:
 *  schemas:
 *      Category:
 *        type: object
 *        properties:
 *          id:
 *            type: number
 *          nama:
 *            type: string
 *          createdAt:
 *            type: string
 *          updatedAt:
 *            type: string
 *          books:
 *            type: array
 *
 */
export default class Category extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public nama: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @hasMany(() => Book)
  public books: HasMany<typeof Book>;
}
