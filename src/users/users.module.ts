import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/users.entity";
import { UserResolver } from "./users.resolver";
import { UserService } from "./users.service";
import { Verification } from "./entities/verification.entity";

/* ConfigService: https://docs.nestjs.com/techniques/configuration#using-the-configservice */
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [TypeOrmModule.forFeature([User, Verification]), ConfigModule],
    providers: [UserResolver, UserService],
    exports: [UserService]
})
export class UserModule {}
