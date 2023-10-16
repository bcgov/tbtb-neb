import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'role_user'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('user_id').unsigned().references('users.id')
      table.integer('role_id').unsigned().references('roles.id')
      
      table.unique(['user_id', 'role_id'])
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
