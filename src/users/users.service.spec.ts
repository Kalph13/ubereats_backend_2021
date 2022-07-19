import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/users.entity";
import { Verification } from "./entities/verification.entity"
import { UserService } from "./users.service";
import { JwtService } from "src/jwt/jwt.service"
import { MailService } from "src/mail/mail.service";

const mockRepository = () => ({
    save: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    findOne: jest.fn(),
    findOneOrFail: jest.fn()
});

const mockJwtService = () => ({
    sign: jest.fn(() => 'signed-token-baby'),
    verify: jest.fn()
});

const mockMailService = () => ({
    sendVerificationEmail: jest.fn()
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UserService', () => {
    let userService: UserService;
    let mailService: MailService;
    let jwtService: JwtService;
    let userRepository: MockRepository<User>;
    let verificationRepository: MockRepository<Verification>;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockRepository()
                },
                {
                    provide: getRepositoryToken(Verification),
                    useValue: mockRepository()
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService()
                },
                {
                    provide: MailService,
                    useValue: mockMailService()
                }
                
            ]
        }).compile();
        userService = module.get<UserService>(UserService);
        mailService = module.get<MailService>(MailService);
        jwtService = module.get<JwtService>(JwtService);
        userRepository = module.get(getRepositoryToken(User));
        verificationRepository = module.get(getRepositoryToken(Verification));
    });

    it('should be defined', () => {
        expect(userService).toBeDefined();
    });

    describe('createAccount', () => {
        const createAccountArgs = {
            email: 'test@email.com',
            password: 'test.password',
            role: 0
        };
        it('should fail if the user already exists', async () => {
            userRepository.findOne.mockResolvedValue({
                id: 1,
                email: '',
            });
            const result = await userService.createAccount(createAccountArgs);
            expect(result).toMatchObject({
                GraphQLSucceed: false,
                GraphQLError: 'The username already exists'
            })
        });
        it('should create a new user', async () => {
            userRepository.findOne.mockResolvedValue(undefined);
            userRepository.create.mockReturnValue(createAccountArgs);
            userRepository.save.mockResolvedValue(createAccountArgs);
            verificationRepository.create.mockReturnValue({ user: createAccountArgs });
            verificationRepository.save.mockResolvedValue({ code: 'code' });
            const result = await userService.createAccount(createAccountArgs);
            expect(userRepository.create).toHaveBeenCalledTimes(1);
            expect(userRepository.create).toHaveBeenCalledWith(createAccountArgs);
            expect(userRepository.save).toHaveBeenCalledTimes(1);
            expect(userRepository.save).toHaveBeenCalledWith(createAccountArgs);
            expect(verificationRepository.create).toHaveBeenCalledTimes(1);
            expect(verificationRepository.create).toHaveBeenCalledWith({ user: createAccountArgs });
            expect(verificationRepository.save).toHaveBeenCalledTimes(1);
            expect(verificationRepository.save).toHaveBeenCalledWith({ user: createAccountArgs });
            expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
            expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(String)
            );
            expect(result).toEqual({
                GraphQLSucceed: true
            });
        });
        it('should fail on exception', async () => {
            userRepository.findOne.mockRejectedValue(new Error());
            const result = await userService.createAccount(createAccountArgs);
            expect(result).toEqual({
                GraphQLSucceed: false,
                GraphQLError: "Couldn't create the account"
            })
        });
    });

    describe('login', () => {
        const loginArgs = {
            email: 'test@email.com',
            password: 'test.password',
        };
        it("should fail if the user doesn't exist", async () => {
            userRepository.findOne.mockResolvedValue(null);
            const result = await userService.login(loginArgs);
            expect(userRepository.findOne).toHaveBeenCalledTimes(1);
            expect(userRepository.findOne).toHaveBeenCalledWith(
                expect.any(Object)
            );
            expect(result).toEqual({
                GraphQLSucceed: false,
                GraphQLError: "Couldn't find the user"
            });
        });
        it('should fall if the password is wrong', async () => {
            const mockUser = {
                checkPassword: jest.fn(() => Promise.resolve(false))
            };
            userRepository.findOne.mockResolvedValue(mockUser);
            const result = await userService.login(loginArgs);
            expect(result).toEqual({
                GraphQLSucceed: false,
                GraphQLError: 'Wrong password'
            });
        });
        it('should return token if the password is correct', async () => {
            const mockUser = {
                id: 1,
                checkPassword: jest.fn(() => Promise.resolve(true))
            };
            userRepository.findOne.mockResolvedValue(mockUser);
            const result = await userService.login(loginArgs);
            expect(jwtService.sign).toHaveBeenCalledTimes(1);
            expect(jwtService.sign).toHaveBeenCalledWith(
                expect.any(Number)
            );
            expect(result).toEqual({
                GraphQLSucceed: true,
                loginToken: 'signed-token-baby'
            });
        });
        it('should fail on exception', async () => {
            userRepository.findOne.mockRejectedValue(new Error());
            const result = await userService.login(loginArgs);
            expect(result).toEqual({
                GraphQLSucceed: false,
                GraphQLError: 'Login failed'
            })
        });
    });

    describe('findById', () => {
        const mockUser = {
            id: 1
        };
        it('should find an existing user', async () => {
            userRepository.findOneOrFail.mockResolvedValue(mockUser);
            const result = await userService.findById(1);
            expect(result).toEqual({
                GraphQLSucceed: true,
                user: mockUser
            })
        });
        it('should fail if no user is found', async () => {
            userRepository.findOneOrFail.mockRejectedValue(new Error());
            const result = await userService.findById(1);
            expect(result).toEqual({
                GraphQLSucceed: false,
                GraphQLError: "Couldn't find the user"
            });
        });
    });

    describe('editProfile', () => {
        it('should change email', async () => {
            const oldUser = {
                email: 'oldUser@email.com',
                verified: true
            };
            const editProfileArgs = {
                userId: 1,
                input: { email: 'newUser@email.com' }
            };
            const newVerification = {
                code: 'codeArg'
            };
            const newUser = {
                email: 'newUser@email.com',
                verified: false
            };
            userRepository.findOne.mockResolvedValue(oldUser);
            verificationRepository.create.mockReturnValue(newVerification);
            verificationRepository.save.mockResolvedValue(newVerification);
            await userService.editProfile(editProfileArgs.userId, editProfileArgs.input);
            expect(userRepository.findOne).toHaveBeenCalledTimes(1);
            expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: editProfileArgs.userId } });
            expect(verificationRepository.create).toHaveBeenCalledWith({ user: newUser });
            expect(verificationRepository.save).toHaveBeenCalledWith(newVerification);
            expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
            expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(newUser.email, newVerification.code);
        });
        it('should change password', async () => {
            const editProfileArgs = {
                userId: 1,
                input: { password: 'newPassword' }
            }
            userRepository.findOne.mockResolvedValue({ password: 'oldPassword' });
            const result = await userService.editProfile(editProfileArgs.userId, editProfileArgs.input);
            expect(userRepository.save).toHaveBeenCalledTimes(1);
            expect(userRepository.save).toHaveBeenCalledWith(editProfileArgs.input);
            expect(result).toEqual({
                GraphQLSucceed: true
            })
        });
        it('should fail on exception', async () => {
            const editProfileArgs = {
                userId: 1,
                input: { email: 'newUser@email.com', password: 'newPassword' }
            }
            userRepository.findOne.mockRejectedValue(new Error());
            const result = await userService.editProfile(editProfileArgs.userId, editProfileArgs.input);
            expect(result).toEqual({
                GraphQLSucceed: false,
                GraphQLError: "Couldn't update the profile"
            })
        });
    });

    describe('verifyEmail', () => {
        it('should verify email', async () => {
            const mockVerification = {
                id: 1,
                user: {
                    verified: false
                }
            };
            verificationRepository.findOne.mockResolvedValue(mockVerification);
            const result = await userService.verifyEmail('');
            expect(verificationRepository.findOne).toHaveBeenCalledTimes(1);
            expect(verificationRepository.findOne).toHaveBeenCalledWith(expect.any(Object));
            expect(userRepository.save).toHaveBeenCalledTimes(1);
            expect(userRepository.save).toHaveBeenCalledWith({ verified: true });
            expect(verificationRepository.delete).toHaveBeenCalledTimes(1);
            expect(verificationRepository.delete).toHaveBeenCalledWith(mockVerification.id);
            expect(result).toEqual({ 
                GraphQLSucceed: true
            })
        });
        it('should fail when the verification is not found', async () => {
            verificationRepository.findOne.mockResolvedValue(undefined);
            const result = await userService.verifyEmail('');
            expect(result).toEqual({
                GraphQLSucceed: false,
                GraphQLError: 'Verification error'
            })
        });
        it('should fail on exception', async () => {
            verificationRepository.findOne.mockRejectedValue(new Error());
            const result = await userService.verifyEmail('');
            expect(result).toEqual({
                GraphQLSucceed: false,
                GraphQLError: "Couldn't verify the email"
            });
        });
    });
});
