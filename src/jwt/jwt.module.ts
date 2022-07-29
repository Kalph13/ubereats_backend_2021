import { Module, Global, DynamicModule } from "@nestjs/common";
import { JwtService } from "./jwt.service";
import { JwtModuleOptions } from "./jwt.interfaces";
import { CONFIG_OPTIONS } from "../common/common.constants";

@Module({})
@Global()
export class JwtModule {
    /* Dynamic Module: https://docs.nestjs.com/fundamentals/dynamic-modules */
    static forRoot(options: JwtModuleOptions): DynamicModule {
        return {
            module: JwtModule,
            /* Custom Provider: https://docs.nestjs.com/fundamentals/custom-providers#value-providers-usevalue */
            providers: [{
                provide: CONFIG_OPTIONS,
                useValue: options
            }, JwtService],
            exports: [JwtService]
        }
    }
}
