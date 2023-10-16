import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class ElPotentialRestrictionDetail extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  
  @column()
  public sin: number | null

  @column()
  public restriction_code: string | null

  @column()
  public restriction_description: string | null

  @column()
  public applied_date: string | null

  @column()
  public bursary_period_id: number | null


  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
