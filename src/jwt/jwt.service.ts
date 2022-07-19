import { Injectable, Inject } from "@nestjs/common";
import { JwtModuleOptions } from "./jwt.interfaces";
import { CONFIG_OPTIONS } from "../common/common.constants";
import * as jwt from "jsonwebtoken"

@Injectable()
export class JwtService {
    constructor(
        @Inject(CONFIG_OPTIONS)
        private readonly options: JwtModuleOptions
    ) {}

    sign(userId: number): string {
        console.log("------ JwtService ------ userId:", userId);
        return jwt.sign({ id: userId }, this.options.privateKey);
    }

    verify(loginToken: string) {
        return jwt.verify(loginToken, this.options.privateKey);
    }
}
