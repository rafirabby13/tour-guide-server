
import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { prisma } from "../../shared/prisma";
import { Request } from "express";
import { fileUploader } from "../../helpers/fileUploader";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";
import { userSearchableFields } from "./user.constant";
import { Admin, Guide, Prisma, UserRole, UserStatus } from "../../../../prisma/generated/prisma/client";
import { AppError } from "../../errors/AppError";



const createTourist = async (req: Request) => {
    if (req.file) {
        const uploadedResult = await fileUploader.uploadToCloudinary(req.file)
        console.log({ uploadedResult })
        req.body.profilePhoto = uploadedResult?.secure_url
    }
    const payload = req.body

    console.log({ payload })
    const hashedPassword = await bcrypt.hash(payload.password, 10)
    const languages =
        Array.isArray(payload.languages)
            ? payload.languages
            : payload.languages
                ? [payload.languages]
                : [];

    const result = await prisma.$transaction(async (tnx) => {
        const createdUser = await tnx.user.create({
            data: {
                email: payload.email,
                password: hashedPassword,
                role: payload.role

            }
        })
        const createdTourist = await tnx.tourist.create({
            data: {
                userId: createdUser.id,
                name: payload.name,
                contactNumber: payload.contactNumber,
                gender: payload.gender,
                category: payload.category,
                languages,
                profilePhoto: req.body.profilePhoto


            }
        })
        return {
            user: createdUser,
            tourist: createdTourist,
        };

    })

    // return {}
    return result
}



