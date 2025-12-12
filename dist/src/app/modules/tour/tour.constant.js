"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_TOUR_INCLUDES = exports.DAYS_OF_WEEK = exports.tourSortableFields = exports.tourFilterableFields = exports.tourSearchableFields = void 0;
exports.tourSearchableFields = ["title", "description", "location"];
exports.tourFilterableFields = [
    "searchTerm",
    "location",
    "guideId",
    "minPrice",
    "maxPrice",
    "minRating",
    "status",
];
exports.tourSortableFields = [
    "createdAt",
    "updatedAt",
    "title",
    "location"
];
exports.DAYS_OF_WEEK = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
};
exports.DEFAULT_TOUR_INCLUDES = {
    guide: {
        select: {
            id: true,
            name: true,
            profilePhoto: true,
            bio: true,
        }
    },
    tourAvailabilities: {
        where: { isActive: true },
        orderBy: { dayOfWeek: 'asc' }
    },
    tourPricings: {
        orderBy: { minGuests: 'asc' }
    },
    blockedDates: {
        where: {
            blockedDate: {
                gte: new Date()
            }
        },
        orderBy: { blockedDate: 'asc' }
    },
    _count: {
        select: {
            bookings: true,
            reviews: true
        }
    }
};
