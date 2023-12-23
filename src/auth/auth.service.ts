import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable({})
export class AuthService {
    constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService) { }

    async signup(dto: AuthDto) {
        // генерация хэша пароля
        const hash = await argon.hash(dto.password)
        // сохранение нового пользователя в базе данных
        try {
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash
                }
            })
            return this.signToken(user.id, user.email)
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ForbiddenException('Credentials taken')
                }
            }
            console.log(error)
            throw error;
        }
    }

    async signin(dto: AuthDto) {
        // находим пользователя по email
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            }
        })
        // если пользователя нет, выбрасываем исключение
        if (!user) throw new ForbiddenException('неверные учетные данные')
        // сравниваем пароли
        const pwMatches = await argon.verify(user.hash, dto.password)
        if (!pwMatches) throw new ForbiddenException('неверные учетные данные')
        // если пароли совпадают, возвращаем найденного пользователя
        return this.signToken(user.id, user.email)

    }

    async signToken(
        userId: number,
        email: string
    ): Promise<{ access_token: string}> {
        const payload = { sub: userId, email }

        const secret = this.config.get('JWT_SECRET')

        const token = await this.jwt.signAsync(payload, {
            expiresIn: '15m', secret
        })
        return {
            access_token: token
        }
    }
}