const createAdmin = async (req: Request): Promise<Admin> => {

    const file = req.file;
    console.log({ data: req.body })

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

// const createGuide = async (req: Request): Promise<Guide> => {

//     const file = req.file;

//     if (file) {
//         const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
//         console.log(uploadToCloudinary)
//         req.body.profilePhoto = uploadToCloudinary?.secure_url
//     }
//     const hashedPassword: string = await bcrypt.hash(req.body.password, 10)

//     const userData = {
//         email: req.body.email,
//         password: hashedPassword,
//         role: UserRole.GUIDE
//     }

//     const result = await prisma.$transaction(async (transactionClient) => {
//         const createdGuideUser = await transactionClient.user.create({
//             data: userData
//         });

//         const createdGuideData = await transactionClient.guide.create({
//             data: {
//                 userId: createdGuideUser.id,
//                 contactNumber: req.body.contactNumber,
//                 name: req.body.name,
//                 gender: req.body.gender,
//                 bio: req.body.bio,
//                 category: req.body.category,
//                 city: req.body.city,
//                 country: req.body.country,
//                 experienceLevel: req.body.experienceLevel,
//                 isAvailable: req.body.isAvailable,
//                 profilePhoto: req.body.profilePhoto,
//                 experience: req.body.experience,
//                 languages: req.body.languages
//             }
//         });

//         return createdGuideData;
//     });

//     return result;
// };

const createGuide = async (payload: { email: string, password: string }) => {
    console.log({ payload })

    // const file = req.file;

    // if (file) {
    //     const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    //     console.log(uploadToCloudinary)
    //     req.body.profilePhoto = uploadToCloudinary?.secure_url
    // }
    const hashedPassword: string = await bcrypt.hash(payload.password, 10)

    const userData = {
        email: payload.email,
        password: hashedPassword,
        role: UserRole.GUIDE
    }

    const result = await prisma.$transaction(async (transactionClient) => {
        const createdGuideUser = await transactionClient.user.create({
            data: userData
        });

        const createdGuideData = await transactionClient.guide.create({
            data: {
                userId: createdGuideUser.id
            }
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

    // if (Object.keys(filterData).length > 0) {
    //     andConditions.push({
    //         AND: Object.keys(filterData).map(key => ({

    //             [key]: {
    //                 equals: (filterData as any)[key]
    //             }
    //         }))
    //     })
    // }
    if (Object.keys(filterData).length > 0) {
  const formattedFilters = Object.keys(filterData).map((key) => {
    let value = filterData[key];

    // Convert boolean strings
    if (value === "true") value = true;
    if (value === "false") value = false;

    // Convert numeric strings
    if (!isNaN(value) && value !== "" && typeof value === "string") {
      value = Number(value);
    }

    return {
      [key]: { equals: value },
    };
  });

  andConditions.push({ AND: formattedFilters });
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

const getUserProfile = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            tourist: {
                select: {
                    id: true,
                    name: true,
                    contactNumber: true,
                    gender: true,
                    category: true,
                    languages: true,
                    profilePhoto: true
                }
            },
            guide: {
                select: {
                    id: true,
                    name: true,
                    contactNumber: true,
                    gender: true,
                    bio: true,
                    category: true,
                    city: true,
                    country: true,
                    experienceLevel: true,
                    experience: true,
                    languages: true,
                    profilePhoto: true,
                    isAvailable: true,
                    rating: true,
                    totalReviews: true
                }
            },
            admin: {
                select: {
                    id: true,
                    name: true,
                    contactNumber: true,
                    profilePhoto: true
                }
            }
        }
    });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    return user;
};


// ✅ NEW: Update user profile
const updateMyProfile = async (userId: string, req: Request) => {
    // Check if user exists
    console.log(req.body)
    const existingUser = await prisma.user.findUnique({
        where: {
            id: userId
        },
        include: {
            tourist: true,
            guide: true,
            admin: true
        }
    });

    if (!existingUser) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    // Handle file upload
    if (req.file) {
        const uploadedResult = await fileUploader.uploadToCloudinary(req.file);
        req.body.profilePhoto = uploadedResult?.secure_url;
    }

    const payload = req.body;

    // Update based on user role
    const result = await prisma.$transaction(async (tnx) => {
        // Update User table (email, password if provided)
        const userUpdateData: any = {};

        if (payload.email) {
            userUpdateData.email = payload.email;
        }

        if (payload.password) {
            userUpdateData.password = await bcrypt.hash(payload.password, 10);
        }

        if (Object.keys(userUpdateData).length > 0) {
            await tnx.user.update({
                where: { id: userId },
                data: userUpdateData
            });
        }

        // Update role-specific data
        if (existingUser.role === UserRole.TOURIST && existingUser.tourist) {
            const touristUpdateData: any = {};

            if (payload.name) touristUpdateData.name = payload.name;
            if (payload.contactNumber) touristUpdateData.contactNumber = payload.contactNumber;
            if (payload.gender) touristUpdateData.gender = payload.gender;
            if (payload.category) touristUpdateData.category = payload.category;
            if (payload.languages) touristUpdateData.languages = payload.languages;
            if (payload.profilePhoto) touristUpdateData.profilePhoto = payload.profilePhoto;

            await tnx.tourist.update({
                where: { userId: userId },
                data: touristUpdateData
            });
        }

        if (existingUser.role === UserRole.GUIDE && existingUser.guide) {
            const guideUpdateData: any = {};

            if (payload.name) guideUpdateData.name = payload.name;
            if (payload.contactNumber) guideUpdateData.contactNumber = payload.contactNumber;
            if (payload.gender) guideUpdateData.gender = payload.gender;
            if (payload.bio) guideUpdateData.bio = payload.bio;
            if (payload.category) guideUpdateData.category = payload.category;
            if (payload.city) guideUpdateData.city = payload.city;
            if (payload.country) guideUpdateData.country = payload.country;
            if (payload.experienceLevel) guideUpdateData.experienceLevel = payload.experienceLevel;
            if (payload.experience) guideUpdateData.experience = payload.experience;
            if (payload.languages) guideUpdateData.languages = payload.languages;
            if (payload.profilePhoto) guideUpdateData.profilePhoto = payload.profilePhoto;
            if (payload.isAvailable !== undefined) guideUpdateData.isAvailable = payload.isAvailable;

            await tnx.guide.update({
                where: { userId: userId },
                data: guideUpdateData
            });
        }

        if (existingUser.role === UserRole.ADMIN && existingUser.admin) {
            const adminUpdateData: any = {};

            if (payload.name) adminUpdateData.name = payload.name;
            if (payload.contactNumber) adminUpdateData.contactNumber = payload.contactNumber;
            if (payload.profilePhoto) adminUpdateData.profilePhoto = payload.profilePhoto;

            await tnx.admin.update({
                where: { userId: userId },
                data: adminUpdateData
            });
        }

        // Fetch updated user
        return await tnx.user.findUnique({
            where: { id: userId },
            include: {
                tourist: true,
                guide: true,
                admin: true
            }
        });
    });

    return result;
};


// ✅ NEW: Soft delete user (Admin only)
const deleteUser = async (userId: string) => {
    console.log(userId)
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });
    console.log({ user })

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    // if (user.isDeleted) {
    //     throw new AppError(httpStatus.BAD_REQUEST, "User already deleted");
    // }

    const result = await prisma.user.update({
        where: { id: userId },
        data: {
            isDeleted: true
        }
    });

    return result;
};


// ✅ NEW: Change password
const changePassword = async (userId: string, oldPassword: string, newPassword: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    // Verify old password
    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordCorrect) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Old password is incorrect");
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
        where: { id: userId },
        data: {
            password: hashedNewPassword
        }
    });

    return { message: "Password changed successfully" };
};


// ✅ NEW: Get user by email (for login/validation)
const getUserByEmail = async (email: string) => {
    const user = await prisma.user.findUnique({
        where: {
            email
        },
        include: {
            tourist: true,
            guide: true,
            admin: true
        }
    });

    return user;
};


// ✅ NEW: Update user role (Admin only)
const updateUserRole = async (userId: string, newRole: UserRole) => {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    const result = await prisma.user.update({
        where: { id: userId },
        data: {
            role: newRole
        }
    });

    return result;
};


// ✅ NEW: Suspend/Activate user (Admin only)
const UpdateUserStatus = async (userId: string, userStatus: UserStatus) => {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    const result = await prisma.user.update({
        where: { id: userId },
        data: {
            status: userStatus
        }
    });

    return result;
};
export const UserServices = {
    createTourist,
    createAdmin,
    createGuide,
    getAllFromDB,
    getUserProfile,
    updateMyProfile,
    deleteUser,
    changePassword,
    getUserByEmail,
    updateUserRole,
    UpdateUserStatus
}