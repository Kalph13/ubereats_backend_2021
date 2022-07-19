import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/users.entity";
import { Verification } from "./entities/verification.entity"
import { UserService } from "./users.service";
import { JwtService } from "src/jwt/jwt.service"
import { MailService } from "src/mail/mail.service";

const mockRepository = () => ({
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn()
});

const mockJwtService = {
    sign: jest.fn(() => 'signed-token-baby'),
    verify: jest.fn()
};

const mockMailService = {
    sendVerificationEmail: jest.fn()
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UserService', () => {
    let service: UserService;
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
                    useValue: mockJwtService
                },
                {
                    provide: MailService,
                    useValue: mockMailService
                }
                
            ]
        }).compile();
        service = module.get<UserService>(UserService);
        mailService = module.get<MailService>(MailService);
        jwtService = module.get<JwtService>(JwtService);
        userRepository = module.get(getRepositoryToken(User));
        verificationRepository = module.get(getRepositoryToken(Verification));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
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
            const result = await service.createAccount(createAccountArgs);
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
            const result = await service.createAccount(createAccountArgs);
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
            const result = await service.createAccount(createAccountArgs);
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
            const result = await service.login(loginArgs);
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
            const result = await service.login(loginArgs);
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
            const result = await service.login(loginArgs);
            expect(jwtService.sign).toHaveBeenCalledTimes(1);
            expect(jwtService.sign).toHaveBeenCalledWith(
                expect.any(Number)
            );
            expect(result).toEqual({
                GraphQLSucceed: true,
                loginToken: 'signed-token-baby'
            });
        });
    });

    it.todo('findById');
    it.todo('editProfile');
    it.todo('verifyEmail');
});
