import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class ElPotentialRestriction extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  
  @column()
  public sin: number

  @column()
  public bursary_period_id: number | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
