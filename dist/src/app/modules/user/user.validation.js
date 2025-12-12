"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidation = exports.CreateTouristSchema = exports.CreateGuideSchema = exports.GuideSchema = exports.CreateAdminSchema = exports.AdminSchema = exports.TouristSchema = exports.UserBaseSchema = exports.ExperienceLevelEnum = exports.GenderEnum = exports.UserStatusEnum = exports.UserRoleEnum = void 0;
const zod_1 = require("zod");
const enums_1 = require("../../../../prisma/generated/prisma/enums");
exports.UserRoleEnum = zod_1.z.enum(["TOURIST", "GUIDE", "ADMIN"]);
exports.UserStatusEnum = zod_1.z.enum(["ACTIVE", "INACTIVE", "DELETED"]);
exports.GenderEnum = zod_1.z.enum(["MALE", "FEMALE"]);
exports.ExperienceLevelEnum = zod_1.z.enum(["BEGINNER", "INTERMEDIATE", "EXPERT"]);
exports.UserBaseSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z
        .string()
        .min(6),
    role: exports.UserRoleEnum,
});
exports.TouristSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    contactNumber: zod_1.z
        .string()
        .regex(/^\+?[0-9]+$/, "Invalid phone number"),
    profilePhoto: zod_1.z.string().url().optional(),
    category: zod_1.z.array(zod_1.z.string()).nonempty(),
    languages: zod_1.z.array(zod_1.z.string()).nonempty(),
    gender: exports.GenderEnum,
});
exports.AdminSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    contactNumber: zod_1.z
        .string()
        .regex(/^\+?[0-9]+$/),
    profilePhoto: zod_1.z.string().url().optional(),
});
exports.CreateAdminSchema = exports.UserBaseSchema.extend({
    role: zod_1.z.literal("ADMIN"),
}).extend(exports.AdminSchema.shape);
exports.GuideSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    contactNumber: zod_1.z
        .string()
        .regex(/^\+?[0-9]+$/),
    bio: zod_1.z.string().max(2000).optional(),
    profilePhoto: zod_1.z.string().url().optional(),
    experience: zod_1.z.number().int().min(0),
    experienceLevel: exports.ExperienceLevelEnum,
    languages: zod_1.z.array(zod_1.z.string()).nonempty(),
    category: zod_1.z.array(zod_1.z.string()).nonempty(),
    country: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    gender: exports.GenderEnum,
    isAvailable: zod_1.z.boolean().default(true),
});
exports.CreateGuideSchema = zod_1.z.object({
    email: zod_1.z.email(),
    password: zod_1.z.string().min(6)
});
exports.CreateTouristSchema = exports.UserBaseSchema.extend({
    role: zod_1.z.literal("TOURIST"), // force tourist role
}).extend(exports.TouristSchema.shape);
const updateProfileSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address").optional(),
    name: zod_1.z.string().min(1).optional(),
    contactNumber: zod_1.z.string().min(10).optional(),
    gender: zod_1.z.nativeEnum(enums_1.Gender).optional(),
    bio: zod_1.z.string().optional(),
    category: zod_1.z.array(zod_1.z.string()).optional(),
    city: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    experienceLevel: zod_1.z.string().optional(),
    experience: zod_1.z.number().optional(),
    languages: zod_1.z.array(zod_1.z.string()).optional(),
    isAvailable: zod_1.z.boolean().optional()
});
const changePasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        oldPassword: zod_1.z.string().min(1, "Old password is required"),
        newPassword: zod_1.z.string().min(6, "New password must be at least 6 characters")
    })
});
const updateUserRoleSchema = zod_1.z.object({
    body: zod_1.z.object({
        role: zod_1.z.nativeEnum(enums_1.UserRole)
    })
});
exports.UserValidation = {
    updateProfileSchema,
    changePasswordSchema,
    updateUserRoleSchema
};
