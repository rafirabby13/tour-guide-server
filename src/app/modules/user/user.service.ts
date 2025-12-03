
import bcrypt from "bcryptjs";
import { TouristRegisterPayload } from "./user.interface";
import { prisma } from "../../shared/prisma";
import { Request } from "express";
import { fileUploader } from "../../helpers/fileUploader";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";
import { userSearchableFields } from "./user.constant";
import { Admin, Guide, Prisma, UserRole } from "../../../../prisma/generated/prisma/client";



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



const createAdmin = async (req: Request): Promise<Admin> => {

    const file = req.file;
    console.log({data: req.body})

    if (file) {
        const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
        console.log(uploadToCloudinary)
        req.body.profilePhoto = uploadToCloudinary?.secure_url
    }

    const hashedPassword: string = await bcrypt.hash(req.body.password, 10)

    const userData = {
        email: req.body.email,
        password: hashedPassword,
        role: UserRole.ADMIN
    }

    const result = await prisma.$transaction(async (transactionClient) => {
        const createdAdminUser = await transactionClient.user.create({
            data: userData
        });

        const createdAdminData = await transactionClient.admin.create({
            data: {
                contactNumber: req.body.contactNumber,
                name: req.body.name,
                userId: createdAdminUser.id,
                profilePhoto: req.body.profilePhoto
            }
        });

        return createdAdminData;
    });

    return result;
};

const createGuide = async (req: Request): Promise<Guide> => {

    const file = req.file;

    if (file) {
        const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
        req.body.profilePhoto = uploadToCloudinary?.secure_url
    }
    const hashedPassword: string = await bcrypt.hash(req.body.password, 10)

    const userData = {
        email: req.body.email,
        password: hashedPassword,
        role: UserRole.GUIDE
    }

    const result = await prisma.$transaction(async (transactionClient) => {
        await transactionClient.user.create({
            data: userData
        });

        const createdGuideData = await transactionClient.guide.create({
            data: req.body
        });

        return createdGuideData;
    });

    return result;
};


const getAllFromDB = async (params: any, options: IOptions) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options)
    const { searchTerm, ...filterData } = params;

    const andConditions: Prisma.UserWhereInput[] = [];

    if (searchTerm) {
        andConditions.push({
            OR: userSearchableFields.map(field => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive"
                }
            }))
        })
    }

    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map(key => ({
                [key]: {
                    equals: (filterData as any)[key]
                }
            }))
        })
    }

    const whereConditions: Prisma.UserWhereInput = andConditions.length > 0 ? {
        AND: andConditions
    } : {}

    const result = await prisma.user.findMany({
        skip,
        take: limit,

        where: whereConditions,
        orderBy: {
            [sortBy]: sortOrder
        }
    });

    const total = await prisma.user.count({
        where: whereConditions
    });
    return {
        meta: {
            page,
            limit,
            total
        },
        data: result
    };
}

export const UserServices = {
    createTourist,
    createAdmin,
    createGuide,
    getAllFromDB
}