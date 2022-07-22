import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "src/app.module";
import { getConnection, Repository } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "src/users/entities/users.entity";
import { Verification } from "src/users/entities/verification.entity";

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
    let verificationRepository: Repository<Verification>;

    const baseTest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
    const publicTest = (query: string) => baseTest().send({ query });
    const privateTest = (query: string) => baseTest().set("x-jwt", jwtToken).send({ query });
    
    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [AppModule]
        }).compile();
        app = module.createNestApplication();
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
        verificationRepository = module.get<Repository<Verification>>(getRepositoryToken(Verification));
        await app.init();
    });
        
    afterAll(async () => {
        /* await getConnection().dropDatabase(); */
        app.close();
    });

    describe("createAccount", () => {
        it("should create account", () => {
            return publicTest(`
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
                `)
                .expect(200)
                .expect(res => {
                    expect(res.body.data.createAccount.GraphQLSucceed).toBe(true);
                    expect(res.body.data.createAccount.GraphQLError).toBe(null);
                });
        });

        it("should fail if account already exists", () => {
            return publicTest(`
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
                `)
                .expect(200)
                .expect(res => {
                    expect(res.body.data.createAccount.GraphQLSucceed).toBe(false);
                    expect(res.body.data.createAccount.GraphQLError).toBe("The username already exists");
                });
        });
    });

    describe("login", () => {
        it("should login with correct credentials", () => {
            return publicTest(`
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
                `)
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
            return publicTest(`
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
                `)
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
            userId = user.id;
        });

        it("should see the profile", () => {
            return privateTest(`
                    query UserProfile {
                        userProfile (userId: ${userId}) {
                            GraphQLSucceed
                            GraphQLError
                            user {
                                id
                            }
                        }
                    }
                `)
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
            return privateTest(`
                    query UserProfile {
                        userProfile (userId: -1) {
                            GraphQLSucceed
                            GraphQLError
                            user {
                                id
                            }
                        }
                    }
                `)
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

    describe("findMe", () => {
        it("should find my profile", () => {
            return privateTest(`
                    query FindMe {
                        findMe {
                            email
                        }
                    }
                `)
                .expect(200)
                .expect(res => {
                    const {
                        body: {
                            data: {
                                findMe: { email }
                            }
                        }
                    } = res;
                    expect(email).toBe(TEST_USER.EMAIL);
                });
        });

        it("should not allow a logged out user", () => {
            return publicTest(`
                    query FindMe {
                        findMe {
                            email
                        }
                    }
                `)
                .expect(200)
                .expect(res => {
                    const {
                        body: {
                            errors
                        }
                    } = res;
                    const [error] = errors;
                    expect(error.message).toBe("Cannot destructure property 'user' of 'gqlContext.user' as it is undefined.");
                });
        });
    });

    describe("editProfile", () => {
        const NEW_EMAIL = "editProfile@email.com";

        it("should change mail", () => {
            return privateTest(`
                mutation EditProfile {
                    editProfile(input: {
                        email: "${NEW_EMAIL}"
                    }) {
                        GraphQLSucceed
                        GraphQLError
                    }
                }
            `)
            .expect(200)
            .expect(res => {
                const {
                    body: {
                        data: {
                            editProfile: { GraphQLSucceed, GraphQLError }
                        }
                    }
                } = res;
                expect(GraphQLSucceed).toBe(true);
                expect(GraphQLError).toBe(null);
            });
        });

        it("should have the new email", () => {
            return privateTest(`
                    query FindMe {
                        findMe {
                            email
                        }
                    }
                `)
                .expect(200)
                .expect(res => {
                    const {
                        body: {
                            data: {
                                findMe: { email }
                            }
                        }
                    } = res;
                    expect(email).toBe(NEW_EMAIL);
                });
        });
    });
    
    describe("verifyEmail", () => {
        let verificationCode: string;

        beforeAll(async () => {
            const [verification] = await verificationRepository.find();
            verificationCode = verification.code;
            console.log("------ verificationCode -------", verificationCode);
        });

        it("should verify email", () => {
            return publicTest(`
                    mutation VerifyEmail {
                        verifyEmail (input: {
                            code: "${verificationCode}"
                        }) {
                            GraphQLSucceed
                            GraphQLError
                        }
                    }
                `)
                .expect(200)
                .expect(res => {
                    const {
                        body: {
                            data: {
                                verifyEmail: {
                                    GraphQLSucceed,
                                    GraphQLError
                                }
                            }
                        }
                    } = res;
                    expect(GraphQLSucceed).toBe(true);
                    expect(GraphQLError).toBe(null);
                });
        });

        it("should fail when the verification code is not found", () => {
            return publicTest(`
                    mutation VerifyEmail {
                        verifyEmail (input: {
                            code: "testCode"
                        }) {
                            GraphQLSucceed
                            GraphQLError
                        }
                    }
                `)
                .expect(200)
                .expect(res => {
                    const {
                        body: {
                            data: {
                                verifyEmail: {
                                    GraphQLSucceed,
                                    GraphQLError
                                }
                            }
                        }
                    } = res;
                    expect(GraphQLSucceed).toBe(false);
                    expect(GraphQLError).toBe("Verification error");
                })
        });
    });
});
