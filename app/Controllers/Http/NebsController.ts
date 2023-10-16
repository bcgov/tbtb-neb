
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BursaryPeriod from 'App/Models/BursaryPeriod'
import ElPotential from 'App/Models/ElPotential'
import ElPotentialRestriction from 'App/Models/ElPotentialRestriction'
import ElPotentialRestrictionDetail from 'App/Models/ElPotentialRestrictionDetail'
import ElSinPySsd from 'App/Models/ElSinPySsd'
import SfasProgram from 'App/Models/SfasProgram'
import Database from '@ioc:Adonis/Lucid/Database'
import Restriction from 'App/Models/Restriction'
import { DateTime } from "luxon";
import Application from 'App/Models/Application'
import Neb from 'App/Models/Neb'
import Env from '@ioc:Adonis/Core/Env'
import Student from 'App/Models/Student'

export default class NebsController {
    public programCodesString;
    public formatted_bpsd;
    public formatted_bped;

    public async exportNeb({ params, response }: HttpContextContract) {
        const bursaryPeriod = await BursaryPeriod.find(params.id);
        if (bursaryPeriod == null) return;

        try {
            const type = {
                "el": "eligible",
                "in": "ineligible",
                "aw": "awarded",
                "aw_txt": "awarded_text",
            }[params.type];


            //default to exporting awarded
            let potentials = await ElPotential.query().where('bursary_period_id', bursaryPeriod.id).where('award_or_deny', 'Award').orderBy('weekly_unmet_need', 'desc').orderBy('total_unmet_need', 'desc');


            switch (type) {
                case "eligible":
                    potentials = await ElPotential.query().where('bursary_period_id', bursaryPeriod.id).where('eligibility', 'Eligible');
                    break;

                case "ineligible":
                    potentials = await ElPotential.query().where('bursary_period_id', bursaryPeriod.id).where('eligibility', 'Ineligible');
                    break;

                case "awarded_text":
                    let txtRows = '';
                    for (let i = 0; i < potentials.length; i++) {
                        txtRows += await this.awardedTextLine(potentials[i], bursaryPeriod) + "\n";
                    }

                    // Set response headers to indicate a downloadable TXT file
                    response.header('Content-Disposition', 'attachment; filename=' + type + '-' + bursaryPeriod.bpsd + 'TO' + bursaryPeriod.bped + '.txt');
                    response.header('Content-Type', 'text/plain');
                    return response.send(txtRows);
                    break;
            }

            // Prepare the CSV content
            let csvContent = 'ApplicationNum,SIN,PostalCode,BirthDate,FirstName,MiddleName,LastName,AssessedNeedAmount,TotalUnmetNeed,WeeksOfStudy,WeeklyUnmetNeed,ProgramYear,StreetAddress1,StreetAddress2,City,Province,Gender,PhoneNumber,StudyStartDate,StudyEndDate,InstitutionName,ProgramCode,InstCode,AreaOfStudy,DegreeLevel,BursaryPeriodId,MonthOverlap,NumDayOverlap,ValidInstitution,Restriction,AwardedInPriorYear,Withdrawal,NurseType,Sector,Eligibility,NebIneligibleReason,RankByUnmetNeed,RankByNurseType,RankBySector,AwardOrDeny,NebDenyReason,AwardAmount,SfasAwardId\n'; // CSV header row
            for (let i = 0; i < potentials.length; i++) {
                csvContent += await this.prepareCsvLine(potentials[i]) + "\n";
            }


            // Set response headers to indicate a downloadable CSV file
            response.header('Content-Disposition', 'attachment; filename=' + type + '-' + bursaryPeriod.bpsd + 'TO' + bursaryPeriod.bped + '.csv');
            response.header('Content-Type', 'text/csv');

            // Send the CSV content as the response
            return response.send(csvContent);
        } catch (error) {
            console.error('Error generating CSV for download:', error);
            return response.status(500).send('Internal server error.');
        }
    }


