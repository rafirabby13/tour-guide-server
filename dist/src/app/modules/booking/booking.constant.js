"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_BOOKING_INCLUDES = exports.CANCELLATION_POLICY = exports.bookingSortableFields = exports.bookingFilterableFields = void 0;
exports.bookingFilterableFields = [
    "status",
    "tourId",
    "touristId",
    "startDate",
    "endDate"
];
exports.bookingSortableFields = [
    "date",
    "createdAt",
    "totalPrice",
    "status"
];
exports.CANCELLATION_POLICY = {
    FULL_REFUND_HOURS: 48,
    PARTIAL_REFUND_HOURS: 24,
    FULL_REFUND_PERCENT: 100,
    PARTIAL_REFUND_PERCENT: 50,
    NO_REFUND_PERCENT: 0,
};
exports.DEFAULT_BOOKING_INCLUDES = {
    tour: {
        select: {
            id: true,
            title: true,
            location: true,
            images: true,
            guide: {
                select: {
                    id: true,
                    name: true,
                    profilePhoto: true,
                    contactNumber: true,
                }
            }
        }
    },
    tourist: {
        select: {
            id: true,
            name: true,
            profilePhoto: true,
            contactNumber: true,
        }
    },
    payment: true
};
