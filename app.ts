import 'reflect-metadata';

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fastify from 'fastify';
import endpoint from './src/plugin/endpoint';
import sequelize from './src/plugin/sequelize';
import firebase from './src/plugin/firebase';

dotenv.config({ path: path.join(__dirname, `env/${process.env.ENVIRONMENT || "development"}.env`) })
async function bootstrap() {
    const server = fastify();
    const fbapp = await firebase();
    const sqlize = await sequelize();

    await endpoint({
        fastify: server,
        sequelize: sqlize,
        firebase: fbapp,
    });
    server.decorate('user', null);
    server.decorateRequest('data', {});
    server.listen(3000);
}
bootstrap();