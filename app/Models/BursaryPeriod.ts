import { DateTime } from 'luxon'
import { BaseModel, column, computed } from '@ioc:Adonis/Lucid/Orm'

export default class BursaryPeriod extends BaseModel {
  
  static formatDates (value) {
      return value.format('yyyy-MM-dd')
  }

  @column({ isPrimary: true })
  public id: number


  @column()
  public bursary_period_start_date: Date

  @column()
  public bursary_period_end_date: Date

  @column()
  public awarded: boolean

  @column()
  public default_award: number | null

  @column()
  public period_budget: number | null

  @column()
  public rn_budget: number | null

  @column()
  public public_sector_budget: number | null

  @column()
  public budget_allocation_type: string | null
  
  
  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @computed()
  public get bpsd() {
    const bpsd = DateTime.fromISO(this.bursary_period_start_date.toISOString());
    return bpsd.toFormat("yyyy-MM-dd");
	} 

  @computed()
  public get bped() {
    const bped = DateTime.fromISO(this.bursary_period_end_date.toISOString());
    return bped.toFormat("yyyy-MM-dd");
	} 
}
