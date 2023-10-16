/*
|--------------------------------------------------------------------------
| Inertia Preloaded File
|--------------------------------------------------------------------------
|
| Any code written inside this file will be executed during the application
| boot.
|
*/

import Inertia from '@ioc:EidelLev/Inertia';
import User from 'App/Models/User';

Inertia.share({
	//pass auth user info to inertia/vue
	auth: (auth) => {
		// @ts-ignore
		return auth.auth.isLoggedIn ? User.query().preload('roles').where('id', auth.auth.user?.id).first() : null
	},
	errors: (ctx) => {
		return ctx.session.flashMessages.get('errors');
	},
}).version(() => Inertia.manifestFile('public/assets/manifest.json'));
