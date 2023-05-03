import { schema, CustomMessages, rules } from "@ioc:Adonis/Core/Validator";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class CreateBookValidator {
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
    judul: schema.string(),
    ringkasan: schema.string(),
    tahun_terbit: schema.string([
      rules.maxLength(4),
      rules.regex(/^(\d{1,3}|1\d{3}|20[01]\d|202[0-3])$/),
    ]),
    halaman: schema.number(),
    kategori_id: schema.number([
      rules.exists({ table: "categories", column: "id" }),
    ]),
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
    maxLength: "tahun terbit harus berupa tahun yang valid",
    regex: "tahun terbit maksimal 2023",
    exists: "kategori_id tidak ditemukan",
  };
}
