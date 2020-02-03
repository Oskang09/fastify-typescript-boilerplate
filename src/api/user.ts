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