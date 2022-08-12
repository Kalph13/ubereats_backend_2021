import { Body, Controller, Post } from "@nestjs/common";

@Controller("payments")
export class PaymentController {
    @Post("")
    processPaddlePayment(@Body() body) {
        console.log("------ Payment Controller ------ body:", body);
        return {
            GraphQLSucceed: true
        };
    }
}
