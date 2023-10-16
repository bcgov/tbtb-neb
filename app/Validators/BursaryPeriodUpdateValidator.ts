import { schema, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BaseValidator from './BaseValidator'

export default class BursaryPeriodUpdateValidator extends BaseValidator{
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
    id: schema.number([rules.exists({ table: 'bursary_periods', column: 'id'})]),
    bursary_period_start_date: schema.date({format: 'yyyy-MM-dd'}, [rules.unique({ table: 'bursary_periods', column: 'bursary_period_start_date', whereNot: { id: this.ctx.request.input('id')  }})]),
    bursary_period_end_date: schema.date({format: 'yyyy-MM-dd'}, [rules.unique({ table: 'bursary_periods', column: 'bursary_period_end_date', whereNot: { id: this.ctx.request.input('id')  }})]),
    default_award: schema.number(),
    period_budget: schema.number(),
    budget_allocation_type: schema.enum(['Sector', 'None', 'Nurse Type'] as const),
    public_sector_budget: schema.number([rules.range(0, 100)]),
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
  // CustomMessages = {
  //   '*': "Bursary Period Start Date is invalid.",
  //   // 'bursary_period_end_date.*': "Bursary Period End Date is invalid.",
  // }
}
