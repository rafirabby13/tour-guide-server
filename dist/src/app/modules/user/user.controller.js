import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { UserServices } from "./user.service";
import { userFilterableFields } from "./user.constant";
import pick from "../../helpers/pick";
import httpStatus from "http-status";
const createTourist = catchAsync(async (req, res, next) => {
    // console.log({req})
    const result = await UserServices.createTourist(req);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Tourist is created successsfully....",
        // data: {}
        data: result
    });
});
const createAdmin = catchAsync(async (req, res) => {
    const result = await UserServices.createAdmin(req);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Admin Created successfuly!",
        data: result
    });
});
const createGuide = catchAsync(async (req, res) => {
    // console.log(req.body)
    const result = await UserServices.createGuide(req.body);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Guide Created successfuly!",
        // data: {}
        data: result
    });
});
const getAllFromDB = catchAsync(async (req, res) => {
    const filters = pick(req.query, userFilterableFields); // searching , filtering
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]); // pagination and sorting
    const result = await UserServices.getAllFromDB(filters, options);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "User retrive successfully!",
        meta: result.meta,
        data: result.data
    });
});
const getUserProfile = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const result = await UserServices.getUserProfile(userId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User profile retrieved successfully",
        data: result
    });
});
// ✅ Get My Profile (from JWT token)
const getMyProfile = catchAsync(async (req, res) => {
    const userId = req.user.id; // From JWT token
    const result = await UserServices.getUserProfile(userId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
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
const updateMyProfile = catchAsync(async (req, res) => {
    const userId = req.user.id; // From JWT token
    // console.log({userId})
    console.log(req.file);
    const result = await UserServices.updateMyProfile(userId, req);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Profile updated successfully",
        // data: {}
        data: result
    });
});
// ✅ Delete User (Admin only)
const deleteUser = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const result = await UserServices.deleteUser(userId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User deleted successfully",
        data: result
    });
});
// ✅ Change Password
const changePassword = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;
    // console.log(req.body)
    const result = await UserServices.changePassword(userId, oldPassword, newPassword);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.message,
        data: null
    });
});
// ✅ Update User Role (Admin only)
const updateUserRole = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;
    const result = await UserServices.updateUserRole(userId, role);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User role updated successfully",
        data: result
    });
});
// ✅ Toggle User Status (Admin only)
const UpdateUserStatus = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const { status } = req.body;
    console.log("...............", userId, status);
    const result = await UserServices.UpdateUserStatus(userId, status);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        // message: "User activated successfully",
        message: result.isDeleted ? "User suspended successfully" : "User activated successfully",
        data: result
        // data: {}
    });
});
export const UserController = {
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
    UpdateUserStatus
};
