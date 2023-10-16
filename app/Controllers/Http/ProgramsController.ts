import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Program from 'App/Models/Program';
import NebProgramStoreValidator from 'App/Validators/NebProgramStoreValidator';

export default class ProgramsController {
    public async index({ inertia }: HttpContextContract) {

        return inertia.render('NebPrograms', { 'page': 'neb-programs' });
    }

    /**
     * Display a listing of the resource.
     *
     * @return response.json
     */
    public async fetch({ params, response }: HttpContextContract)
    {
        if(params.id){
            let program = await Program.find(params.id);
            return response.json({ 'page': 'neb-programs', 'programs': program });
        }
        const neb_programs = await Program.query().orderBy('program_code','asc');
        
        return response.json({ 'page': 'neb-programs', 'neb_programs': neb_programs });

    }

    
    /**
     * Store a new resource.
     *
     * @return response.redirect
     */
    public async store({ request, response }: HttpContextContract)
    {
        const data = await request.validate(NebProgramStoreValidator);
		// @ts-ignore
        await Program.create(data);

        return response.redirect().toRoute('neb-programs.index')
    }
}
