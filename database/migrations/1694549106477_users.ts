import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import Roles from 'App/Enums/Roles'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('email', 255).nullable()
      table.string('password', 180).nullable()
      table.string('remember_me_token').nullable()

      table.integer('role_id').references('id').inTable('roles').defaultTo(Roles.GUEST)
      table.string('user_id').notNullable().unique()
      table.string('first_name')
      table.string('last_name')
      table.boolean('disabled').defaultTo(false)
      table.string('tele').nullable()
      table.string('idir_user_guid').nullable()
      /**
       * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('deleted_at', { useTz: true }).nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
