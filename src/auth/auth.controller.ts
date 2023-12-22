import { Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller('auth')
export class AuthConroller{
    constructor(private authServece: AuthService) {}
    
    @Post('signup')
    signup() {
        return this.authServece.signup()
    }
    
    @Post('signin')
    signin() {
        return this.authServece.signin()
    }
}