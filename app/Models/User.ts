import { DateTime } from "luxon";
import Hash from "@ioc:Adonis/Core/Hash";
import {
  column,
  beforeSave,
  BaseModel,
  hasOne,
  HasOne,
  hasMany,
  HasMany,
} from "@ioc:Adonis/Lucid/Orm";
import Profile from "./Profile";
import Borrowing from "./Borrowing";

/**
 * @swagger
 * components:
 *  schemas:
 *      User:
 *        type: object
 *        properties:
 *          id:
 *            type: number
 *          name:
 *            type: string
 *          email:
 *            type: string
 *          password:
 *            type: string
 *          role:
 *            type: string
 *          isVerified:
 *            type: boolean
 *          createdAt:
 *            type: string
 *          updatedAt:
 *            type: string
 *          profile:
 *            type: object
 *          borrows:
 *            type: array
 *
 */
export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public nama: string;

  @column()
  public email: string;

  @column({ serializeAs: null })
  public password: string;

  @column()
  public role: string;

  @column()
  public rememberMeToken: string | null;

  @column()
  public isVerified: boolean;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password);
    }
  }

  @hasOne(() => Profile)
  public profile: HasOne<typeof Profile>;

  @hasMany(() => Borrowing)
  public borrows: HasMany<typeof Borrowing>;
}
