"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileUploader = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const cloudinary_1 = require("cloudinary");
const index_env_1 = require("../../config/index.env");
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path_1.default.join(process.cwd(), "/uploads"));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});
const upload = (0, multer_1.default)({ storage: storage });
const uploadToCloudinary = async (file) => {
    // Configuration
    cloudinary_1.v2.config({
        cloud_name: index_env_1.config.cloudinary.cloud_name,
        api_key: index_env_1.config.cloudinary.api_key,
        api_secret: index_env_1.config.cloudinary.cloud_secret
    });
    // Upload an image
    const uploadResult = await cloudinary_1.v2.uploader
        .upload(file.path, {
        public_id: file.filename,
    })
        .catch((error) => {
        console.log(error);
    });
    return uploadResult;
};
const uploadMMultipleFilesToCloudinary = async (files) => {
    cloudinary_1.v2.config({
        cloud_name: index_env_1.config.cloudinary.cloud_name,
        api_key: index_env_1.config.cloudinary.api_key,
        api_secret: index_env_1.config.cloudinary.cloud_secret
    });
    const uploadResults = [];
    for (const file of files) {
        try {
            const result = await cloudinary_1.v2.uploader.upload(file.path, {
                public_id: file.filename,
            });
            uploadResults.push(result.secure_url);
        }
        catch (error) {
            console.error("Cloudinary upload error:", error);
        }
    }
    return uploadResults;
};
exports.fileUploader = {
    upload,
    uploadToCloudinary,
    uploadMMultipleFilesToCloudinary
};