    public async fetchNeb({ request, inertia }: HttpContextContract) {
        const page = request.input('page', 1)
        const bursaryPeriod = await BursaryPeriod.find(request.input('bursary_period_id'));
        if (bursaryPeriod == null) return;

        let stats = {};

        //fetch stats only on the first page
        if (page === 1) {
            const el = await ElPotential.query().where('bursary_period_id', bursaryPeriod.id).where('eligibility', 'Eligible');
            const inEl = await ElPotential.query().where('bursary_period_id', bursaryPeriod.id).where('eligibility', 'Ineligible');
            const award = await ElPotential.query().where('bursary_period_id', bursaryPeriod.id).where('award_or_deny', 'Award');
            const deny = await ElPotential.query().where('bursary_period_id', bursaryPeriod.id).where('award_or_deny', 'Deny');
            const secPub = await ElPotential.query().where('bursary_period_id', bursaryPeriod.id).where('sector', 'Public');
            const secPri = await ElPotential.query().where('bursary_period_id', bursaryPeriod.id).where('sector', 'Private');
            stats = {
                eligible: el.length,
                ineligible: inEl.length,
                awarded: award.length,
                denied: deny.length,
                sectorPub: secPub.length,
                sectorPri: secPri.length,
                info: bursaryPeriod
            }
        }

        const potentials = await ElPotential.query().where('bursary_period_id', bursaryPeriod.id).orderBy(request.input('sort_by'), request.input('sort_dir')).paginate(page, 25);
        return inertia.render('BursaryPeriod', { 'results': potentials, 'stats': stats, id: bursaryPeriod.id });

    }


    // FINALIZE FUNCTIONS START HERE

    public async finalizeNeb({ response, inertia, request }: HttpContextContract) {
        const bursaryPeriod = await BursaryPeriod.find(request.input('bursary_period_id'));
        if (bursaryPeriod == null) return;
        if (bursaryPeriod.awarded === true) {
            return inertia.render('Error', { 'status': 500, 'message': "This bursary period has already been awarded." });
        }

        const bpsd = DateTime.fromISO(bursaryPeriod.bursary_period_start_date.toISOString());
        this.formatted_bpsd = bpsd.toISODate();
        const bped = DateTime.fromISO(bursaryPeriod.bursary_period_end_date.toISOString());
        this.formatted_bped = bped.toFormat("yyyy-MM-dd");
        const programCodes = await SfasProgram.query().select('sfas_program_code').where('eligible', true);
        this.programCodesString = programCodes.map((row) => '\'' + row.sfas_program_code + '\'').join(', ');

        switch (request.input('step')) {
            case 0:
                await this.processStudents(bursaryPeriod);
                break;
            case 1:
                await this.createApplications(bursaryPeriod);
                break;
            case 2:
                await this.cleanup(bursaryPeriod);
                break;

            default:
                break;
        }

        return response.redirect('/bursary-periods/show/' + bursaryPeriod.id);

        // return inertia.render('Dashboard', { 'page': 'home' });

    }


    private async processStudents(bP: BursaryPeriod) {
        let students = await ElPotential.query().where('bursary_period_id', bP.id);
        students.forEach(async (student) => {
            await Student.firstOrCreate({
                sin: student.sin,
                date_of_birth: student.birth_date,
                first_name: student.first_name,
                middle_name: student.middle_name,
                last_name: student.middle_name,
                address1: student.street_address1,
                address2: student.street_address2,
                city: student.city,
                province: student.province,
                postal_code: student.postal_code,
                phone_number: student.phone_number
            });
        });

        return true;
    }

    private async createApplications(bP: BursaryPeriod) {

        let now = DateTime.now().toJSDate();
        let potentials = await ElPotential.query().where('bursary_period_id', bP.id);
        potentials.forEach(async (potential) => {

            let app = await Application.firstOrCreate({
                sin: potential.sin,
                application_number: potential.application_number,
                bursary_period_id: potential.bursary_period_id,
                eligible: potential.eligibility === "Eligible" ? true : false,
                award_status: potential.award_or_deny === "Award" ? "Approved" : "Denied",
                effective_date: now,
                receive_date: potential.receive_date,
                program_code: "NEB"
            });

            await Neb.create({
                application_id: app.id,
                inst_code: potential.inst_code,
                study_start_date: potential.study_start_date,
                study_end_date: potential.study_end_date,
                bursary_period_id: bP.id,
                sfas_program_code: potential.program_code,
                declined_removed_reason: potential.neb_deny_reason,
                neb_ineligible_reason: potential.neb_ineligible_reason,
                award_amount: potential.award_amount == null ? 0 : potential.award_amount,
                unmet_need: potential.total_unmet_need == null ? 0 : potential.total_unmet_need,
                weeks_of_study: potential.weeks_of_study == null ? 0 : potential.weeks_of_study,
                weekly_unmet_need: potential.weekly_unmet_need == null ? 0 : potential.weekly_unmet_need,
                assessed_need_amount: potential.assessed_need_amount == null ? 0 : potential.assessed_need_amount,
                nurse_type: potential.nurse_type,
                sector: potential.sector,
                sfas_award_id: potential.sfas_award_id,
                valid_institution: potential.valid_institution,
                restriction: potential.restriction,
                awarded_in_prior_year: potential.awarded_in_prior_year,
                withdrawal: potential.withdrawal
            });


        });


        return true;
    }

