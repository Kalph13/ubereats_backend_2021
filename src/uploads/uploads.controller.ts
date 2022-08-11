import { Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { FileInterceptor } from "@nestjs/platform-express";
import * as AWS from "aws-sdk"

@Controller("uploads")
export class UploadsController {
    constructor(private readonly configService: ConfigService) {}

    @Post("")
    @UseInterceptors(FileInterceptor("file"))
    async uploadFile(@UploadedFile() file) {
        const AWS_BUCKET = this.configService.get("AWS_BUCKET");

        AWS.config.update({
            credentials: {
                accessKeyId: this.configService.get("AWS_KEY"),
                secretAccessKey: this.configService.get("AWS_SECRET")
            }
        });

        try {
            const objectName = `${Date.now() + file.originalname}`;
            
            await new AWS.S3().putObject({
                Body: file.buffer,
                Bucket: AWS_BUCKET,
                Key: objectName,
                ACL: "public-read"
            }).promise();

            const url = `https://${AWS_BUCKET}.s3.amazonaws.com/${objectName}`;
            return { url };
        } catch (e) {
            console.log("------ Uploads Controller ------ error:", e);
            return null;
        }
    }
}
