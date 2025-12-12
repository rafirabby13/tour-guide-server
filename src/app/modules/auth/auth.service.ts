
import { prisma } from "../../shared/prisma"
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
import { UserStatus } from "../../../../prisma/generated/prisma/enums";
import { jwtHelper } from "../../helpers/jwtHelper";
import { config } from "../../../config/index.env";

const login = async (payload: { email: string, password: string }) => {
    console.log({payload})
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            email: payload.email,
            status: UserStatus.ACTIVE
        },
        include:{
            guide: true
        }
    })
console.log({user})
    const isCorrectPassword = await bcrypt.compare(payload.password, user.password);
    if (!isCorrectPassword) {
        throw new Error("Password is incorrect!")
    }

    const accessToken = jwtHelper.generateToken({ email: user.email, role: user.role, id: user.id }, config.jwt_secret as string, "10h");

    const refreshToken = jwtHelper.generateToken({ email: user.email, role: user.role,id: user.id  }, config.jwt_refresh_sercret as string, "90d");

    return {
        accessToken,
        refreshToken,
        needPasswordChange: user.needPasswordChange,
         isVerifiedGuide: user.guide ? user.guide.isVerified : false,
    }
}

export const AuthService = {
    login
}