    private async cleanup(bP: BursaryPeriod) {

        await ElPotential.query().where('bursary_period_id', bP.id).update({ 'finalized': true });
        bP.awarded = true;
        bP.save();
        return true;
    }



    // PROCESSING FUNCTIONS START HERE

    public async processNeb({ response, inertia, request, auth }: HttpContextContract) {
        const bursaryPeriod = await BursaryPeriod.find(request.input('bursary_period_id'));
        if (bursaryPeriod == null) return;
        if (bursaryPeriod.awarded === true) {
            return inertia.render('Error', { 'status': 500, 'message': "This bursary period has already been awarded." });
        }

        const bpsd = DateTime.fromISO(bursaryPeriod.bursary_period_start_date.toISOString());
        this.formatted_bpsd = bpsd.toISODate();
        const bped = DateTime.fromISO(bursaryPeriod.bursary_period_end_date.toISOString());
        this.formatted_bped = bped.toFormat("yyyy-MM-dd");
        const programCodes = await SfasProgram.query().select('sfas_program_code').where('eligible', true);
        this.programCodesString = programCodes.map((row) => '\'' + row.sfas_program_code + '\'').join(', ');

        switch (request.input('step')) {
            case 0:
                await this.nebElPotentials(bursaryPeriod, auth);
                break;
            case 1:
                await this.monthOverlap(bursaryPeriod);
                break;
            case 2:
                await this.validInstitution();
                break;
            case 3:
                await this.restriction(bursaryPeriod);
                break;
            case 4:
                await this.awardedInPriorYear(bursaryPeriod);
                break;
            case 5:
                await this.withdrawal();
                break;
            case 6:
                await this.nurseType();
                break;
            case 7:
                await this.eligibility();
                break;
            case 8:
                await this.rank();
                break;
            case 9:
                await this.awardOrDeny(bursaryPeriod);
                break;
            case 10:
                await this.awardAmount(bursaryPeriod);
                break;
            case 11:
                await this.sfasAwardId();
                console.log("Processing Complete!")
                break;

            default:
                break;
        }

        return response.redirect('/bursary-periods/show/' + bursaryPeriod.id);

        //return inertia.render('Dashboard', { 'page': 'home' });

    }

