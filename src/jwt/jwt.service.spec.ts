import { Test } from "@nestjs/testing";
import { CONFIG_OPTIONS } from "src/common/common.constants";
import { JwtService } from "./jwt.service";
import * as jwt from "jsonwebtoken";

const USER_ID = 1;
const TEST_KEY = "testKey";

jest.mock("jsonwebtoken", () => {
    return {
        sign: jest.fn(() => "TOKEN"),
        verify: jest.fn(() => ({ id: USER_ID }))
    };
});

describe("JwTService", () => {
    let jwtService: JwtService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                JwtService,
                {
                    provide: CONFIG_OPTIONS,
                    useValue: { privateKey: TEST_KEY }
                }
            ]
        }).compile();
        jwtService = module.get<JwtService>(JwtService);
    });

    it("should be define", () => {
        expect(jwtService).toBeDefined();
    });

    describe("sign", () => {
        it("should return a signed token", () => {
            const loginToken = jwtService.sign(USER_ID);
            expect(typeof loginToken).toBe("string");
            expect(jwt.sign).toHaveBeenCalledTimes(1);
            expect(jwt.sign).toHaveBeenCalledWith({ id: USER_ID }, TEST_KEY);
        });
    });

    describe("verify", () => {
        it("should return a decoded token", () => {
            const loginToken = "TOKEN";
            const decodedToken = jwtService.verify(loginToken);
            expect(decodedToken).toEqual({ id: USER_ID });
            expect(jwt.verify).toHaveBeenCalledTimes(1);
            expect(jwt.verify).toHaveBeenCalledWith(loginToken, TEST_KEY);
        });
    });
});
