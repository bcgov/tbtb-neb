import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class SfasProgram extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  
  @column()
  public neb_program_code: string
  
  @column()
  public sfas_program_code: string
  
  @column()
  public area_of_study: string
  
  @column()
  public degree_level: string
  
  @column()
  public nurse_type: string
  
  @column()
  public eligible: boolean
  


  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
