import { DateTime } from "luxon";
import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

/**
 * @swagger
 * components:
 *  schemas:
 *      Otp:
 *        type: object
 *        properties:
 *          id:
 *            type: number
 *          otp:
 *            type: number
 *          user_id:
 *            type: number
 *          createdAt:
 *            type: string
 *          updatedAt:
 *            type: string
 *
 */
export default class Otp extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public otp: number;

  @column()
  public userId: number;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
