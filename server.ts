/*
|--------------------------------------------------------------------------
| AdonisJs Server
|--------------------------------------------------------------------------
|
| The contents in this file is meant to bootstrap the AdonisJs application
| and start the HTTP server to accept incoming connections. You must avoid
| making this file dirty and instead make use of `lifecycle hooks` provided
| by AdonisJs service providers for custom code.
|
*/

import 'reflect-metadata'
import sourceMapSupport from 'source-map-support'
import { Ignitor } from '@adonisjs/core/build/standalone'
import fs from 'fs';

sourceMapSupport.install({ handleUncaughtExceptions: false })

// Check if the .env file already exists
if (!fs.existsSync('.env')) {
  // Create a .env file with the ENV_VAR environment variable
  fs.writeFileSync('.env', `${process.env.ENV_VAR}\n`);
  fs.writeFileSync('./build/.env', `${process.env.ENV_VAR}\n`);
}

new Ignitor(__dirname)
  .httpServer()
  .start()
