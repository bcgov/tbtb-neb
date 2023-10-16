import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Roles from 'App/Enums/Roles';
import User from 'App/Models/User';

export default class MaintenanceController {


    // public async dashboard({ inertia }: HttpContextContract) {


    //     return inertia.render('Dashboard')
    // }

    /**
     * Display a listing of the resource.
     *
     * @return \Inertia\Response::render
     */
    public async staffList({ inertia }: HttpContextContract) {
        const staff = await User.query().preload('roles').orderBy('created_at', 'desc');

        staff.some(user => {
            const isAdmin = user.roles.some(role => role.id === Roles.ADMIN);
            user.access_type = isAdmin ? 'A' : 'U';
        })

        return inertia.render('Staff', { 'status': true, 'results': staff });
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Inertia\Response::render
     */
    public async staffShow({ params, inertia }: HttpContextContract) {
        const check_user = await User.query().where('id', params.id).preload('roles').first();
        if(check_user){
            if (check_user.roles.some(role => role.id === Roles.ADMIN)) {
                check_user.access_type = 'A';
            } else {
                check_user.access_type = 'U';
            }    
        }

        return inertia.render('StaffEdit', { 'status': true, 'results': check_user });
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\RedirectResponse::render
     */
    public async staffEdit({ params, request, response }: HttpContextContract)
    {
        const user = await User.findOrFail(params.id);
        
        user.tele = request.qs().tele;
        // user.access_type = request.qs().access_type;
        user.disabled = request.qs().disabled;
        await user.save();

        //reset roles
        user.related('roles').detach();
        

        //add user role
        user.related('roles').attach([Roles.USER]);

        //if admin add admin role
        if (request.qs().access_type == 'A') {
            user.related("roles").attach([Roles.ADMIN]);
        }

        return response.redirect('staff.list');
    }

}
