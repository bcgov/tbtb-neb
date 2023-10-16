import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Student extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public sin: number | null

  @column()
  public pen: number | null

  @column()
  public date_of_birth: Date | null

  @column()
  public title: string | null

  @column()
  public gender: string | null

  @column()
  public first_name: string | null

  @column()
  public middle_name: string | null

  @column()
  public last_name: string | null

  @column()
  public old_first_name: string | null

  @column()
  public old_middle_name: string | null

  @column()
  public old_last_name: string | null

  @column()
  public citizenship: string | null

  @column()
  public marital_status: string | null

  @column()
  public address1: string | null

  @column()
  public address2: string | null

  @column()
  public city: string | null

  @column()
  public postal_code: string | null

  @column()
  public province: string | null

  @column()
  public country: string | null

  @column()
  public phone_number: string | null

  @column()
  public email: string | null


  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
