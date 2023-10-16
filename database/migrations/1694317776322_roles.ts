import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import Roles from 'App/Enums/Roles'

export default class extends BaseSchema {
  protected tableName = 'roles'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name', 50).notNullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })

    //create the roles we created in Enums/Roles.ts
    this.defer(async (db) => {
      await db.table(this.tableName).multiInsert([
        {
            id: Roles.GUEST,
            name: 'Guest'
          },
          {
            id: Roles.USER,
            name: 'User'
          },
          {
            id: Roles.ADMIN,
            name: 'Admin'
          },
          {
            id: Roles.REPORTER,
            name: 'Reporter'
          }
        ])
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
