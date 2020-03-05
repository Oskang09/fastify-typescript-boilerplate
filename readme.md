# Tech Stack

* Typescript

# Libraries

* Fastify
* Firebase ( will remove later ) 
* Sequelize

# Explanation

By default plugin folder will have all the tools. 

* `endpoint.ts` included all endpoints reading, type interface and annotation definition
* `sequelize.ts` included all model reading, type interface, repository initialization and annotation definition

# Model Definition

Will follow `sequelize-typescript` structure.

```ts
import { Model, Table, Column, DataType, CreatedAt, UpdatedAt } from 'sequelize-typescript';

@Table({
    modelName: 'user',
    tableName: 'users',
    timestamps: true,
    freezeTableName: true,
    schema: 'ordorex'
})
class User extends Model<User> {

    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    })
    id: number

    @Column({
        type: DataType.STRING,
        unique: true,
    })
    uid: string

    @Column(DataType.STRING)
    name: string

    @Column({
        type: DataType.STRING,
        unique: true,
    })
    email: string

    @Column(DataType.STRING)
    password: string

    @Column(DataType.STRING)
    fcm_token: string

    @Column(DataType.JSONB)
    permissions: string[]

    @CreatedAt
    createdAt: Date

    @UpdatedAt
    updatedAt: Date

    generateJwtToken(): object {
        return { id: this.id };
    }
}

export default User;
```

# Example Endpoint

`@IRepository(sequelizeModel)` will receive repository instance when construct work like dependency injection. `@Endpoint` will have all definition about endpoint, following `fastify-schema`. `data-mapper` is a extra tool to map data to other layer easy to access supported dot notation definition etc `user.token`.

```
import { Repository } from "sequelize-typescript";
import * as jwt from 'jsonwebtoken';
import { Endpoint, IRepository, EndpointAPI, Request, Response } from "../plugin/endpoint";
import User from '../model/user';

class UserAPI extends EndpointAPI {

    @IRepository(User)
    userRepository: Repository<User>

    @Endpoint({
        method: 'PUT',
        path: '/user/profile',
    })
    async update_profile(req: Request, res: Response): Promise<any> {


    }

    @Endpoint({
        method: 'POST',
        path: "/user/login",
        schema: {
            body: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    id_token: { type: 'string' },
                    fcm_token: { type: 'string' },
                }
            }
        },
        dataMapper: {
            id_token: "body",
            fcm_token: "body",
        },
    })
    async login(req: Request, res: Response): Promise<any> {
        const { id_token, fcm_token } = req.data;
        const decoded = await this.authentication.verifyIdToken(id_token, true);
        let user: User = await this.userRepository.findOne({
            where: { uid: decoded.uid },
        });

        if (!user) {
            throw Error("")
        }

        user = user.update("fcm_token", fcm_token);
        const token = await jwt.sign(user.generateJwtToken(), this.jwt_secret)
        return { user, token };
    }
};

export default UserAPI;
```
