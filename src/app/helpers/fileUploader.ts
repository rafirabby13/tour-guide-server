import multer from 'multer';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { config } from '../../config/index.env';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(process.cwd(), "/uploads"))
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})

const upload = multer({ storage: storage })

const uploadToCloudinary = async (file: Express.Multer.File) => {
    // Configuration
    cloudinary.config({
        cloud_name: config.cloudinary.cloud_name,
        api_key: config.cloudinary.api_key,
        api_secret: config.cloudinary.cloud_secret
    });

    // Upload an image
    const uploadResult = await cloudinary.uploader
        .upload(
            file.path, {
            public_id: file.filename,
        }
        )
        .catch((error) => {
            console.log(error);
        });
    return uploadResult;

}


const uploadMMultipleFilesToCloudinary = async (files: Express.Multer.File[]) => {
    cloudinary.config({
        cloud_name: config.cloudinary.cloud_name,
        api_key: config.cloudinary.api_key,
        api_secret: config.cloudinary.cloud_secret
    });
    const uploadResults = [];
    for (const file of files) {
        try {
            const result = await cloudinary.uploader.upload(file.path, {
                public_id: file.filename,
            });
            uploadResults.push(result.secure_url);
        } catch (error) {
            console.error("Cloudinary upload error:", error);
        }
    }

    return uploadResults;

}

export const fileUploader = {
    upload,
    uploadToCloudinary,
    uploadMMultipleFilesToCloudinary
}
