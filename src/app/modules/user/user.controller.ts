import { NextFunction, Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { UseServices } from "./user.service";
import sendResponse from "../../shared/sendResponse";

const createTourist = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // console.log("object", req.file.)

    const result = await UseServices.createTourist(req)

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Tourist created",
        // data: {}
        data: result
    })

})

export const UserController = {
    createTourist
}