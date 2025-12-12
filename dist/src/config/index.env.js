"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), '.env') });
exports.config = {
    node_env: process.env.NODE_ENV,
    port: process.env.PORT,
    database_url: process.env.DATABASE_URL,
    cloudinary: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        cloud_secret: process.env.CLOUDINARY_API_SECRET
    },
    stripe: {
        stripe_secret_key: process.env.STRIPE_SECRET_KEY,
        stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
        client_url: process.env.CLIENT_URL,
    },
    superAdmin: {
        email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@gmail.com',
        password: process.env.SUPER_ADMIN_PASSWORD || 'superadmin123',
        name: process.env.SUPER_ADMIN_NAME || 'Super Admin',
        contactNo: process.env.SUPER_ADMIN_CONTACT_NO || '+1234567890',
    },
    jwt_secret: process.env.JWT_SECRET,
    jwt_refresh_sercret: process.env.JWT_REFRESH_SECRET
};