    /**
     * Display a listing of the resource.
     *
     * @input bp: BursaryPeriod object
     * @return response.json
     */
    private async nebElPotentials(bP: BursaryPeriod, auth: any) {

        if (bP == null) return;


        //cleanup for new run
        const env_query0 = Env.get('CREATE_NEB_QUERY');
        let qry = await this.sprintf(env_query0, bP.id);
        await Database.rawQuery(qry);

        //remove all records entered for the same bursary period from previous runs
        await Application.query().where('bursary_period_id', bP.id).delete();
        await Neb.query().where('bursary_period_id', bP.id).delete();

        const env_query1 = Env.get('NEB_POTENTIALS_QUERY1');
        qry = await this.sprintf(env_query1, this.programCodesString, this.formatted_bpsd, this.formatted_bped, this.formatted_bpsd, this.formatted_bped, this.formatted_bpsd, this.formatted_bped);
        console.log(qry);
        let strSQL1 = await Database.connection('oracle').rawQuery(qry);

        for (let i = 0; i < strSQL1.length; i++) {
            await ElSinPySsd.create({
                sin: strSQL1[i].SIN,
                max_program_year: strSQL1[i].MAX_PROGRAM_YEAR,
                max_study_start_date: strSQL1[i].MAX_STUDY_START_DTE
            });
        }

        const env_query2 = Env.get('NEB_POTENTIALS_QUERY2');
        qry = await this.sprintf(env_query2, this.programCodesString, this.formatted_bpsd, this.formatted_bped, this.formatted_bpsd, this.formatted_bped, this.formatted_bpsd, this.formatted_bped);

        let strSQL2 = await Database.connection('oracle').rawQuery(qry);

        for (let i = 0; i < strSQL2.length; i++) {
            let check = await ElSinPySsd.query()
                .where('sin', strSQL2[i].LNGSIN)
                .andWhere('max_program_year', strSQL2[i].STRPROGRAMYEAR)
                .andWhere('max_study_start_date', strSQL2[i].DTMSTUDYSTARTDATE)
                .first();
            if (check != null) {
                await ElPotential.create({
                    bursary_period_id: bP.id,
                    application_number: strSQL2[i].LNGAPPLICATIONNUMBER,
                    sin: strSQL2[i].LNGSIN,
                    postal_code: strSQL2[i].STRPOSTALCODE?.trim(),
                    birth_date: strSQL2[i].DTMBIRTHDATE,
                    first_name: strSQL2[i].STRFIRSTNAME?.trim(),
                    middle_name: strSQL2[i].STRMIDDLENAME?.trim(),
                    last_name: strSQL2[i].STRLASTNAME?.trim(),
                    assessed_need_amount: strSQL2[i].CURASSESSEDNEEDAMT,
                    total_unmet_need: strSQL2[i].CURTOTALUNMETNEED,
                    weeks_of_study: strSQL2[i].LNGWEEKSOFSTUDY,
                    weekly_unmet_need: strSQL2[i].CURWEEKLYUNMETNEED,
                    program_year: strSQL2[i].STRPROGRAMYEAR?.trim(),
                    street_address1: strSQL2[i].STRADDRESS1?.trim(),
                    street_address2: strSQL2[i].STRADDRESS2?.trim(),
                    city: strSQL2[i].STRCITY?.trim(),
                    province: strSQL2[i].STRPROVINCE?.trim(),
                    gender: strSQL2[i].STRGENDER?.trim(),
                    phone_number: strSQL2[i].STRPHONENUMBER,
                    study_start_date: strSQL2[i].DTMSTUDYSTARTDATE,
                    study_end_date: strSQL2[i].DTMSTUDYENDDATE,
                    institution_name: strSQL2[i].STRINSTITUTIONNAME?.trim(),
                    program_code: strSQL2[i].STRPROGRAMCODE?.trim(),
                    inst_code: strSQL2[i].STRINSTCODE?.trim(),
                    area_of_study: strSQL2[i].STRAREAOFSTUDY?.trim(),
                    degree_level: strSQL2[i].STRDEGREELEVEL?.trim(),
                    sector: strSQL2[i].PRIVATE_FLG == 'Y' ? "Private" : "Public",
                    eligibility: "Eligible",
                    restriction: false,
                    awarded_in_prior_year: false,
                    withdrawal: false,
                    award_amount: 0,
                    valid_institution: false,

                    receive_date: strSQL2[i].RECEIVE_DTE,
                    supplier_no: strSQL2[i].SUPPLIER_NO,
                    created_by: auth.user_id,
                    finalized: false
                });
            }
        }

        return await ElPotential.all();
    }

    /**
     * Display a listing of the resource.
     *
     * @input bp: BursaryPeriod object
     * @return response.json
     */
    private async monthOverlap(bP: BursaryPeriod) {
        const potentials = await ElPotential.all();

        if (potentials == null || potentials.length == 0) return;

        for (let i = 0; i < potentials.length; i++) {

            if (
                potentials[i].study_start_date > potentials[i].study_end_date ||
                potentials[i].study_end_date < bP.bursary_period_start_date ||
                potentials[i].study_start_date > bP.bursary_period_end_date
            ) {
                console.log("No Overlap", potentials.length);
                potentials[i].num_day_overlap = 0;
                potentials[i].month_overlap = false;
                potentials[i].save();
            } else {
                let rangeStartDate = potentials[i].study_start_date;
                if (potentials[i].study_start_date < bP.bursary_period_start_date) {
                    rangeStartDate = bP?.bursary_period_start_date;
                }

                let rangeEndDate = bP.bursary_period_end_date;
                if (potentials[i].study_end_date < bP.bursary_period_end_date) {
                    rangeEndDate = potentials[i].study_end_date;
                }

                let startDateTime = DateTime.fromISO(rangeStartDate.toISOString());
                let endDateTime = DateTime.fromISO(rangeEndDate.toISOString());
                let numDays = endDateTime.diff(startDateTime, 'days').days;

                potentials[i].num_day_overlap = numDays;
                if (numDays >= 30) {
                    potentials[i].month_overlap = true;
                } else {
                    potentials[i].month_overlap = false;
                }
                potentials[i].save();
            }
        }
        return await potentials;
    }

