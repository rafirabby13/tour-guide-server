import { NextFunction, Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { TourServices } from "./tour.service";
import pick from "../../helpers/pick";
import { tourFilterableFields } from "./tour.constant";

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
const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, tourFilterableFields) // searching , filtering
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]) // pagination and sorting

    const result = await TourServices.getAllFromDB(filters, options);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Tours retrive successfully!",
        meta: result.meta,
        data: result.data
    })
})
export const TourController = {
    createTour,
    getAllFromDB
}