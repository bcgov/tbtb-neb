import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UsersController {
    public async goOn({ auth, response, inertia }: HttpContextContract) {

        if (auth.isLoggedIn) {
            response.redirect('/dashboard')
            return;
        }

        return inertia.render('Auth/Login')
    }
    
    public async login({ auth, response, inertia }: HttpContextContract) {

        if (auth.isLoggedIn) {
            response.redirect('/dashboard')
            return;
        }
        return inertia.render('Auth/Login')
    }

}
