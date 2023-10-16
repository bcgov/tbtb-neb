import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Neb extends BaseModel {
  @column({ isPrimary: true })
  public id: number


  @column()
  public application_id: number

  @column()
  public bursary_period_id: number

  @column()
  public program_code: string

  @column()
  public inst_code: string | null

  @column()
  public study_start_date: Date

  @column()
  public study_end_date: Date

  @column()
  public sfas_program_code: string | null

  @column()
  public award_amount: number | null

  @column()
  public declined_removed_reason: string | null

  @column()
  public sfas_award_id: number | null

  @column()
  public unmet_need: number | null

  @column()
  public weeks_of_study: number | null

  @column()
  public weekly_unmet_need: number | null

  @column()
  public assessed_need_amount: number | null

  @column()
  public nurse_type: string | null

  @column()
  public sector: string | null

  @column()
  public valid_institution: boolean | null

  @column()
  public restriction: boolean | null

  @column()
  public awarded_in_prior_year: boolean | null

  @column()
  public withdrawal: boolean | null

  @column()
  public neb_ineligible_reason: string | null




  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
