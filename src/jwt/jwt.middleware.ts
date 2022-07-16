import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { JwtService } from "./jwt.service";
import { UserService } from "src/users/users.service";

/* Middleware: https://docs.nestjs.com/middleware#middleware */
@Injectable()
export class JwtMiddleware implements NestMiddleware {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService
    ) {}

    async use(req: Request, res: Response, next: NextFunction) {
        console.log("------ JwtMiddleware ------ req.headers['x-jwt']:", req.headers['x-jwt']);

        if ('x-jwt' in req.headers) {
            const loginToken = req.headers['x-jwt'];
            const decoded = this.jwtService.verify(loginToken.toString());
                        
            if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
                try {
                    const loggedInUser = await this.userService.findById(decoded['id']);
                    req['user'] = loggedInUser;
                } catch (e) {
                    console.log(e);
                }
            }
        }
        next();
    }
};
