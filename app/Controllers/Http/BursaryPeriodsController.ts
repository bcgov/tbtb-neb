import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BursaryPeriod from 'App/Models/BursaryPeriod'
import BursaryPeriodStoreValidator from 'App/Validators/BursaryPeriodStoreValidator';
import BursaryPeriodUpdateValidator from 'App/Validators/BursaryPeriodUpdateValidator';
import Neb from 'App/Models/Neb';
import Application from 'App/Models/Application';

export default class BursaryPeriodsController {


    public async index({ inertia }: HttpContextContract) {

        return inertia.render('BursaryPeriods', { 'page': 'bursary-periods' });
    }

    public async tobeAwarded({ response }: HttpContextContract) {
        const bp = await BursaryPeriod.query().where('awarded', false);

        return response.json({ 'bp': bp });
    }

    /**
     * Display a listing of the resource.
     *
     * @return response.json
     */
    public async fetch({ params, response }: HttpContextContract) {
        if (params.id) {
            let bp = await BursaryPeriod.find(params.id);
            return response.json({ 'page': 'bursary-periods', 'bp': bp });
        }
        const bursaryPeriods = await BursaryPeriod.query().orderBy('bursary_period_start_date', 'desc');

        return response.json({ 'page': 'bursary-periods', 'bp': bursaryPeriods });

    }


    public async show({ params, inertia }: HttpContextContract) {
        return inertia.render('BursaryPeriod', { 'results': null, 'stats': null, 'id': params.id });
    }

    /**
     * Store a new resource.
     *
     * @return response.redirect
     */
    public async store({ request, response }: HttpContextContract) {

        // try {
        // } catch (error) {
        //     console.log(error)
        //     /**
        //      * Step 3 - Handle errors
        //      */
        //     response.badRequest(error.messages)
        //   }
        const data = await request.validate(BursaryPeriodStoreValidator);
        // @ts-ignore
        await BursaryPeriod.create(data);

        return response.redirect().toRoute('bursary-periods.index')
    }


    /**
     * Update a resource.
     *
     * @return response.redirect
     */
    public async update({ request, response }: HttpContextContract) {
        // try {
        //     /**
        //      * Step 2 - Validate request body against
        //      *          the schema
        //      */
        // } catch (error) {
        //     /**
        //      * Step 3 - Handle errors
        //      */
        //     response.badRequest(error.messages)
        //   }

        const data = await request.validate(BursaryPeriodUpdateValidator);
        await BursaryPeriod.query().where('id', data.id).update(data);

        return response.redirect().toRoute('bursary-periods.index')
    }


    /**
     * Delete a resource.
     *
     * @return response.redirect
     */
    public async delete({ request, response }: HttpContextContract) {
        //const data = await request.validate(BursaryPeriodUpdateValidator);
        const bP = await BursaryPeriod.query().where('id', request.input('id')).first();
        if (bP != null) {
            //remove all records entered for the same bursary period from previous runs
            await Application.query().where('bursary_period_id', bP.id).delete();
            await Neb.query().where('bursary_period_id', bP.id).delete();

            await bP.delete();

        }


        return response.redirect().toRoute('bursary-periods.index')
    }

}