    private async validInstitution() {

        const env_query1 = Env.get('VALIDATE_INSTITUTION_QUERY1');
        let strSQL3 = await Database.connection('oracle').rawQuery(env_query1);

        for (let i = 0; i < strSQL3.length; i++) {
            let check = await ElPotential.query()
                .where('inst_code', strSQL3[i].INSTITUTION_CODE?.trim());
            for (let j = 0; j < check.length; j++) {
                check[j].valid_institution = true
                check[j].save();
            }
        }

        return strSQL3;
    }

    private async restriction(bP: BursaryPeriod) {

        const restrictionCodes = await Restriction.query().select('restriction_code');
        const restrictionString = restrictionCodes.map((row) => '\'' + row.restriction_code + '\'').join(', ');

        const env_query = Env.get('RESTRICTIONS_QUERY1');
        let qry = await this.sprintf(env_query, restrictionString, this.programCodesString, this.formatted_bpsd, this.formatted_bped, this.formatted_bpsd, this.formatted_bped, this.formatted_bpsd, this.formatted_bped);


        const strSQL = await Database.connection('oracle').rawQuery(qry);
        const restrictedSinArray = strSQL.map((row) => row.SIN);
        const elPotSin = await ElPotential.query().select('sin', 'bursary_period_id').whereIn('sin', restrictedSinArray);

        for (let i = 0; i < elPotSin.length; i++) {

            await ElPotentialRestriction.create({
                sin: elPotSin[i].sin,
                bursary_period_id: elPotSin[i].bursary_period_id
            });
        }
        console.log('Finished: ElPotentialRestriction.create');

        const restrictionSinsList = await ElPotentialRestriction.query().select('sin');
        console.log('Restricted SINs: ');
        console.log(restrictionSinsList.length);

        const restrictionSinsArray = restrictionSinsList.map((row) => row.sin);

        await ElPotential.query().whereIn('sin', restrictionSinsArray).update({ restriction: true });


        const env_query2 = Env.get('RESTRICTIONS_QUERY2');
        let qry2 = await this.sprintf(env_query2, restrictionSinsList.map((row) => '\'' + row.sin + '\'').join(', '), restrictionString);

        const strSQL2 = await Database.connection('oracle').rawQuery(qry2);

        for (let i = 0; i < strSQL2.length; i++) {
            await ElPotentialRestrictionDetail.create({
                sin: strSQL2[i].SIN,
                bursary_period_id: bP.id,
                restriction_code: strSQL2[i].RESTRICTION_CODE,
                restriction_description: strSQL2[i].RESTRICTION_TYP,
                applied_date: strSQL2[i].APPLIED_DTE
            });
        }

        return await strSQL2;
    }

    private async awardedInPriorYear(bP: BursaryPeriod) {
        const bpLastTwo = await BursaryPeriod.query().select('id').whereNot('id', bP.id).orderBy('id', 'desc').limit(2);
        const awardedApps = await Application.query().distinct('applications.sin').join('nebs', 'nebs.application_id', 'applications.id').where('award_status', 'Approved').whereIn('nebs.bursary_period_id', bpLastTwo.map((row) => row.id));

        const awardedAppsArray = awardedApps.map((row) => row.sin);

        let awarded = await ElPotential.query().whereIn('sin', awardedAppsArray).update({ awarded_in_prior_year: true });


        return awarded;
    }

