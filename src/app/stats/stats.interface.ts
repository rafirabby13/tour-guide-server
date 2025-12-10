export interface IDateRange {
    startDate?: Date;
    endDate?: Date;
}

export interface IBookingStats {
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    totalRevenue: number;
    averageBookingValue: number;
    bookingsByMonth: Array<{
        month: string;
        count: number;
        revenue: number;
    }>;
    bookingsByStatus: Array<{
        status: string;
        count: number;
        percentage: number;
    }>;
    topGuides: Array<{
        guideId: string;
        guideName: string;
        bookingCount: number;
        totalRevenue: number;
    }>;
    recentBookings: Array<any>;
}

export interface IPaymentStats {
    totalPayments: number;
    successfulPayments: number;
    pendingPayments: number;
    failedPayments: number;
    totalRevenue: number;
    averagePaymentAmount: number;
    revenueByMonth: Array<{
        month: string;
        revenue: number;
        count: number;
    }>;
    paymentsByStatus: Array<{
        status: string;
        count: number;
        amount: number;
    }>;
    topPayingTourists: Array<{
        touristId: string;
        touristName: string;
        totalSpent: number;
        bookingCount: number;
    }>;
}

export interface ITourStats {
    totalTours: number;
    activeTours: number;
    inactiveTours: number;
    totalBookings: number;
    averagePrice: number;
    toursByCategory: Array<{
        category: string;
        count: number;
        percentage: number;
    }>;
    toursByCity: Array<{
        city: string;
        count: number;
    }>;
    topRatedTours: Array<{
        tourId: string;
        title: string;
        averageRating: number;
        totalReviews: number;
        bookingCount: number;
    }>;
    mostBookedTours: Array<{
        tourId: string;
        title: string;
        bookingCount: number;
        revenue: number;
    }>;
}

export interface IUserStats {
    totalUsers: number;
    totalTourists: number;
    totalGuides: number;
    totalAdmins: number;
    activeUsers: number;
    deletedUsers: number;
    usersByRole: Array<{
        role: string;
        count: number;
        percentage: number;
    }>;
    newUsersThisMonth: number;
    userGrowthByMonth: Array<{
        month: string;
        tourists: number;
        guides: number;
        total: number;
    }>;
    topGuides: Array<{
        guideId: string;
        guideName: string;
        averageRating: number;
        totalReviews: number;
        totalBookings: number;
        totalRevenue: number;
    }>;
}

export interface IDashboardStats {
    overview: {
        totalUsers: number;
        totalTourists: number;
        totalGuides: number;
        totalTours: number;
        totalBookings: number;
        totalRevenue: number;
        averageRating: number;
    };
    recentActivity: {
        recentBookings: Array<any>;
        recentReviews: Array<any>;
        recentUsers: Array<any>;
    };
    trends: {
        bookingTrend: string; // "up" or "down"
        revenueTrend: string;
        userTrend: string;
    };
}