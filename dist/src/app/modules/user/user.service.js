"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserServices = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const http_status_1 = __importDefault(require("http-status"));
const prisma_1 = require("../../shared/prisma");
const fileUploader_1 = require("../../helpers/fileUploader");
const paginationHelper_1 = require("../../helpers/paginationHelper");
const user_constant_1 = require("./user.constant");
const client_1 = require("../../../../prisma/generated/prisma/client");
const AppError_1 = require("../../errors/AppError");
const createTourist = async (req) => {
    if (req.file) {
        const uploadedResult = await fileUploader_1.fileUploader.uploadToCloudinary(req.file);
        console.log({ uploadedResult });
        req.body.profilePhoto = uploadedResult?.secure_url;
    }
    const payload = req.body;
    console.log({ payload });
    const hashedPassword = await bcryptjs_1.default.hash(payload.password, 10);
    const languages = Array.isArray(payload.languages)
        ? payload.languages
        : payload.languages
            ? [payload.languages]
            : [];
    const result = await prisma_1.prisma.$transaction(async (tnx) => {
        const createdUser = await tnx.user.create({
            data: {
                email: payload.email,
                password: hashedPassword,
                role: payload.role
            }
        });
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
        });
        return {
            user: createdUser,
            tourist: createdTourist,
        };
    });
    // return {}
    return result;
};
const createAdmin = async (payload) => {
    // const file = req.file;
    // console.log({ data: req.body })
    // if (file) {
    //     const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    //     console.log(uploadToCloudinary)
    //     req.body.profilePhoto = uploadToCloudinary?.secure_url
    // }
    const hashedPassword = await bcryptjs_1.default.hash(payload.password, 10);
    const userData = {
        email: payload.email,
        password: hashedPassword,
        role: client_1.UserRole.ADMIN
    };
    const result = await prisma_1.prisma.$transaction(async (transactionClient) => {
        const createdAdminUser = await transactionClient.user.create({
            data: userData
        });
        const createdAdminData = await transactionClient.admin.create({
            data: {
                userId: createdAdminUser.id
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
const createGuide = async (payload) => {
    console.log({ payload });
    const hashedPassword = await bcryptjs_1.default.hash(payload.password, 10);
    const userData = {
        email: payload.email,
        password: hashedPassword,
        role: client_1.UserRole.GUIDE
    };
    const result = await prisma_1.prisma.$transaction(async (transactionClient) => {
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
const getAllFromDB = async (params, options) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const { searchTerm, ...filterData } = params;
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: user_constant_1.userSearchableFields.map(field => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive"
                }
            }))
        });
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
            if (value === "true")
                value = true;
            if (value === "false")
                value = false;
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
    const whereConditions = andConditions.length > 0 ? {
        AND: andConditions
    } : {};
    const result = await prisma_1.prisma.user.findMany({
        skip,
        take: limit,
        where: whereConditions,
        orderBy: {
            [sortBy]: sortOrder
        }
    });
    const total = await prisma_1.prisma.user.count({
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
};
const getUserProfile = async (userId) => {
    const user = await prisma_1.prisma.user.findUnique({
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
                    totalReviews: true,
                    isVerified: true
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
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, "User not found");
    }
    return user;
};
// ✅ NEW: Update user profile
const updateMyProfile = async (userId, req) => {
    // Check if user exists
    console.log(req.body);
    const existingUser = await prisma_1.prisma.user.findUnique({
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
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, "User not found");
    }
    // Handle file upload
    if (req.file) {
        const uploadedResult = await fileUploader_1.fileUploader.uploadToCloudinary(req.file);
        req.body.profilePhoto = uploadedResult?.secure_url;
    }
    const payload = req.body;
    // Update based on user role
    const result = await prisma_1.prisma.$transaction(async (tnx) => {
        // Update User table (email, password if provided)
        const userUpdateData = {};
        if (payload.email) {
            userUpdateData.email = payload.email;
        }
        if (payload.password) {
            userUpdateData.password = await bcryptjs_1.default.hash(payload.password, 10);
        }
        if (Object.keys(userUpdateData).length > 0) {
            await tnx.user.update({
                where: { id: userId },
                data: userUpdateData
            });
        }
        // Update role-specific data
        if (existingUser.role === client_1.UserRole.TOURIST && existingUser.tourist) {
            const touristUpdateData = {};
            if (payload.name)
                touristUpdateData.name = payload.name;
            if (payload.contactNumber)
                touristUpdateData.contactNumber = payload.contactNumber;
            if (payload.gender)
                touristUpdateData.gender = payload.gender;
            if (payload.category)
                touristUpdateData.category = payload.category;
            if (payload.languages)
                touristUpdateData.languages = payload.languages;
            if (payload.profilePhoto)
                touristUpdateData.profilePhoto = payload.profilePhoto;
            await tnx.tourist.update({
                where: { userId: userId },
                data: touristUpdateData
            });
        }
        if (existingUser.role === client_1.UserRole.GUIDE && existingUser.guide) {
            const guideUpdateData = {};
            if (payload.name)
                guideUpdateData.name = payload.name;
            if (payload.contactNumber)
                guideUpdateData.contactNumber = payload.contactNumber;
            if (payload.gender)
                guideUpdateData.gender = payload.gender;
            if (payload.bio)
                guideUpdateData.bio = payload.bio;
            if (payload.category)
                guideUpdateData.category = payload.category;
            if (payload.city)
                guideUpdateData.city = payload.city;
            if (payload.country)
                guideUpdateData.country = payload.country;
            if (payload.experienceLevel)
                guideUpdateData.experienceLevel = payload.experienceLevel;
            if (payload.experience)
                guideUpdateData.experience = payload.experience;
            if (payload.languages)
                guideUpdateData.languages = payload.languages;
            if (payload.profilePhoto)
                guideUpdateData.profilePhoto = payload.profilePhoto;
            if (payload.isAvailable !== undefined)
                guideUpdateData.isAvailable = payload.isAvailable;
            await tnx.guide.update({
                where: { userId: userId },
                data: guideUpdateData
            });
        }
        if (existingUser.role === client_1.UserRole.ADMIN && existingUser.admin) {
            const adminUpdateData = {};
            if (payload.name)
                adminUpdateData.name = payload.name;
            if (payload.contactNumber)
                adminUpdateData.contactNumber = payload.contactNumber;
            if (payload.profilePhoto)
                adminUpdateData.profilePhoto = payload.profilePhoto;
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
const deleteUser = async (userId) => {
    console.log(userId);
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId }
    });
    console.log({ user });
    if (!user) {
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, "User not found");
    }
    // if (user.isDeleted) {
    //     throw new AppError(httpStatus.BAD_REQUEST, "User already deleted");
    // }
    const result = await prisma_1.prisma.user.update({
        where: { id: userId },
        data: {
            isDeleted: true
        }
    });
    return result;
};
// ✅ NEW: Change password
const changePassword = async (userId, oldPassword, newPassword) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: {
            id: userId
        }
    });
    if (!user) {
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, "User not found");
    }
    // Verify old password
    const isPasswordCorrect = await bcryptjs_1.default.compare(oldPassword, user.password);
    if (!isPasswordCorrect) {
        throw new AppError_1.AppError(http_status_1.default.UNAUTHORIZED, "Old password is incorrect");
    }
    // Hash new password
    const hashedNewPassword = await bcryptjs_1.default.hash(newPassword, 10);
    // Update password
    await prisma_1.prisma.user.update({
        where: { id: userId },
        data: {
            password: hashedNewPassword
        }
    });
    return { message: "Password changed successfully" };
};
// ✅ NEW: Get user by email (for login/validation)
const getUserByEmail = async (email) => {
    const user = await prisma_1.prisma.user.findUnique({
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
const updateUserRole = async (userId, newRole) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId }
    });
    if (!user) {
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, "User not found");
    }
    const result = await prisma_1.prisma.user.update({
        where: { id: userId },
        data: {
            role: newRole
        }
    });
    return result;
};
// ✅ NEW: Suspend/Activate user (Admin only)
const UpdateUserStatus = async (userId, userStatus) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId }
    });
    if (!user) {
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, "User not found");
    }
    const result = await prisma_1.prisma.user.update({
        where: { id: userId },
        data: {
            status: userStatus
        }
    });
    return result;
};
const getTopGuides = async () => {
    const guides = await prisma_1.prisma.guide.findMany({
        take: 4,
        orderBy: {
            // Assuming you might have a calculated rating field, 
            // or we sort by created date for now if rating isn't cached
            totalReviews: "desc"
        },
        include: {
            _count: {
                select: { reviews: true }
            }
        }
    });
    return guides;
};
const becomeAGuide = async (userId, payload) => {
    const { bio, experience, country, city, contactNo } = payload;
    // 1. Check if user exists
    const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user)
        throw new AppError_1.AppError(404, "User not found");
    // 2. Check if already a guide
    if (user.role === client_1.UserRole.GUIDE) {
        throw new AppError_1.AppError(http_status_1.default.BAD_REQUEST, "You are already a guide!");
    }
    const existingGuide = await prisma_1.prisma.guide.findUnique({
        where: { userId: userId }
    });
    if (existingGuide) {
        if (existingGuide.isVerified) {
            throw new AppError_1.AppError(http_status_1.default.BAD_REQUEST, "You are already a verified guide!");
        }
        else {
            throw new AppError_1.AppError(http_status_1.default.CONFLICT, "You have already submitted an application. Please wait for admin approval.");
        }
    }
    const newApplication = await prisma_1.prisma.guide.create({
        data: {
            userId: userId,
            name: user.email.split('@')[0], // Default name or from payload
            bio: bio,
            experience: Number(experience), // Ensure int
            country,
            city,
            contactNumber: contactNo,
            isAvailable: true,
            isVerified: false
        }
    });
    return newApplication;
};
const getAllGuides = async (userId) => {
    if (!userId) {
        throw new AppError_1.AppError(404, "user not found");
    }
    const guides = await prisma_1.prisma.guide.findMany({
        where: {
            isVerified: false
        }
    });
    return guides;
};
exports.UserServices = {
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
    UpdateUserStatus,
    getTopGuides,
    becomeAGuide,
    getAllGuides
};
