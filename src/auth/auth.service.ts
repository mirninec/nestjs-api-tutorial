import { Injectable } from "@nestjs/common";
import { User, Bookmark } from "@prisma/client";

@Injectable({})
export class AuthService{
    signup() {
         return { msg: 'Я вошел в систему signup' }
    }

    signin() {
        return { msg: 'Я вошел в систему signin' }
    }
}
