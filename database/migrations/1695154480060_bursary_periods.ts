import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'bursary_periods'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      // table.bigInteger('old_id').nullable()
      table.date('bursary_period_start_date').nullable()
      table.date('bursary_period_end_date').nullable()
      table.boolean('awarded').defaultTo(0).comment('Indicates if awards are distributed for period (yes or no).')
      table.double('default_award').nullable().comment('The default amount of award for period.')
      table.double('period_budget').nullable().comment('Total budget amount for period.')
      table.integer('rn_budget').nullable().comment('Number between 1 and 100; portion of budget to allocate to RN programs.')
      table.integer('public_sector_budget').nullable().comment('Number between 1 and 100; portion of budget to allocate to public sector programs.')
      table.string('budget_allocation_type').nullable().comment('Method of allocating budget; either by sector (private/public), nurse type (LPN/RN), or none.')

      table.unique(['bursary_period_start_date', 'bursary_period_end_date'])

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
