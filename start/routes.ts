/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

import Route from '@ioc:Adonis/Core/Route'

//user going to login page
Route.get('/login', 'UsersController.login').as('login')
//user click on IDIR Login
Route.get('/sso-login', async ({ response }) => {
  response.redirect('/login')
}).as('sso-login').middleware('kc_auth');
//sso login response
Route.get('/applogin', 'UsersController.goOn').middleware('kc_auth').as('applogin');

Route.group(() => {
  Route.get('/logout', async ({ auth, inertia }) => {
    // Read value
    auth.logout();
    return inertia.render('Auth/Login')
  })

  Route.get('/dashboard', 'BursaryPeriodsController.index').as('dashboard');

  //authenticated admin routes
  Route.group(() => {

    Route.post('/finalize-neb', 'NebsController.finalizeNeb').as('finalize-neb');
    Route.post('/process-neb', 'NebsController.processNeb').as('process-neb');
    Route.get('/export-neb/:type/:id', 'NebsController.exportNeb').as('export-neb');

    Route.get('/process-neb', async ({ response }) => {
      response.redirect('/dashboard')
    });

    Route.post('/bursary-periods/fetch-neb', 'NebsController.fetchNeb').as('fetch-neb');
    Route.get('/bursary-periods/fetch-neb', async ({ response }) => {
      response.redirect('/dashboard')
    });

    Route.get('/bursary-periods/show/:id', 'BursaryPeriodsController.show').as('bursary-periods.show');
    Route.get('/bursary-periods/tobe-awarded', 'BursaryPeriodsController.tobeAwarded').as('bursary-periods.tobe-awarded');
    Route.get('/bursary-periods', 'BursaryPeriodsController.index').as('bursary-periods.index');
    Route.get('/bursary-periods/create', 'BursaryPeriodsController.index').as('bursary-periods.create');
    Route.get('/bursary-periods/fetch/:id?', 'BursaryPeriodsController.fetch').as('bursary-periods.fetch');
    Route.post('/bursary-periods/store', 'BursaryPeriodsController.store').as('bursary-periods.store');
    Route.put('/bursary-periods/update', 'BursaryPeriodsController.update').as('bursary-periods.update');
    Route.post('/bursary-periods/delete', 'BursaryPeriodsController.delete').as('bursary-periods.delete');

    Route.get('/restrictions', 'RestrictionsController.index').as('restrictions.index');
    Route.get('/restrictions/fetch/:id?', 'RestrictionsController.fetch').as('restrictions.fetch');
    Route.post('/restrictions/store', 'RestrictionsController.store').as('restrictions.store');

    Route.get('/neb-programs', 'ProgramsController.index').as('neb-programs.index');
    Route.get('/neb-programs/fetch/:id?', 'ProgramsController.fetch').as('neb-programs.fetch');
    Route.post('/neb-programs/store', 'ProgramsController.store').as('neb-programs.store');

    Route.get('/sfas-programs', 'SfasProgramsController.index').as('sfas-programs.index');
    Route.get('/sfas-programs/fetch/:id?', 'SfasProgramsController.fetch').as('sfas-programs.fetch');
    Route.post('/sfas-programs/store', 'SfasProgramsController.store').as('sfas-programs.store');

    Route.get('/staff', 'MaintenanceController.staffList').as('staff.list');
    Route.get('/staff/:id', 'MaintenanceController.staffShow').as('staff.show');
    Route.post('/staff/:id', 'MaintenanceController.staffEdit').as('staff.edit');
  })
    // .prefix('maintenance')
    .middleware('admin')
  // .as('maintenance.')

}).middleware(['auth']);
