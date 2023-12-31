import { schema, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BaseValidator from './BaseValidator'

export default class SfasProgramStoreValidator extends BaseValidator{
  constructor(protected ctx: HttpContextContract) {
    super()
  }


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
    sfas_program_code: schema.string([rules.trim(), rules.maxLength(4), rules.unique({ table: 'sfas_programs', column: 'sfas_program_code'}) ]),
    degree_level: schema.enum([
      "Certificate",
      "Co-op Non-Degree",
      "Co-op Undergraduate",
      "Diploma",
      "Doctorate",
      "Masters",
      "Non-Degree",
      "Undergraduate"] as const),
    nurse_type: schema.enum(["LPN", "RN"] as const),
    eligible: schema.boolean(),
    neb_program_code: schema.string([rules.trim(), rules.exists({ table: 'programs', column: 'program_code'}) ]),
    area_of_study: schema.string([rules.trim(), rules.minLength(3)]),
  })

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
}
