import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Entity, Repository } from "typeorm";
import * as jwt from "jsonwebtoken";
import { JwtService } from "src/jwt/jwt.service";
import { MailService } from "src/mail/mail.service";
import { User } from "./entities/users.entity";
import { Verification } from "./entities/verification.entity";
import { UserProfileOutput } from "./dtos/user-profile.dto";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { EditProfileInput, EditProfileOutput } from "./dtos/edit-profile.dto";
import { VerifyEmailOutput } from "./dtos/verify-email.dto";

/* Replaced by JwtService */
/* ConfigService: https://docs.nestjs.com/techniques/configuration#using-the-configservice */
import { ConfigService } from "@nestjs/config";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly users: Repository<User>,
        @InjectRepository(Verification)
        private readonly verifications: Repository<Verification>,
        /* Replaced by JwtService */
        /* private readonly configService: ConfigService, */
        private readonly jwtService: JwtService,
        private readonly mailService: MailService
    ) {}

    async getAll(): Promise<User[]> {
        return this.users.find();
    }
    
    async findById(id: number): Promise<UserProfileOutput> {
        try {
            const findUser = await this.users.findOneOrFail({ where: { id } });
            return {
                GraphQLSucceed: true,
                user: findUser
            }
        } catch (GraphQLError) {
            return {
                GraphQLSucceed: false,
                GraphQLError: "Couldn't find the user"
            }
        }
    }

    async createAccount({ email, password, role }: CreateAccountInput): Promise<CreateAccountOutput> {
        try {
            const existingUser = await this.users.findOne({ where: { email } });

            if (existingUser) {
                return {
                    GraphQLSucceed: false,
                    GraphQLError: "The username already exists"
                }
            }

            const newUser = await this.users.save(this.users.create({ email, password, role }));
            const verification = await this.verifications.save(this.verifications.create({ user: newUser }));
            this.mailService.sendVerificationEmail(newUser.email, verification.code);
            
            return {
                GraphQLSucceed: true
            }
        } catch (e) {
            return {
                GraphQLSucceed: false,
                GraphQLError: "Couldn't create the account"
            }
        }
    }

    async login({ email, password }: LoginInput): Promise<LoginOutput> {
        try {
            const loggedInUser = await this.users.findOne({
                where: { email },
                select: ['id', 'password'] /* Extract Only 'id', 'password' Field */
            });

            if (!loggedInUser) {
                return {
                    GraphQLSucceed: false,
                    GraphQLError: "Couldn't find the user"
                }
            }

            const checkPassword = await loggedInUser.checkPassword(password);

            if (!checkPassword) {
                return {
                    GraphQLSucceed: false,
                    GraphQLError: "Wrong password"
                }
            }

            /* Replaced by JwtService */
            /* const loginToken = jwt.sign( { id: loggedInUser.id }, this.configService.get('PRIVATE_KEY')); */
            const loginToken = this.jwtService.sign(loggedInUser.id);

            return {
                GraphQLSucceed: true,
                loginToken
            }
        } catch (GraphQLError) {
            return {
                GraphQLSucceed: false,
                GraphQLError: "Login failed"
            }
        }
    }

    async editProfile(userId: number, { email, password }: EditProfileInput): Promise<EditProfileOutput> {
        /* return this.users.update(userId, { email, password }); */
        try {
            const editUser = await this.users.findOne({ where: { id: userId } });
            
            if (email) {
                editUser.email = email;
                editUser.verified = false;
                await this.verifications.delete({ user: { id: editUser.id } });
                const verification = await this.verifications.save(this.verifications.create({ user: editUser }));
                this.mailService.sendVerificationEmail(editUser.email, verification.code);
            }
            
            if (password) {
                editUser.password = password;
            }
            
            await this.users.save(editUser);

            return {
                GraphQLSucceed: true
            }
        } catch (GraphQLError) {
            return {
                GraphQLSucceed: false,
                GraphQLError: "Couldn't update the profile"
            }
        }
    }

    async verifyEmail(code: string): Promise<VerifyEmailOutput> {
        try {
            const verification = await this.verifications.findOne({
                where: { code },
                relations: ['user']
            });
     
            if (verification) {
                verification.user.verified = true;
                await this.users.save(verification.user);
                await this.verifications.delete(verification.id);

                return {
                    GraphQLSucceed: true
                };
            }

            return {
                GraphQLSucceed: false,
                GraphQLError: "Verification error"
            }
        } catch (GraphQLError) {
            return {
                GraphQLSucceed: false,
                GraphQLError: "Couldn't verify the email"
            }
        }
    }
}
