import { Test } from "@nestjs/testing";
import { CONFIG_OPTIONS } from "src/common/common.constants";
import { MailService } from "./mail.service";
import got from "got";
import * as FormData from "form-data";

jest.mock("got");
jest.mock("form-data");

const TEST_DOMAIN = "testDomain"

describe("MailService", () => {
    let mailService: MailService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                MailService,
                {
                    provide: CONFIG_OPTIONS,
                    useValue: {
                        apiKey: "testAPIKey",
                        domain: TEST_DOMAIN,
                        fromEmail: "testFromEmail"
                    }
                }
            ]
        }).compile();
        mailService = module.get<MailService>(MailService);
    });

    it("should be defined", () => {
        expect(mailService).toBeDefined();
    });

    describe("sendVerificationEmail", () => {
        it("should call sendEmail", () => {
            const sendVerificationEmailArgs = {
                email: "test@email.com",
                code: "testCode"
            };
            jest.spyOn(mailService, "sendEmail").mockImplementation(async () => true);
            mailService.sendVerificationEmail(sendVerificationEmailArgs.email, sendVerificationEmailArgs.code);
            expect(mailService.sendEmail).toHaveBeenCalledTimes(1);
            expect(mailService.sendEmail).toHaveBeenCalledWith(
                "Verify Your Email",
                "verify-email",
                [
                    { key: "code", value: sendVerificationEmailArgs.code },
                    { key: "username", value: sendVerificationEmailArgs.email }
                ]
            );
        });
    });

    describe("sendEmail", () => {
        it("sends email", async () => {
            const result = await mailService.sendEmail("", "", []);
            const formSpy = jest.spyOn(FormData.prototype, "append");
            expect(formSpy).toHaveBeenCalled();
            expect(got.post).toHaveBeenCalledTimes(1);
            expect(got.post).toHaveBeenCalledWith(
                `https://api.mailgun.net/v3/${TEST_DOMAIN}/messages`,
                expect.any(Object)
            );
            expect(result).toEqual(true);
        });
        it("fails on error", async () => {
            jest.spyOn(got, "post").mockImplementation(() => {
                throw new Error();
            });
            const result = await mailService.sendEmail("", "", []);
            expect(result).toEqual(false);
        });
    });
});
