export const bookingFilterableFields = [
    "status",
    "tourId",
    "touristId",
    "startDate",
    "endDate"
];
export const bookingSortableFields = [
    "date",
    "createdAt",
    "totalPrice",
    "status"
];
export const CANCELLATION_POLICY = {
    FULL_REFUND_HOURS: 48,
    PARTIAL_REFUND_HOURS: 24,
    FULL_REFUND_PERCENT: 100,
    PARTIAL_REFUND_PERCENT: 50,
    NO_REFUND_PERCENT: 0,
};
export const DEFAULT_BOOKING_INCLUDES = {
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
