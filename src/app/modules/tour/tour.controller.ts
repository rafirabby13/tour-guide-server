import { NextFunction, Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { TourServices } from "./tour.service";
import pick from "../../helpers/pick";
import { tourFilterableFields } from "./tour.constant";

const createTour = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    console.log("object", req.files)
    console.log("object", req.body)

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
const getSingleTour = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await TourServices.getSingleFromDB(id);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Tour retrieved successfully",
        data: result,
    });
});

const updateTour = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await TourServices.updateIntoDB(id, req);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Tour updated successfully",
        data: result,
    });
});

const deleteTour = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await TourServices.deleteFromDB(id);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Tour deleted successfully",
        data: result,
    });
});

const checkAvailability = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { date, guestCount } = req.body;

    const result = await TourServices.checkAvailability(
        id,
        new Date(date),
        guestCount
    );

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Availability checked successfully",
        data: result,
    });
});

const getMyTours = catchAsync(async (req: Request, res: Response) => {
    const guideId = (req as any).user.id;
    console.log("..................",{guideId})
    const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);

    const result = await TourServices.getMyTours(guideId, options);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "My tours retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});
const updatetourStatus = catchAsync(async (req: Request, res: Response) => {
    const {tourId, status} = req.body

    const result = await TourServices.updatetourStatus(tourId, status);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Tours status updated successfully",
        data: result,
    });
});
const getPopularDestinations = catchAsync(async (req: Request, res: Response) => {
  const result = await TourServices.getPopularDestinations();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Popular destinations retrieved successfully",
    data: result,
  });
});
export const TourController = {
    createTour,
    getAllFromDB,
    getSingleTour,
    updateTour,
    deleteTour,
    checkAvailability,
    getMyTours,
    updatetourStatus,
    getPopularDestinations
}