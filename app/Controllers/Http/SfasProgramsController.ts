import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Program from 'App/Models/Program';
import SfasProgram from 'App/Models/SfasProgram';
import SfasProgramStoreValidator from 'App/Validators/SfasProgramStoreValidator';

export default class SfasProgramsController {

    public async index({ inertia }: HttpContextContract) {

        return inertia.render('SfasPrograms', { 'page': 'sfas-programs' });
    }

    /**
     * Display a listing of the resource.
     *
     * @return response.json
     */
    public async fetch({ params, response }: HttpContextContract)
    {
        if(params.id){
            let program = await SfasProgram.find(params.id);
            return response.json({ 'page': 'sfas-programs', 'programs': program });
        }
        const sfas_programs = await SfasProgram.query().orderBy('sfas_program_code','asc');
        const neb_programs = await Program.query().orderBy('program_code','asc');
        
        return response.json({ 'page': 'sfas-programs', 'sfas_programs': sfas_programs, 'neb_programs': neb_programs });

    }

    
    /**
     * Store a new resource.
     *
     * @return response.redirect
     */
    public async store({ request, response }: HttpContextContract)
    {
        const data = await request.validate(SfasProgramStoreValidator);
		// @ts-ignore
        await SfasProgram.create(data);

        return response.redirect().toRoute('sfas-programs.index')
    }

}
