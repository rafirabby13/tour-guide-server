export const tourSearchableFields = ["title", "description", "location"];
export const tourFilterableFields = [
    "location",
    "guideId",
    "minPrice",
    "maxPrice",
    "minRating"
];
export const tourSortableFields = [
    "createdAt",
    "updatedAt",
    "title",
    "location"
];
export const DAYS_OF_WEEK = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
};
export const DEFAULT_TOUR_INCLUDES = {
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
