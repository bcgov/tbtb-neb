import { AuthenticationException } from '@adonisjs/auth/build/standalone'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Roles from 'App/Enums/Roles'
import User from 'App/Models/User'

/**
 * Auth middleware is meant to restrict un-authenticated access to a given route
 * or a group of routes.
 *
 * You must register this middleware inside `start/kernel.ts` file under the list
 * of named middleware.
 */
export default class AdminMiddleware {
  /**
   * The URL to redirect to when request is Unauthorized
   */
  protected redirectTo = '/dashboard'
  public async handle(
    { auth }: HttpContextContract,
    next: () => Promise<void>
  ) {

		// @ts-ignore
    const user = await User.query().preload('roles').where('id', auth.user.id).first();
    const roleIds = user?.roles.map(role => role.id);
    if(!roleIds?.includes(Roles.ADMIN)){

      /**
       * Unable to authenticate using any guard
       */
      throw new AuthenticationException(
        'Unauthorized access',
        'E_UNAUTHORIZED_ACCESS',
        auth.name,
        this.redirectTo,
      )
    }

    await next()
  }
  
}
