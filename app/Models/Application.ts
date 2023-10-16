import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Application extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public sin: number
  
  @column()
  public application_number: number | null
  
  @column()
  public complete: boolean
  
  @column()
  public eligible: boolean

  @column()
  public award_status: string | null
  
  @column()
  public rank: number | null
  
  @column()
  public total_score: number | null
  
  @column()
  public receive_date: Date | null
  
  @column()
  public effective_date: Date | null
  
  @column()
  public process_date: Date | null
  
  @column()
  public comment: string | null
  
  @column()
  public program_code: string | null
  

  @column()
  public bursary_period_id: number | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