    private async withdrawal() {


        const env_query = Env.get('WITHDRAWALS_QUERY1');
        let qry = await this.sprintf(env_query, this.programCodesString, this.formatted_bpsd, this.formatted_bped, this.formatted_bpsd, this.formatted_bped, this.formatted_bpsd, this.formatted_bped);

        const strSQL = await Database.connection('oracle').rawQuery(qry);
        const restrictedSinArray = strSQL.map((row) => row.SIN);

        return await ElPotential.query().whereIn('sin', restrictedSinArray).update({ withdrawal: true });
    }


    private async nurseType() {
        const elPot = await ElPotential.query().select('el_potentials.id', 'sfas_programs.nurse_type').join('sfas_programs', 'sfas_programs.sfas_program_code', 'el_potentials.program_code');

        for (let i = 0; i < elPot.length; i++) {
            await ElPotential.query().where('id', elPot[i].id).update({ nurse_type: elPot[i].nurse_type });
        }
        console.log('Finished: update({ nurse_type: elPot[i].nurse_type })');

        return elPot;
    }

    private async eligibility() {
        const elPot = await ElPotential.all();

        for (let i = 0; i < elPot.length; i++) {
            if (elPot[i].valid_institution == false) {
                elPot[i].eligibility = "Ineligible";
                elPot[i].neb_ineligible_reason = "Ineligible Institution";
            }
            if (elPot[i].restriction == true) {
                elPot[i].eligibility = "Ineligible";
                elPot[i].neb_ineligible_reason = "Restriction";
            }
            if (elPot[i].awarded_in_prior_year == true) {
                elPot[i].eligibility = "Ineligible";
                elPot[i].neb_ineligible_reason = "Awarded within prior two bursary periods";
            }
            if (elPot[i].total_unmet_need <= 0) {
                elPot[i].eligibility = "Ineligible";
                elPot[i].neb_ineligible_reason = "No unmet need";
            }
            if (elPot[i].withdrawal == true) {
                elPot[i].eligibility = "Ineligible";
                elPot[i].neb_ineligible_reason = "Withdrawal";
            }
            if (elPot[i].month_overlap == false) {
                elPot[i].eligibility = "Ineligible";
                elPot[i].neb_ineligible_reason = "No 30 day overlap between bursary period and study period";
            }
            elPot[i].save();

        }
        console.log('Finished: eligibility');

        return elPot;
    }


    private async rank() {
        //RankByUnmetNeed
        let elPot = await ElPotential.query().where('eligibility', "Eligible").orderBy('weekly_unmet_need', 'desc');
        for (let i = 0; i < elPot.length; i++) {
            elPot[i].rank_by_unmet_need = i + 1;
            elPot[i].save();
        }

        //RankByUnmetNeed("RN")
        elPot = await ElPotential.query().where('eligibility', "Eligible").where('nurse_type', "RN").orderBy('weekly_unmet_need', 'desc');
        for (let i = 0; i < elPot.length; i++) {
            elPot[i].rank_by_nurse_type = i + 1;
            elPot[i].save();
        }

        //RankByUnmetNeed("LPN")
        elPot = await ElPotential.query().where('eligibility', "Eligible").where('nurse_type', "LPN").orderBy('weekly_unmet_need', 'desc');
        for (let i = 0; i < elPot.length; i++) {
            elPot[i].rank_by_nurse_type = i + 1;
            elPot[i].save();
        }


        //RankBySector("Private")
        elPot = await ElPotential.query().where('eligibility', "Eligible").where('sector', "Private").orderBy('weekly_unmet_need', 'desc');
        for (let i = 0; i < elPot.length; i++) {
            elPot[i].rank_by_sector = i + 1;
            elPot[i].save();
        }


        //RankBySector("Public")
        elPot = await ElPotential.query().where('eligibility', "Eligible").where('sector', "Public").orderBy('weekly_unmet_need', 'desc');
        for (let i = 0; i < elPot.length; i++) {
            elPot[i].rank_by_sector = i + 1;
            elPot[i].save();
        }
        console.log('Finished: rank');

        return true;
    }

