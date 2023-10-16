import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class ElSinPySsd extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  
  @column()
  public sin: number

  @column()
  public max_program_year: string

  @column()
  public max_study_start_date: Date



  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
