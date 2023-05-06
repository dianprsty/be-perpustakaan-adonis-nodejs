import { DateTime } from "luxon";
import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

/**
 * @swagger
 * components:
 *  schemas:
 *      Profile:
 *        type: object
 *        properties:
 *          id:
 *            type: number
 *          bio:
 *            type: string
 *          alamat:
 *            type: string
 *          user_id:
 *            type: number
 *          createdAt:
 *            type: string
 *          updatedAt:
 *            type: string
 *
 */
export default class Profile extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public bio: string;

  @column()
  public alamat: string;

  @column()
  public userId: number;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
