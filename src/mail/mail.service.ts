import { Inject, Injectable } from "@nestjs/common";
import { CONFIG_OPTIONS } from "src/common/common.constants";
import { MailModuleOptions, EmailVar } from "./mail.interfaces";

/* got (Replaces fetch): https://www.npmjs.com/package/got */
/* - Requires v11 to Support CommonJS Export */
import got from "got";

/* form-data: https://www.npmjs.com/package/form-data */
import * as FormData from "form-data";

@Injectable()
export class MailService {
    constructor(
        @Inject(CONFIG_OPTIONS)
        private readonly options: MailModuleOptions
    ) {}
    
    private async sendEmail(subject: string, template: string, emailVars: EmailVar[]) {
        const form = new FormData();
        form.append('from', `Admin from Uber Eats <${this.options.fromEmail}>`); 
        form.append('to', `${process.env.MAILGUN_RECIPIENT}`); /* Should Be Registered as a Authorized Recipients */
        form.append('subject', subject);
        form.append('template', template);
        emailVars.forEach(aVar => form.append(`v:${aVar.key}`, aVar.value));

        try {
            await got(
                `https://api.mailgun.net/v3/${this.options.domain}/messages`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Basic ${Buffer.from(`api:${this.options.apiKey}`).toString('base64')}`
                    },
                    body: form
                }
            );
        } catch (e) {
            console.log(e);
        }
    }

    sendVerificationEmail(email: string, code: string) {
        this.sendEmail('Verify Your Email', 'verify-email', [
            { key: 'code', value: code },
            { key: 'username', value: email}
        ])
    }
}
