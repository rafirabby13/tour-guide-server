import { NextFunction, Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { TourServices } from "./tour.service";

const createTour = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // console.log("object", req.file.)

    const result = await TourServices.createTour(req)

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Tour created",
        // data: {}
        data: result
    })

})
export const TourController = {
    createTour
}