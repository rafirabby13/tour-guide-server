"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedSuperAdmin = void 0;
const bcrypt = __importStar(require("bcryptjs"));
const prisma_1 = require("./prisma");
const index_env_1 = require("../../config/index.env");
const enums_1 = require("../../../prisma/generated/prisma/enums");
const superAdminCreds = {
    email: index_env_1.config.superAdmin.email,
    password: index_env_1.config.superAdmin.password,
    name: index_env_1.config.superAdmin.name,
    contactNo: index_env_1.config.superAdmin.contactNo
};
const seedSuperAdmin = async () => {
    try {
        // 1. Check if Super Admin already exists
        const isSuperAdminExists = await prisma_1.prisma.user.findUnique({
            where: {
                email: superAdminCreds.email,
            },
        });
        if (isSuperAdminExists) {
            console.log('⚠️ Super Admin already exists. Skipping...');
            return;
        }
        // 2. Hash Password
        const hashedPassword = await bcrypt.hash(superAdminCreds.password, 12);
        // 3. Create User and Admin Profile in a Transaction
        await prisma_1.prisma.$transaction(async (tx) => {
            // A. Create User Record
            const user = await tx.user.create({
                data: {
                    email: superAdminCreds.email,
                    password: hashedPassword,
                    role: enums_1.UserRole.ADMIN
                },
            });
            // B. Create Admin Profile Record
            await tx.admin.create({
                data: {
                    name: superAdminCreds.name,
                    profilePhoto: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
                    contactNumber: superAdminCreds.contactNo,
                    user: {
                        connect: {
                            id: user.id,
                        },
                    },
                },
            });
        });
        console.log('✅ Super Admin created successfully!');
    }
    catch (err) {
        console.error('❌ Error seeding Super Admin:', err);
    }
    finally {
        await prisma_1.prisma.$disconnect();
    }
};
exports.seedSuperAdmin = seedSuperAdmin;
