import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany, ManyToMany, computed } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Roles from 'App/Enums/Roles'
// import Roles from 'App/Enums/Roles'

export default class Role extends BaseModel {
	@column({ isPrimary: true })
	public id: number

	@column()
	public name: string

	@column.dateTime({ autoCreate: true })
	public createdAt: DateTime

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	public updatedAt: DateTime


	@manyToMany(() => User)
	public users: ManyToMany<typeof User>

	@computed()
	public get isAdmin() {
		return this.id === Roles.ADMIN
	}

	// public static isAdmin = scope((query) => {
	// 	return query.where('id', Roles.GUEST);
	// })
}