    private async awardOrDeny(bP: BursaryPeriod) {
        let defaultAward = bP.default_award == null ? 0 : bP.default_award;
        let periodBudget = bP.period_budget == null ? 0 : bP.period_budget;
        let rNPortion = bP.rn_budget == null ? 0 : bP.rn_budget;
        let pubSecPortion = bP.public_sector_budget == null ? 0 : bP.public_sector_budget;

        //AwardByNurseType
        if (bP.budget_allocation_type == 'Nurse Type') {
            let numRNRecipient = Math.round((periodBudget * (rNPortion / 100)) / defaultAward);
            let numLPNRecipient = Math.round((periodBudget * ((100 - rNPortion) / 100)) / defaultAward);
            await ElPotential.query().where('nurse_type', "RN").where('rank_by_nurse_type', '<=', numRNRecipient).update({ award_or_deny: "Award" });
            await ElPotential.query().where('nurse_type', "LPN").where('rank_by_nurse_type', '<=', numLPNRecipient).update({ award_or_deny: "Award" });
        }

        //AwardBySector
        else if (bP.budget_allocation_type == 'Sector') {
            let numPublicRecipient = Math.round((periodBudget * (pubSecPortion / 100)) / defaultAward)
            let numPrivateRecipient = Math.round((periodBudget * ((100 - pubSecPortion) / 100)) / defaultAward)
            await ElPotential.query().where('sector', "Public").where('rank_by_sector', '<=', numPublicRecipient).update({ award_or_deny: "Award" });
            await ElPotential.query().where('sector', "Private").where('rank_by_sector', '<=', numPrivateRecipient).update({ award_or_deny: "Award" });

        }

        //AwardByUnmetNeed
        else {
            let numRecipient = Math.round(periodBudget / defaultAward)
            await ElPotential.query().where('rank_by_unmet_need', '<=', numRecipient).update({ award_or_deny: "Award" });
        }

        await ElPotential.query().where('eligibility', "Ineligible").update({ neb_deny_reason: "Ineligible", award_or_deny: "Deny" });
        await ElPotential.query().whereNull('award_or_deny').update({ award_or_deny: "Deny" });
        await ElPotential.query().where('eligibility', "Eligible").where('award_or_deny', "Deny").update({ neb_deny_reason: "Ministry budget for period surpassed" });

        console.log("Finished awardOrDeny")


        return true;
    }

    private async awardAmount(bP: BursaryPeriod) {
        await ElPotential.query().where('award_or_deny', "Award").update({ award_amount: bP.default_award });
        return true;
    }

    private async sfasAwardId() {
        const strSQL = await Neb.query().whereNotNull('sfas_award_id').select('sfas_award_id').orderBy('sfas_award_id', 'desc').first()
        if (strSQL != null && strSQL.sfas_award_id != null) {
            let nextSfasId = strSQL?.sfas_award_id + 1;
            let elPot = await ElPotential.query().where('award_or_deny', "Award").orderBy('application_number', 'asc');
            for (let i = 0; i < elPot.length; i++) {
                elPot[i].sfas_award_id = nextSfasId + i;
                elPot[i].save();
            }
            console.log('Finished: sfasAwardId');

        }
        return strSQL;
    }


