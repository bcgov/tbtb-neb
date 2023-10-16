import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'nebs'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      // table.bigInteger('old_id').notNullable()
      // table.bigInteger('old_application_id').notNullable()
      // table.bigInteger('old_bursary_period_id').notNullable()

      // table.integer('application_id').unsigned().references('applications.id')
      // table.integer('bursary_period_id').unsigned().references('bursary_periods.id')
      // table.string('program_code').nullable().references('programs.program_code');
      table.integer('application_id').unsigned().nullable()
      table.integer('bursary_period_id').unsigned().nullable()
      table.string('program_code').nullable().nullable()
      
      table.string('inst_code', 10).nullable();
      table.date('study_start_date').nullable()
      table.date('study_end_date').nullable()
      table.string('sfas_program_code', 4).nullable()
      table.double('award_amount').nullable();
      table.string('declined_removed_reason', 60).nullable().comment('Reason why application was declined or removed.');
      table.integer('sfas_award_id').nullable().comment('Random id produced by legacy NEB system.')
      table.double('unmet_need').nullable();
      table.integer('weeks_of_study').nullable();
      table.double('weekly_unmet_need').nullable();
      table.double('assessed_need_amount').nullable();
      table.string('nurse_type', 3).nullable().comment('LPN or RN.');
      table.string('sector', 7).nullable().comment('public or private');
      table.boolean('valid_institution').nullable().defaultTo(0).comment('Valid institutions are open, designated, BC institutions.');
      table.boolean('restriction').nullable().defaultTo(0).comment('Yes if borrower has one or more restrictions (including bankruptcies).')
      table.boolean('awarded_in_prior_year').nullable().defaultTo(0).comment('Yes if borrower received grant in prior three bursary periods.')
      table.boolean('withdrawal').nullable().defaultTo(0).comment('Yes if borrower withdrew within bursary period.')
      table.string('neb_ineligible_reason', 60).nullable().comment('Reason why borrower was ineligible for grant (i.e., invalid institution, restriction, etc.).')




      table.unique(['application_id', 'bursary_period_id', 'program_code', 'sfas_program_code'])

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
