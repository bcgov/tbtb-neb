import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { column, beforeSave, BaseModel, manyToMany, ManyToMany, beforeFind, beforeFetch, computed } from '@ioc:Adonis/Lucid/Orm'
import Role from './Role'
import { softDelete, softDeleteQuery } from 'App/Services/SoftDelete'

export default class User extends BaseModel {

	@column({ isPrimary: true })
	public id: number

	@column()
	public email: string | null

	@column({ serializeAs: null })
	public password: string

	@column()
	public rememberMeToken: string | null

	@column()
	public roleId: number

	@column()
	public userId: string

	@column()
	public idirUserGuid: string | null

	@column()
	public firstName: string

	@column()
	public lastName: string

	@column()
	public disabled: boolean

	@column()
	public tele: string | null


	@column.dateTime({ autoCreate: true })
	public createdAt: DateTime

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	public updatedAt: DateTime

	@column.dateTime()
	public deletedAt: DateTime | null

	//not in the db
	@column()
	public access_type: string

	@manyToMany(() => Role)
	public roles: ManyToMany<typeof Role>

	@beforeSave()
	public static async hashPassword(user: User) {
		if (user.$dirty.password) {
			user.password = await Hash.make(user.password)
		}
	}

	@beforeFind()
	public static softDeletesFind = softDeleteQuery;

	@beforeFetch()
	public static softDeletesFetch = softDeleteQuery;

	public async softDelete(column?: string) {
		await softDelete(this, column);
	}

	// public static isAdmin = scope((query, user: User) => {
	// 	return user.roles;
	// })

	@computed()
	public get isAdmin() {
		let isAdmin = false;

		this.roles.forEach((role) => {
			if (role.isAdmin) {
				isAdmin = true;
			}
		});

		return isAdmin;
	}


	// public static isAdmin = scope<typeof User>(query => {
	// 	query.preload('roles', roleQuery => roleQuery.where('id', Roles.ADMIN))
	// })
}
