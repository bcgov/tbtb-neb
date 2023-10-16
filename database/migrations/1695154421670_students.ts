import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'students'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.bigInteger('sin').notNullable().comment('Social insurance number.')
      table.bigInteger('pen').nullable().comment('Personal education number.')
      table.date('date_of_birth').nullable();
      table.string('title', 10).nullable().comment('Title (i.e., Mr., Mrs., etc.)');
      table.string('gender', 10).nullable()
      table.string('first_name', 30).nullable()
      table.string('middle_name', 30).nullable()
      table.string('last_name', 30).nullable()
      table.string('old_first_name', 30).nullable()
      table.string('old_middle_name', 30).nullable()
      table.string('old_last_name', 30).nullable()
      table.string('citizenship', 20).nullable()
      table.string('marital_status', 30).nullable()
      table.string('address1', 70).nullable()
      table.string('address2', 70).nullable()
      table.string('city', 40).nullable()
      table.string('postal_code', 7).nullable()
      table.string('province', 40).nullable()
      table.string('country', 40).nullable()
      table.string('phone_number', 10).nullable()
      table.string('email', 50).nullable()
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
