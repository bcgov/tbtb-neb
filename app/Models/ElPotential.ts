import { DateTime } from 'luxon'
import { BaseModel, beforeFetch, beforeFind, column } from '@ioc:Adonis/Lucid/Orm'
import { softDeleteQuery, softDelete } from 'App/Services/SoftDelete'

export default class ElPotential extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  
  @column()
  public application_number: number | null

  @column()
  public sin: number

  @column()
  public postal_code: string | null

  @column()
  public birth_date: Date | null

  @column()
  public receive_date: Date | null

  @column()
  public first_name: string | null

  @column()
  public middle_name: string | null

  @column()
  public last_name: string | null

  @column()
  public assessed_need_amount: number | null

  @column()
  public total_unmet_need: number

  @column()
  public weeks_of_study: number | null

  @column()
  public weekly_unmet_need: number | null

  @column()
  public program_year: string | null

  @column()
  public street_address1: string | null

  @column()
  public street_address2: string | null

  @column()
  public city: string | null

  @column()
  public province: string | null

  @column()
  public gender: string | null

  @column()
  public phone_number: string | null

  @column()
  public study_start_date: Date

  @column()
  public study_end_date: Date

  @column()
  public institution_name: string | null

  @column()
  public program_code: string | null

  @column()
  public inst_code: string | null

  @column()
  public area_of_study: string | null

  @column()
  public degree_level: string | null

  @column()
  public bursary_period_id: number | null

  @column()
  public month_overlap: boolean | null

  @column()
  public num_day_overlap: number | null

  @column()
  public valid_institution: boolean | null

  @column()
  public restriction: boolean | null

  @column()
  public awarded_in_prior_year: boolean | null

  @column()
  public withdrawal: boolean | null

  @column()
  public nurse_type: string | null

  @column()
  public sector: string | null

  @column()
  public eligibility: string | null

  @column()
  public neb_ineligible_reason: string | null

  @column()
  public rank_by_unmet_need: number | null

  @column()
  public rank_by_nurse_type: number | null

  @column()
  public rank_by_sector: number | null

  @column()
  public award_or_deny: string | null

  @column()
  public neb_deny_reason: string | null

  @column()
  public award_amount: number | null

  @column()
  public sfas_award_id: number | null

  @column()
  public supplier_no: number | null

  @column()
  public created_by: string | null

  @column()
  public finalized: boolean | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
    // total: any

  @column.dateTime()
  public deletedAt: DateTime | null
  
	@beforeFind()
	public static softDeletesFind = softDeleteQuery;

	@beforeFetch()
	public static softDeletesFetch = softDeleteQuery;

	public async softDelete(column?: string) {
		await softDelete(this, column);
	}
}
