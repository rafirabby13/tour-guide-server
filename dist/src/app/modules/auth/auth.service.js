import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import { UserStatus } from "../../../../prisma/generated/prisma/enums";
import { jwtHelper } from "../../helpers/jwtHelper";
const login = async (payload) => {
    console.log({ payload });
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            email: payload.email,
            status: UserStatus.ACTIVE
        }
    });
    const isCorrectPassword = await bcrypt.compare(payload.password, user.password);
    if (!isCorrectPassword) {
        throw new Error("Password is incorrect!");
    }
    const accessToken = jwtHelper.generateToken({ email: user.email, role: user.role, id: user.id }, "abcd", "1h");
    const refreshToken = jwtHelper.generateToken({ email: user.email, role: user.role, id: user.id }, "abcdefgh", "90d");
    return {
        accessToken,
        refreshToken,
        needPasswordChange: user.needPasswordChange
    };
};
export const AuthService = {
    login
};
