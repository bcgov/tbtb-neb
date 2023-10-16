import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'applications'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      // table.bigInteger('old_id').notNullable()
      table.integer('student_id').unsigned().references('students.id')
      table.bigInteger('sin').nullable().comment('Social insurance number.')
      table.string('application_number', 20).nullable()
      table.boolean('complete').defaultTo(0).comment('Indicates whether or not application data is complete.')
      table.boolean('eligible').defaultTo(0).comment('Indicates whether or not application is eligible to receive award.')
      table.string('award_status').nullable().comment('Status of appllication (i.e., Approved, Denied, etc.).')
      table.integer('rank').nullable().comment('Applicant rating (compared to other applicants).')
      table.double('total_score').nullable().comment('Score of the application.')
      table.date('receive_date').nullable().comment('Date the application was received.')
      table.date('effective_date').nullable().comment('Date application award decision made.')
      table.date('process_date').nullable().comment('Date the application was processed.')
      table.string('comment').nullable().comment('Information entered by staff member who processed the application.')
      table.string('program_code').nullable().comment('Program code (i.e., ECE, LFP, PCLF, ...).')
      table.bigInteger('bursary_period_id').nullable()


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
