import { schema, CustomMessages, rules } from "@ioc:Adonis/Core/Validator";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

/**
 * @swagger
 * components:
 *  schemas:
 *      InputRegister:
 *        type: object
 *        properties:
 *          nama:
 *            type: string
 *          email:
 *            type: string
 *          password:
 *            type: string
 *          password_confirmation:
 *            type: string
 *        required:
 *          - nama
 *          - email
 *          - password
 *          - password_confirmation
 *
 */
export default class RegisterValidator {
  constructor(protected ctx: HttpContextContract) {}

  /*
   * Define schema to validate the "shape", "type", "formatting" and "integrity" of data.
   *
   * For example:
   * 1. The username must be of data type string. But then also, it should
   *    not contain special characters or numbers.
   *    ```
   *     schema.string({}, [ rules.alpha() ])
   *    ```
   *
   * 2. The email must be of data type string, formatted as a valid
   *    email. But also, not used by any other user.
   *    ```
   *     schema.string({}, [
   *       rules.email(),
   *       rules.unique({ table: 'users', column: 'email' }),
   *     ])
   *    ```
   */
  public schema = schema.create({
    nama: schema.string(),
    email: schema.string([
      rules.email(),
      rules.unique({ table: "users", column: "email" }),
    ]),
    password: schema.string([rules.minLength(6), rules.confirmed()]),
    password_confirmation: schema.string([rules.minLength(6)]),
    // role: schema.enum(["user", "petugas"] as const),
  });

  /**
   * Custom messages for validation failures. You can make use of dot notation `(.)`
   * for targeting nested fields and array expressions `(*)` for targeting all
   * children of an array. For example:
   *
   * {
   *   'profile.username.required': 'Username is required',
   *   'scores.*.number': 'Define scores as valid numbers'
   * }
   *
   */
  public messages: CustomMessages = {
    required: "{{ field }} wajib diisi",
    email: "format email salah",
    unique: "email sudah terdaftar",
    minLength: "password minimal 6 karakter",
    // enum: "role harus user atau petugas",
    confirmed: "password dan password_confirmation tidak cocok",
  };
}
