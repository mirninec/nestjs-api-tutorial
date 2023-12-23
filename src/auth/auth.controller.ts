import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto";

@Controller('auth')
export class AuthConroller {
    constructor(private authServece: AuthService) { }

    // @HttpCode(HttpStatus.OK)
    @Post('signup')
    signup(
        @Body() dto: AuthDto
    ) {
        return this.authServece.signup(dto)
    }

    @HttpCode(HttpStatus.OK)
    @Post('signin')
    signin(@Body() dto: AuthDto) {
        return this.authServece.signin(dto)
    }
}