    private async awardedTextLine(record: any, bp: any) {
        let line = "SP04";
        line += await this.padStringWithSpaces(DateTime.fromISO(bp.bursary_period_start_date.toISOString(), { zone: 'America/Los_Angeles' }).toFormat('yyyyMMdd'), 8)
        line += await this.padStringWithSpaces(DateTime.fromISO(bp.bursary_period_end_date.toISOString(), { zone: 'America/Los_Angeles' }).toFormat('yyyyMMdd'), 8)
        line += await this.padStringWithSpaces(record.sfas_award_id, 6, true)
        line += await this.padStringWithSpaces(record.sin, 9)
        line += await this.padStringWithSpaces(record.last_name, 25)
        line += await this.padStringWithSpaces(record.first_name, 15)
        line += await this.padStringWithSpaces(record.middle_name, 1)
        line += await this.padStringWithSpaces(record.street_address1, 40)
        line += await this.padStringWithSpaces(record.street_address2, 40)
        line += await this.padStringWithSpaces(record.city, 25)
        line += await this.padStringWithSpaces((record.province == 'British Columbia' ? "BC" : record.province), 4)
        line += await this.padStringWithSpaces(record.postal_code, 10)
        line += "CAN " // Country
        line += await this.padStringWithSpaces(DateTime.fromISO(record.birth_date.toISOString(), { zone: 'America/Los_Angeles' }).toFormat('yyyyMMdd'), 8)
        line += await this.padStringWithSpaces(record.gender, 1)
        line += await this.padStringWithSpaces("", 50) // Email is unknown
        line += await this.padStringWithSpaces(record.phone_number, 10)
        line += "CA" //citizenship is unknow; default value CA
        line += await this.padStringWithSpaces(DateTime.fromISO(record.study_start_date.toISOString(), { zone: 'America/Los_Angeles' }).toFormat('yyyyMMdd'), 8)
        line += await this.padStringWithSpaces(DateTime.fromISO(record.study_end_date.toISOString(), { zone: 'America/Los_Angeles' }).toFormat('yyyyMMdd'), 8)
        line += await this.padStringWithSpaces(record.weekly_unmet_need, 8, true)
        line += await this.padStringWithSpaces("", 10) //student number is unknown
        line += await this.padStringWithSpaces(record.inst_code, 4)
        line += await this.padStringWithSpaces(record.area_of_study, 30)
        line += "F" //fulltime flag
        line += await this.padStringWithSpaces(record.award_amount * 100, 8, true)
        line += await this.padStringWithSpaces(DateTime.now().toFormat('yyyyMMdd'), 8)
        line += await this.padStringWithSpaces("", 8) //Redeposit date
        line += await this.padStringWithSpaces("", 4) //Redeposit date
        line += await this.padStringWithSpaces(DateTime.now().toFormat('yyyyMMdd'), 8)
        line += await this.padStringWithSpaces(DateTime.now().toFormat('yyyyMMdd'), 8)
        line += "HOME" // Mail to
        line += "N" // Final flag
        line += "N" // Manual flag

        return line;
    }

    private async prepareCsvLine(record: any) {
        const dob = record.birth_date == null ? '' : DateTime.fromISO(record.birth_date.toISOString(), { zone: 'America/Los_Angeles' }).toFormat('yyyyMMdd');
        const ssd = record.study_start_date == null ? '' : DateTime.fromISO(record.study_start_date.toISOString(), { zone: 'America/Los_Angeles' }).toFormat('yyyyMMdd');
        const sed = record.study_end_date == null ? '' : DateTime.fromISO(record.study_end_date.toISOString(), { zone: 'America/Los_Angeles' }).toFormat('yyyyMMdd');

        return `${record.application_number},${record.sin},${record.postal_code},${dob},"${record.first_name}","${record.middle_name}","${record.last_name}",${record.assessed_need_amount},${record.total_unmet_need},${record.weeks_of_study},${record.weekly_unmet_need},${record.program_year},"${record.street_address1}","${record.street_address2}","${record.city}","${record.province}",${record.gender},${record.phone_number},${ssd},${sed},"${record.institution_name}",${record.program_code},${record.inst_code},${record.area_of_study},${record.degree_level},${record.bursary_period_id},${record.month_overlap},${record.num_day_overlap},${record.valid_institution},${record.restriction},${record.awarded_in_prior_year},${record.withdrawal},${record.nurse_type},${record.sector},${record.eligibility},${record.neb_ineligible_reason},${record.rank_by_unmet_need},${record.rank_by_nurse_type},${record.rank_by_sector},${record.award_or_deny},${record.neb_deny_reason},${record.award_amount},${record.sfas_award_id}`;
    }

    private async sprintf(format, ...values) {
        return values.reduce((carry, current) => carry.replace(/:param/, current), format);
    }

    private async padStringWithSpaces(inputString: any, desiredLength: number, preFixWithZero: boolean = false) {
        if (inputString === null) {
            inputString = "";
        }
        if (typeof inputString !== 'string') {
            inputString = inputString.toString(); // Convert to string if not already
        }
        inputString = inputString.trim();


        if (inputString.length === desiredLength) {
            return inputString; // Already the desired length, return as is
        } else if (inputString.length > desiredLength) {
            return inputString.slice(0, desiredLength); // Truncate to desired length
        } else {
            if (preFixWithZero) {
                const paddingCharacter = preFixWithZero ? '0' : '';

                const spacesToAdd = desiredLength - inputString.length;
                const paddedString = paddingCharacter.repeat(spacesToAdd) + inputString;

                return paddedString;
            }

            const spacesToAdd = desiredLength - inputString.length;
            return inputString + ' '.repeat(spacesToAdd);
        }
    }

}
