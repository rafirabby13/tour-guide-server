import { NextFunction, Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { UserServices } from "./user.service";
import { userFilterableFields } from "./user.constant";
import pick from "../../helpers/pick";

const createTourist = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // console.log("object", req.file.)

    const result = await UserServices.createTourist(req)

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Tourist created",
        // data: {}
        data: result
    })

})

const createAdmin = catchAsync(async (req: Request, res: Response) => {

    const result = await UserServices.createAdmin(req);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Admin Created successfuly!",
        data: result
    })
});

const createGuide = catchAsync(async (req: Request, res: Response) => {

    const result = await UserServices.createGuide(req);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Guide Created successfuly!",
        data: result
    })
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, userFilterableFields) // searching , filtering
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]) // pagination and sorting

    const result = await UserServices.getAllFromDB(filters, options);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "User retrive successfully!",
        meta: result.meta,
        data: result.data
    })
})
export const UserController = {
    createTourist,
    createAdmin,
    createGuide,
    getAllFromDB
}