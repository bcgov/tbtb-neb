import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'
import axios from 'axios'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash';
import Role from 'App/Models/Role';
import Roles from 'App/Enums/Roles';


export default class KcAuth {
	public async handle({ request, response, session, auth }: HttpContextContract, next: () => Promise<void>) {

		//if the user is already authenticated continue to next
		if (!!auth.isLoggedIn) {
			return next();
		}

		//from this point the user is not authenticated
		let vm = this;
		let vm_response = response;
		let authenticated = false;

		const authCompleteUrl = Env.get('KEYCLOAK_AUTH_URL');
		const queryObject = {
			scope: "profile%20email",
			response_type: "code",
			approval_prompt: "auto",
			redirect_uri: Env.get('KEYCLOAK_REDIRECT_URI'),
			client_id: Env.get('KEYCLOAK_CLIENT_ID'),
		};
		const queryString = Object.keys(queryObject)
			.map(function (key) {
				return key + "=" + queryObject[key];
			})
			.join("&");
		const auth_url = authCompleteUrl + "?" + queryString;
		const code = request.qs().code;
		const session_state = request.qs().session_state;


		//if this is a return from sso with code and session_state
		if (code && session_state) {
			session.forget('oauth2state')
			auth.logout()

			// You can access code and status here and perform actions accordingly
			let token_config = {
				grant_type: "authorization_code",
				client_id: Env.get('KEYCLOAK_CLIENT_ID'),
				client_secret: Env.get('KEYCLOAK_CLIENT_SECRET'),
				redirect_uri: Env.get('KEYCLOAK_REDIRECT_URI'),
				code: code,
			}

			await axios.post(
				Env.get('KEYCLOAK_TOKEN_URL'),
				token_config,
				{
					headers: { "Content-Type": "application/x-www-form-urlencoded" },
				}
			)
				.then(async function (response) {
					session.put('oauth2state', session_state)

					if (response.status === 200) {

						// User is authenticated, check token validity by making a userinfo request
						try {
							await axios.get(Env.get('KEYCLOAK_USERINFO'), {
								headers: {
									"Content-Type": "application/json",
									Authorization: `Bearer ${response.data.access_token}`,
								},
							})
								.then(async function (res) {
									// console.log('KEYCLOAK_USERINFO:', res)

									if (res.status === 200) {
										// Token is valid, continue to the next middleware/route


										//create or fetch the user
										const adonis_user = await vm.processUser(res.data)
										if (adonis_user !== null) {
											await auth.login(adonis_user);
											authenticated = true;
										}

									} else {
										// Token is invalid, return a 401 unauthorized response
										vm_response.status(401).json({
											error: 'Unauthorized #400',
										});
									}
								})
								.catch(function () {
									// console.log("ERROR USER INFO:")
									// console.log(err);
									vm_response.status(401).json({
										error: 'Unauthorized #401',
									});

								});

						} catch (error) {
							// Handle any errors that occur during the userinfo request
							vm_response.status(500).json({
								error: 'Internal server error #500',
							});
						}
					}
				})
				.catch(function () {
					vm_response.status(500).json({
						error: 'Internal server error #501',
					});

				});

		} else if (!auth.user) {
			//return to SSO Login Page
			response.redirect(auth_url);
			return;
		}


		if (authenticated) {
			return next();
		} else {
			response.status(500).json({
				error: 'internal server error #555',
			});
			return;
		}
	}

	// get user info from sso
	// register or retrieve the user
	public async processUser(userData) {
		// console.log('procssUser:', userData)
		let user = await User.query().where('idir_user_guid', userData.idir_user_guid).first();

		//if the user does not exist, register them as GUEST
		if (user === null) {
			user = await this.register(userData)
		}
		return user;
	}

	//register the user
	public async register(userData) {
		const password = await Hash.make(userData.idir_username)

		const user = await User.create({
			userId: userData.idir_username,
			firstName: userData.given_name,
			lastName: userData.family_name,
			email: userData.email,
			disabled: true,
			idirUserGuid: userData.idir_user_guid,
			password: password
		});

		let role = await Role.find(Roles.GUEST)

		// @ts-ignore
		await user.related('roles').attach([role.id]);

		return user;
	}
}
