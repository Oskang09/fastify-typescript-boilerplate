import { glob } from 'glob';
import { FastifyRequest, FastifyReply, FastifyInstance, RouteSchema } from "fastify";
import { ServerResponse } from 'http';
import { Sequelize, ModelCtor } from 'sequelize-typescript';
import { app, auth } from 'firebase-admin';
import get = require('lodash/get');

export type EndpointOptions = {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    authenticate?: boolean,
    schema?: RouteSchema,
    dataMapper?: { [keyof: string]: string },
    _handler?: (req: FastifyRequest, res: FastifyReply<ServerResponse>) => any,
    _class?: string,
    _property?: string,
};

export type EndpointCtor = {
    fastify: FastifyInstance,
    sequelize: Sequelize,
    firebase: app.App,
};

export class EndpointAPI {
    fastify: FastifyInstance
    sequelize: Sequelize
    authentication: auth.Auth
    jwt_secret: string

    constructor(ctor: EndpointCtor) {
        this.fastify = ctor.fastify;
        this.sequelize = ctor.sequelize;
        this.authentication = ctor.firebase.auth();
        if (!process.env.JWT_SECRET) {
            console.error("Missing 'JWT_SECRET' environment variables.")
            process.exit();
        }

        this.jwt_secret = process.env.JWT_SECRET
    }
};

export type RepositoryOptions = {
    key: string,
    value: ModelCtor,
};

export type Request = { data: { [keyof: string]: any } } & FastifyRequest;
export type Response = FastifyReply<ServerResponse>;

const ENDPOINT_METAKEY = "fastify.endpoint";
const REPOSITORY_METAKEY = "sequelize.repository";

export function Endpoint(opt: EndpointOptions) {
    return function (target: EndpointAPI, propertyKey: string, descriptor: PropertyDescriptor) {
        opt._handler = descriptor.value
        opt._class = target.constructor.name
        opt._property = propertyKey

        let metadata: Array<EndpointOptions> = Reflect.getMetadata(ENDPOINT_METAKEY, target);
        if (!metadata) {
            metadata = []
        }
        metadata.push(opt);
        Reflect.defineMetadata(ENDPOINT_METAKEY, metadata, target);
    }
};

export function IRepository(model: ModelCtor) {
    return function (target: EndpointAPI, propertKey: string) {
        let metadata: Array<RepositoryOptions> = Reflect.getMetadata(ENDPOINT_METAKEY, target);
        if (!metadata) {
            metadata = []
        }
        metadata.push({ key: propertKey, value: model });
        Reflect.defineMetadata(REPOSITORY_METAKEY, metadata, target);
    }
};

export default async function (ctor: EndpointCtor) {
    for (const file of glob.sync("../api/**.ts", { cwd: __dirname })) {
        const Api = require(file).default;
        const api = new Api(ctor);

        const metas: Array<EndpointOptions> = Reflect.getMetadata(ENDPOINT_METAKEY, api);
        for (const meta of metas) {
            ctor.fastify[meta.method.toLowerCase()](
                meta.path,
                {
                    schema: meta.schema,
                },
                async (req: Request, res: Response): Promise<any> => {

                    if (meta.authenticate) {
                        // jwt verify and inject data
                    }

                    if (meta.dataMapper) {
                        for (const [key, value] of Object.entries(meta.dataMapper)) {
                            const values = value.split(",");
                            req.data[key] = get(req[values[0]], values[1] || key);
                        }
                    }

                    if (meta._handler) {
                        return meta._handler.bind(api)(req, res);
                    }
                },
            )
        }

        const repos: Array<RepositoryOptions> = Reflect.getMetadata(REPOSITORY_METAKEY, api);
        for (const repo of repos) {
            api[repo.key] = ctor.sequelize.getRepository(repo.value);
        }
    }
};