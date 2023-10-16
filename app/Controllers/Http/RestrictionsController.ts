import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Restriction from 'App/Models/Restriction';
import RestrictionStoreValidator from 'App/Validators/RestrictionStoreValidator';

export default class RestrictionsController {
    public async index({ inertia }: HttpContextContract) {

        return inertia.render('Restrictions', { 'page': 'restrictions' });
    }

    /**
     * Display a listing of the resource.
     *
     * @return response.json
     */
    public async fetch({ params, response }: HttpContextContract)
    {
        if(params.id){
            let restriction = await Restriction.find(params.id);
            return response.json({ 'page': 'restrictions', 'restrictions': restriction });
        }
        const restrictions = await Restriction.query().orderBy('restriction_code','asc');
        
        return response.json({ 'page': 'restrictions', 'restrictions': restrictions });

    }

    
    /**
     * Store a new resource.
     *
     * @return response.redirect
     */
    public async store({ request, response }: HttpContextContract)
    {
        const data = await request.validate(RestrictionStoreValidator);
		// @ts-ignore
        await Restriction.create(data);

        return response.redirect().toRoute('restrictions.index')
    }
}
