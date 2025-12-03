
import bcrypt from "bcryptjs";
import { TouristRegisterPayload } from "./user.interface";
import { prisma } from "../../shared/prisma";
import { Request } from "express";
import { fileUploader } from "../../helpers/fileUploader";



const createTourist = async (req: Request) => {
    if (req.file) {
        const uploadedResult = await fileUploader.uploadToCloudinary(req.file)
        console.log({uploadedResult})
        req.body.profilePhoto = uploadedResult?.secure_url
    }
    const payload = req.body

    console.log({payload})
    const hashedPassword = await bcrypt.hash(payload.password, 10)


    const result = await prisma.$transaction(async (tnx) => {
        const createdUser = await tnx.user.create({
            data: {
                email: payload.email,
                password: hashedPassword,
                role: payload.role

            }
        })
        await tnx.tourist.create({
            data: {
                userId: createdUser.id,
                name: payload.email,
                contactNumber: payload.contactNumber,
                gender: payload.gender,
                category: payload.category,
                languages: payload.languages,
                profilePhoto: req.body.profilePhoto


            }
        })

    })

    // return {}
    return result
}


export const UseServices = {
    createTourist
}