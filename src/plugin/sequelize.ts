import { Sequelize, ModelCtor } from 'sequelize-typescript';
import { glob } from 'glob';

export default async function () {
    if (!process.env.DB_USERNAME) {
        console.error("Missing 'DB_USERNAME' environment variables.")
        process.exit();
    }

    if (!process.env.DB_NAME) {
        console.error("Missing 'DB_NAME' environment variables.")
        process.exit();
    }

    if (!process.env.DB_PASSWORD) {
        console.error("Missing 'DB_PASSWORD' environment variables.")
        process.exit();
    }

    const models: Array<ModelCtor> = new Array();
    for (const file of glob.sync('../model/**.ts', { cwd: __dirname })) {
        const model: ModelCtor = require(file).default;
        models.push(model);
    }
    const sequelize = new Sequelize({
        dialect: 'postgres',
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        models: models,
        repositoryMode: true,
    });
    await sequelize.authenticate();
    await sequelize.sync();
    return sequelize
};