import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sfas_programs'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('neb_program_code', 4).nullable().references('programs.program_code').comment('Foreign key - NEB_PROGRAM (used for historical purposes).')

      table.string('sfas_program_code', 4)
      table.string('area_of_study', 50).nullable().comment('Program name.')
      table.string('degree_level', 20).nullable().comment('Degree level (certification, diploma, masters, etc.).')
      table.string('nurse_type', 3).nullable().comment('Type of nursing program (LPN or RN).')
      table.boolean('eligible').nullable().defaultTo(0).comment('Flag to indicate if program is NEB-eligible.')

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
