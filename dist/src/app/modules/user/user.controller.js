"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const catchAsync_1 = __importDefault(require("../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../shared/sendResponse"));
const user_service_1 = require("./user.service");
const user_constant_1 = require("./user.constant");
const pick_1 = __importDefault(require("../../helpers/pick"));
const http_status_1 = __importDefault(require("http-status"));
const createTourist = (0, catchAsync_1.default)(async (req, res, next) => {
    // console.log({req})
    const result = await user_service_1.UserServices.createTourist(req);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Tourist is created successsfully....",
        // data: {}
        data: result
    });
});
const createAdmin = (0, catchAsync_1.default)(async (req, res) => {
    const result = await user_service_1.UserServices.createAdmin(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Admin Created successfuly!",
        data: result
    });
});
const createGuide = (0, catchAsync_1.default)(async (req, res) => {
    // console.log(req.body)
    const result = await user_service_1.UserServices.createGuide(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Guide Created successfuly!",
        // data: {}
        data: result
    });
});
const getAllFromDB = (0, catchAsync_1.default)(async (req, res) => {
    const filters = (0, pick_1.default)(req.query, user_constant_1.userFilterableFields); // searching , filtering
    const options = (0, pick_1.default)(req.query, ["page", "limit", "sortBy", "sortOrder"]); // pagination and sorting
    const result = await user_service_1.UserServices.getAllFromDB(filters, options);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "User retrive successfully!",
        meta: result.meta,
        data: result.data
    });
});
const getUserProfile = (0, catchAsync_1.default)(async (req, res) => {
    const { userId } = req.params;
    const result = await user_service_1.UserServices.getUserProfile(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User profile retrieved successfully",
        data: result
    });
});
// ✅ Get My Profile (from JWT token)
const getMyProfile = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user.id; // From JWT token
    const result = await user_service_1.UserServices.getUserProfile(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "My profile retrieved successfully",
        data: result
    });
});
// ✅ Update User Profile
// const updateUserProfile = catchAsync(async (req: Request, res: Response) => {
//     const { userId } = req.params;
//     const result = await UserServices.updateUserProfile(userId, req);
//     sendResponse(res, {
//         statusCode: httpStatus.OK,
//         success: true,
//         message: "Profile updated successfully",
//         data: result
//     });
// });
// ✅ Update My Profile
const updateMyProfile = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user.id; // From JWT token
    // console.log({userId})
    console.log(req.file);
    const result = await user_service_1.UserServices.updateMyProfile(userId, req);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Profile updated successfully",
        // data: {}
        data: result
    });
});
// ✅ Delete User (Admin only)
const deleteUser = (0, catchAsync_1.default)(async (req, res) => {
    const { userId } = req.params;
    const result = await user_service_1.UserServices.deleteUser(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User deleted successfully",
        data: result
    });
});
// ✅ Change Password
const changePassword = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;
    // console.log(req.body)
    const result = await user_service_1.UserServices.changePassword(userId, oldPassword, newPassword);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: null
    });
});
// ✅ Update User Role (Admin only)
const updateUserRole = (0, catchAsync_1.default)(async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;
    const result = await user_service_1.UserServices.updateUserRole(userId, role);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User role updated successfully",
        data: result
    });
});
// ✅ Toggle User Status (Admin only)
const getTopGuides = (0, catchAsync_1.default)(async (req, res) => {
    const result = await user_service_1.UserServices.getTopGuides();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        // message: "User activated successfully",
        message: "Top Guides Retrieve successfully",
        data: result
        // data: {}
    });
});
const UpdateUserStatus = (0, catchAsync_1.default)(async (req, res) => {
    const { userId } = req.params;
    const { status } = req.body;
    console.log("...............", userId, status);
    const result = await user_service_1.UserServices.UpdateUserStatus(userId, status);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        // message: "User activated successfully",
        message: result.isDeleted ? "User suspended successfully" : "User activated successfully",
        data: result
        // data: {}
    });
});
const becomeAGuide = (0, catchAsync_1.default)(async (req, res) => {
    // 1. Get the ID of the currently logged-in user (from Auth Middleware)
    const userId = req.user.id;
    // 2. Get the form data (bio, experience, etc.)
    const payload = req.body;
    console.log(userId, payload);
    // 3. Call the service
    const result = await user_service_1.UserServices.becomeAGuide(userId, payload);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Congratulations! You have successfully become a Guide.",
        // data: {}
        data: result
    });
});
const getAllGuides = (0, catchAsync_1.default)(async (req, res) => {
    // 1. Get the ID of the currently logged-in user (from Auth Middleware)
    const userId = req.user.id;
    const result = await user_service_1.UserServices.getAllGuides(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Congratulations! You have successfully got all Guide.",
        // data: {}
        data: result
    });
});
exports.UserController = {
    createTourist,
    createAdmin,
    createGuide,
    getAllFromDB,
    getUserProfile,
    getMyProfile,
    // updateUserProfile,
    updateMyProfile,
    deleteUser,
    changePassword,
    updateUserRole,
    UpdateUserStatus,
    getTopGuides,
    becomeAGuide,
    getAllGuides
};
