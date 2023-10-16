import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Restriction extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  
  @column()
  public restriction_code: string

  @column()
  public restriction_description: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
