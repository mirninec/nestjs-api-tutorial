import { Module } from "@nestjs/common";
import { AuthConroller } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
    controllers: [AuthConroller],
    providers: [AuthService]
})
export class AuthModule {}