import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "src/app.module";
import { getConnection, Repository } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "src/users/entities/users.entity";

jest.mock("got", () => {
    return {
        post: jest.fn()
    }
});

const GRAPHQL_ENDPOINT = "/graphql";

const TEST_USER = {
    EMAIL: "test@email.com",
    PASSWORD: "test1234"
};

describe("UserModule (e2e)", () => {
    let app: INestApplication;
    let jwtToken: string;
    let userRepository: Repository<User>;
    
    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [AppModule]
        }).compile();
        app = module.createNestApplication();
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
        await app.init();
    });
        
    afterAll(async () => {
        /* await getConnection().dropDatabase(); */
        app.close();
    });

    describe("createAccount", () => {
        it("should create account", () => {
            return request(app.getHttpServer())
                .post(GRAPHQL_ENDPOINT)
                .send({
                    query: `
                        mutation CreateAccount {
                            createAccount(input: {
                                email: "${TEST_USER.EMAIL}",
                                password: "${TEST_USER.PASSWORD}",
                                role: Owner
                            }) {
                                GraphQLSucceed
                                GraphQLError
                            }
                        }
                    `
                })
                .expect(200)
                .expect(res => {
                    expect(res.body.data.createAccount.GraphQLSucceed).toBe(true);
                    expect(res.body.data.createAccount.GraphQLError).toBe(null);
                });
        });

        it("should fail if account already exists", () => {
            return request(app.getHttpServer())
                .post(GRAPHQL_ENDPOINT)
                .send({
                    query: `
                        mutation CreateAccount {
                            createAccount(input: {
                                email: "${TEST_USER.EMAIL}",
                                password: "${TEST_USER.PASSWORD}",
                                role: Owner
                            }) {
                                GraphQLSucceed
                                GraphQLError
                            }
                        }
                    `
                })
                .expect(200)
                .expect(res => {
                    expect(res.body.data.createAccount.GraphQLSucceed).toBe(false);
                    expect(res.body.data.createAccount.GraphQLError).toBe("The username already exists");
                });
        });
    });

    describe("login", () => {
        it("should login with correct credentials", () => {
            return request(app.getHttpServer())
                .post(GRAPHQL_ENDPOINT)
                .send({
                    query: `
                        mutation Login {
                            login (input: {
                                email: "${TEST_USER.EMAIL}",
                                password: "${TEST_USER.PASSWORD}",
                            }) {
                                GraphQLSucceed
                                GraphQLError
                                loginToken
                            }
                        }
                    `
                })
                .expect(200)
                .expect(res => {
                    const {
                        body: {
                            data: { login }
                        }
                    } = res;
                    expect(login.GraphQLSucceed).toBe(true);
                    expect(login.GraphQLError).toBe(null);
                    expect(login.loginToken).toEqual(expect.any(String));
                    jwtToken = login.loginToken;
                });
        });

        it("should not be able to login with wrong credentials", () => {
            return request(app.getHttpServer())
                .post(GRAPHQL_ENDPOINT)
                .send({
                    query: `
                        mutation Login {
                            login (input: {
                                email: "${TEST_USER.EMAIL}",
                                password: "Wrong Password",
                            }) {
                                GraphQLSucceed
                                GraphQLError
                                loginToken
                            }
                        }
                    `
                })
                .expect(200)
                .expect(res => {
                    const {
                        body: {
                            data: { login }
                        }
                    } = res;
                    expect(login.GraphQLSucceed).toBe(false);
                    expect(login.GraphQLError).toBe("Wrong password");
                    expect(login.loginToken).toBe(null);
                });
        });
    });

    describe("userProfile", () => {
        let userId: number;

        beforeAll(async () => {
            const [user] = await userRepository.find();
            console.log("------ userProfile e2e Test ------ user:", user);
            userId = user.id;
            console.log("------ userProfile e2e Test ------ userId:", userId);
        });

        it("should see the profile", () => {
            return request(app.getHttpServer())
                .post(GRAPHQL_ENDPOINT)
                .set('X-JWT', jwtToken)
                .send({
                    query: `
                        query UserProfile {
                            userProfile (userId: ${userId}) {
                                GraphQLSucceed
                                GraphQLError
                                user {
                                    id
                                }
                            }
                        }
                    `
                })
                .expect(200)
                .expect(res => {
                    const {
                        body: {
                            data: {
                                userProfile: {
                                    GraphQLSucceed,
                                    GraphQLError,
                                    user: { id }
                                }
                            }
                        }
                    } = res;
                    expect(GraphQLSucceed).toBe(true);
                    expect(GraphQLError).toBe(null);
                    expect(id).toBe(userId);
                });
        });

        it("should not find the profile", () => {
            return request(app.getHttpServer())
                .post(GRAPHQL_ENDPOINT)
                .set('X-JWT', jwtToken)
                .send({
                    query: `
                        query UserProfile {
                            userProfile (userId: -1) {
                                GraphQLSucceed
                                GraphQLError
                                user {
                                    id
                                }
                            }
                        }
                    `
                })
                .expect(200)
                .expect(res => {
                    const {
                        body: {
                            data: {
                                userProfile: {
                                    GraphQLSucceed,
                                    GraphQLError,
                                    user
                                }
                            }
                        }
                    } = res;
                    expect(GraphQLSucceed).toBe(false);
                    expect(GraphQLError).toBe("Couldn't find the user");
                    expect(user).toBe(null);
                });
        });
    });

    it.todo("userProfile");
    it.todo("findMe");
    it.todo("verifyEmail");
    it.todo("editProfile");
});
