
import { BookingStatus, PaymentStatus, UserRole } from "../../../prisma/generated/prisma/enums";
import { prisma } from "../shared/prisma";
import { IDateRange } from "./stats.interface";

// ========================================
// BOOKING STATS
// ========================================
const getBookingStats = async (dateRange?: IDateRange) => {
    const whereCondition: any = {};

    if (dateRange?.startDate && dateRange?.endDate) {
        whereCondition.createdAt = {
            gte: dateRange.startDate,
            lte: dateRange.endDate
        };
    }

    // Total bookings by status
    const totalBookings = await prisma.booking.count({ where: whereCondition });
    const pendingBookings = await prisma.booking.count({
        where: { ...whereCondition, status: BookingStatus.PENDING }
    });
    const confirmedBookings = await prisma.booking.count({
        where: { ...whereCondition, status: BookingStatus.CONFIRMED }
    });
    const completedBookings = await prisma.booking.count({
        where: { ...whereCondition, status: BookingStatus.COMPLETED }
    });
    const cancelledBookings = await prisma.booking.count({
        where: { ...whereCondition, status: BookingStatus.CANCELED_BY_TOURIST  }
    });

    // Revenue calculations
    const revenueData = await prisma.booking.aggregate({
        where: {
            ...whereCondition,
            status: {
                in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED]
            }
        },
        _sum: {
            totalPrice: true
        },
        _avg: {
            totalPrice: true
        }
    });

    const totalRevenue = revenueData._sum.totalPrice || 0;
    const averageBookingValue = revenueData._avg.totalPrice || 0;

    // Bookings by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const bookingsByMonth = await prisma.$queryRaw<Array<any>>`
        SELECT 
            TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon YYYY') as month,
            COUNT(*)::int as count,
            COALESCE(SUM("totalPrice"), 0)::float as revenue
        FROM bookings
        WHERE "createdAt" >= ${sixMonthsAgo}
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt") ASC
    `;

    // Bookings by status (percentage)
    const bookingsByStatus = [
        {
            status: 'PENDING',
            count: pendingBookings,
            percentage: totalBookings > 0 ? (pendingBookings / totalBookings) * 100 : 0
        },
        {
            status: 'CONFIRMED',
            count: confirmedBookings,
            percentage: totalBookings > 0 ? (confirmedBookings / totalBookings) * 100 : 0
        },
        {
            status: 'COMPLETED',
            count: completedBookings,
            percentage: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0
        },
        {
            status: 'CANCELLED',
            count: cancelledBookings,
            percentage: totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0
        }
    ];

    // Top guides by bookings and revenue
    const topGuides = await prisma.booking.groupBy({
        by: ['guideId'],
        where: whereCondition,
        _count: {
            id: true
        },
        _sum: {
            totalPrice: true
        },
        orderBy: {
            _count: {
                id: 'desc'
            }
        },
        take: 10
    });

    const topGuidesWithDetails = await Promise.all(
        topGuides.map(async (item) => {
            const guide = await prisma.guide.findUnique({
                where: { id: item.guideId },
                select: { id: true, name: true, profilePhoto: true }
            });
            return {
                guideId: item.guideId,
                guideName: guide?.name || 'Unknown',
                profilePhoto: guide?.profilePhoto,
                bookingCount: item._count.id,
                totalRevenue: item._sum.totalPrice || 0
            };
        })
    );

    // Recent bookings
    const recentBookings = await prisma.booking.findMany({
        where: whereCondition,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
            tourist: {
                select: { id: true, name: true, profilePhoto: true }
            },
            guide: {
                select: { id: true, name: true, profilePhoto: true }
            },
            tour: {
                select: { id: true, title: true, images: true }
            }
        }
    });

    return {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        averageBookingValue: Number(averageBookingValue.toFixed(2)),
        bookingsByMonth,
        bookingsByStatus,
        topGuides: topGuidesWithDetails,
        recentBookings
    };
};


// ========================================
// PAYMENT STATS
// ========================================
const getPaymentStats = async (dateRange?: IDateRange) => {
    const whereCondition: any = {};

    if (dateRange?.startDate && dateRange?.endDate) {
        whereCondition.createdAt = {
            gte: dateRange.startDate,
            lte: dateRange.endDate
        };
    }

    // Total payments by status
    const totalPayments = await prisma.payment.count({ where: whereCondition });

    const paymentsByStatus = await prisma.payment.groupBy({
        by: ['status'],
        where: whereCondition,
        _count: { id: true },
        _sum: { amount: true }
    });

    let successfulPayments = 0;
    let pendingPayments = 0;
    let failedPayments = 0;
    let totalRevenue = 0;

    paymentsByStatus.forEach(payment => {
        if (payment.status === 'SUCCESS' ) {
            successfulPayments += payment._count.id;
            totalRevenue += payment._sum.amount || 0;
        } else if (payment.status === 'PENDING') {
            pendingPayments += payment._count.id;
        } else if (payment.status === 'FAILED') {
            failedPayments += payment._count.id;
        }
    });

    const averagePaymentAmount = totalPayments > 0 ? totalRevenue / successfulPayments : 0;

    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueByMonth = await prisma.$queryRaw<Array<any>>`
        SELECT 
            TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon YYYY') as month,
            COALESCE(SUM(amount), 0)::float as revenue,
            COUNT(*)::int as count
        FROM payments
        WHERE "createdAt" >= ${sixMonthsAgo}
            AND status IN ('SUCCESS', 'COMPLETED')
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt") ASC
    `;

    // Top paying tourists
    const topPayingTourists = await prisma.payment.groupBy({
        by: ['bookingId'],
        where: {
            ...whereCondition,
            status: { in: ['SUCCESS', 'COMPLETED'] }
        },
        _sum: { amount: true }
    });

    const touristPayments = new Map<string, { totalSpent: number; bookingCount: number }>();

    for (const payment of topPayingTourists) {
        const booking = await prisma.booking.findUnique({
            where: { id: payment.bookingId },
            select: { touristId: true }
        });

        if (booking) {
            const current = touristPayments.get(booking.touristId) || { totalSpent: 0, bookingCount: 0 };
            touristPayments.set(booking.touristId, {
                totalSpent: current.totalSpent + (payment._sum.amount || 0),
                bookingCount: current.bookingCount + 1
            });
        }
    }

    const topTourists = await Promise.all(
        Array.from(touristPayments.entries())
            .sort((a, b) => b[1].totalSpent - a[1].totalSpent)
            .slice(0, 10)
            .map(async ([touristId, data]) => {
                const tourist = await prisma.tourist.findUnique({
                    where: { id: touristId },
                    select: { id: true, name: true, profilePhoto: true }
                });
                return {
                    touristId,
                    touristName: tourist?.name || 'Unknown',
                    profilePhoto: tourist?.profilePhoto,
                    totalSpent: Number(data.totalSpent.toFixed(2)),
                    bookingCount: data.bookingCount
                };
            })
    );

    return {
        totalPayments,
        successfulPayments,
        pendingPayments,
        failedPayments,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        averagePaymentAmount: Number(averagePaymentAmount.toFixed(2)),
        revenueByMonth,
        paymentsByStatus: paymentsByStatus.map(p => ({
            status: p.status,
            count: p._count.id,
            amount: Number((p._sum.amount || 0).toFixed(2))
        })),
        topPayingTourists: topTourists
    };
};


// ========================================
// TOUR STATS
// ========================================
const getTourStats = async (dateRange?: IDateRange) => {
    const whereCondition: any = {};

    if (dateRange?.startDate && dateRange?.endDate) {
        whereCondition.createdAt = {
            gte: dateRange.startDate,
            lte: dateRange.endDate
        };
    }

    // Total tours
    const totalTours = await prisma.tour.count({ where: whereCondition });
    const activeTours = await prisma.tour.count({
        where: { ...whereCondition, isDeleted: false }
    });
    const inactiveTours = await prisma.tour.count({
        where: { ...whereCondition, isDeleted: true }
    });

    // Total bookings for all tours
    const totalBookings = await prisma.booking.count();

  
   
    
  

    


    return {
        totalTours,
        activeTours,
        inactiveTours,
        totalBookings
    };
};


// ========================================
// USER STATS
// ========================================
const getUserStats = async (dateRange?: IDateRange) => {
    const whereCondition: any = {};

    if (dateRange?.startDate && dateRange?.endDate) {
        whereCondition.createdAt = {
            gte: dateRange.startDate,
            lte: dateRange.endDate
        };
    }

    // Total users by role
    const totalUsers = await prisma.user.count({ where: whereCondition });
    const totalTourists = await prisma.user.count({
        where: { ...whereCondition, role: UserRole.TOURIST }
    });
    const totalGuides = await prisma.user.count({
        where: { ...whereCondition, role: UserRole.GUIDE }
    });
    const totalAdmins = await prisma.user.count({
        where: { ...whereCondition, role: UserRole.ADMIN }
    });

    const activeUsers = await prisma.user.count({
        where: { ...whereCondition, isDeleted: false }
    });
    const deletedUsers = await prisma.user.count({
        where: { ...whereCondition, isDeleted: true }
    });

    // Users by role (percentage)
    const usersByRole = [
        {
            role: 'TOURIST',
            count: totalTourists,
            percentage: totalUsers > 0 ? (totalTourists / totalUsers) * 100 : 0
        },
        {
            role: 'GUIDE',
            count: totalGuides,
            percentage: totalUsers > 0 ? (totalGuides / totalUsers) * 100 : 0
        },
        {
            role: 'ADMIN',
            count: totalAdmins,
            percentage: totalUsers > 0 ? (totalAdmins / totalUsers) * 100 : 0
        }
    ];

    // New users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newUsersThisMonth = await prisma.user.count({
        where: {
            createdAt: { gte: startOfMonth }
        }
    });

    // User growth by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userGrowthByMonth = await prisma.$queryRaw<Array<any>>`
        SELECT 
            TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon YYYY') as month,
            COUNT(*) FILTER (WHERE role = 'TOURIST')::int as tourists,
            COUNT(*) FILTER (WHERE role = 'GUIDE')::int as guides,
            COUNT(*)::int as total
        FROM users
        WHERE "createdAt" >= ${sixMonthsAgo}
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt") ASC
    `;

    // Top guides (by rating, reviews, bookings, revenue)
    const topGuides = await prisma.guide.findMany({
        where: {
            isAvailable: true
        },
        select: {
            id: true,
            name: true,
            profilePhoto: true,
            city: true,
            averageRating: true,
            totalReviews: true,
            _count: {
                select: { bookings: true }
            },
            bookings: {
                where: {
                    status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] }
                },
                select: {
                    totalPrice: true
                }
            }
        },
        orderBy: {
            averageRating: 'desc'
        },
        take: 10
    });

    const topGuidesFormatted = topGuides.map(guide => ({
        guideId: guide.id,
        guideName: guide.name,
        profilePhoto: guide.profilePhoto,
        city: guide.city,
        averageRating: guide.averageRating,
        totalReviews: guide.totalReviews,
        totalBookings: guide._count.bookings,
        totalRevenue: Number(
            guide.bookings.reduce((sum, b) => sum + b.totalPrice, 0).toFixed(2)
        )
    }));

    return {
        totalUsers,
        totalTourists,
        totalGuides,
        totalAdmins,
        activeUsers,
        deletedUsers,
        usersByRole,
        newUsersThisMonth,
        userGrowthByMonth,
        topGuides: topGuidesFormatted
    };
};


// ========================================
// DASHBOARD OVERVIEW STATS
// ========================================
const getDashboardStats = async () => {
    // Overview counts
    const totalUsers = await prisma.user.count({ where: { isDeleted: false } });
    const totalTourists = await prisma.user.count({
        where: { role: UserRole.TOURIST, isDeleted: false }
    });
    const totalGuides = await prisma.user.count({
        where: { role: UserRole.GUIDE, isDeleted: false }
    });
    const totalTours = await prisma.tour.count({ where: { isDeleted: false } });
    const totalBookings = await prisma.booking.count();

    // Total revenue
    const revenueData = await prisma.booking.aggregate({
        where: {
            status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] }
        },
        _sum: { totalPrice: true }
    });
    const totalRevenue = revenueData._sum.totalPrice || 0;

    // Average rating across all guides
    const ratingData = await prisma.guide.aggregate({
        _avg: { averageRating: true }
    });
    const averageRating = ratingData._avg.averageRating || 0;

    // Recent bookings
    const recentBookings = await prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            tourist: {
                select: { id: true, name: true, profilePhoto: true }
            },
            guide: {
                select: { id: true, name: true, profilePhoto: true }
            },
            tour: {
                select: { id: true, title: true, images: true }
            }
        }
    });

    // Recent reviews
    const recentReviews = await prisma.review.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            tourist: {
                select: { id: true, name: true, profilePhoto: true }
            },
            guide: {
                select: { id: true, name: true, profilePhoto: true }
            }
        }
    });

    // Recent users
    const recentUsers = await prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        where: { isDeleted: false },
        select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            tourist: {
                select: { name: true, profilePhoto: true }
            },
            guide: {
                select: { name: true, profilePhoto: true }
            }
        }
    });

    // Calculate trends (comparing last month vs previous month)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    const lastMonthBookings = await prisma.booking.count({
        where: { createdAt: { gte: lastMonth } }
    });
    const previousMonthBookings = await prisma.booking.count({
        where: {
            createdAt: { gte: twoMonthsAgo, lt: lastMonth }
        }
    });

    const lastMonthRevenue = await prisma.booking.aggregate({
        where: {
            createdAt: { gte: lastMonth },
            status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] }
        },
        _sum: { totalPrice: true }
    });
    const previousMonthRevenue = await prisma.booking.aggregate({
        where: {
            createdAt: { gte: twoMonthsAgo, lt: lastMonth },
            status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] }
        },
        _sum: { totalPrice: true }
    });

    const lastMonthUsers = await prisma.user.count({
        where: { createdAt: { gte: lastMonth } }
    });
    const previousMonthUsers = await prisma.user.count({
        where: {
            createdAt: { gte: twoMonthsAgo, lt: lastMonth }
        }
    });

    return {
        overview: {
            totalUsers,
            totalTourists,
            totalGuides,
            totalTours,
            totalBookings,
            totalRevenue: Number(totalRevenue.toFixed(2)),
            averageRating: Number(averageRating.toFixed(1))
        },
        recentActivity: {
            recentBookings,
            recentReviews,
            recentUsers
        },
        trends: {
            bookingTrend: lastMonthBookings >= previousMonthBookings ? 'up' : 'down',
            bookingChange: previousMonthBookings > 0
                ? ((lastMonthBookings - previousMonthBookings) / previousMonthBookings * 100).toFixed(1)
                : '0',
            revenueTrend: (lastMonthRevenue._sum.totalPrice || 0) >= (previousMonthRevenue._sum.totalPrice || 0) ? 'up' : 'down',
            revenueChange: (previousMonthRevenue._sum.totalPrice || 0) > 0
                ? (((lastMonthRevenue._sum.totalPrice || 0) - (previousMonthRevenue._sum.totalPrice || 0)) / (previousMonthRevenue._sum.totalPrice || 0) * 100).toFixed(1)
                : '0',
            userTrend: lastMonthUsers >= previousMonthUsers ? 'up' : 'down',
            userChange: previousMonthUsers > 0
                ? ((lastMonthUsers - previousMonthUsers) / previousMonthUsers * 100).toFixed(1)
                : '0'
        }
    };
};


// ========================================
// GUIDE SPECIFIC STATS
// ========================================
const getGuideStats = async (guideId: string) => {
    // Check if guide exists
    const guide = await prisma.guide.findUnique({
        where: { id: guideId }
    });

    if (!guide) {
        throw new Error("Guide not found");
    }

    // Total bookings
    const totalBookings = await prisma.booking.count({
        where: { guideId }
    });

    const completedBookings = await prisma.booking.count({
        where: { guideId, status: BookingStatus.COMPLETED }
    });

    const pendingBookings = await prisma.booking.count({
        where: { guideId, status: BookingStatus.PENDING }
    });

    const confirmedBookings = await prisma.booking.count({
        where: { guideId, status: BookingStatus.CONFIRMED }
    });

    // Total earnings
    const earningsData = await prisma.booking.aggregate({
        where: {
            guideId,
            status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] }
        },
        _sum: { totalPrice: true }
    });
    const totalEarnings = earningsData._sum.totalPrice || 0;

    // Earnings by month
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const earningsByMonth = await prisma.$queryRaw<Array<any>>`
        SELECT 
            TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon YYYY') as month,
            COALESCE(SUM("totalPrice"), 0)::float as earnings,
            COUNT(*)::int as bookings
        FROM bookings
        WHERE "guideId" = ${guideId}
            AND "createdAt" >= ${sixMonthsAgo}
            AND status IN ('CONFIRMED', 'COMPLETED')
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt") ASC
    `;

    // Recent bookings
    const recentBookings = await prisma.booking.findMany({
        where: { guideId },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
            tourist: {
                select: { id: true, name: true, profilePhoto: true }
            },
            tour: {
                select: { id: true, title: true, images: true }
            }
        }
    });

    return {
        guide: {
            id: guide.id,
            name: guide.name,
            averageRating: guide.averageRating,
            totalReviews: guide.totalReviews
        },
        bookings: {
            total: totalBookings,
            completed: completedBookings,
            pending: pendingBookings,
            confirmed: confirmedBookings
        },
        earnings: {
            total: Number(totalEarnings.toFixed(2)),
            byMonth: earningsByMonth
        },
        recentBookings
    };
}

const getTouristStats = async (touristId: string) => {
    // Check if tourist exists
    const tourist = await prisma.tourist.findUnique({
        where: { id: touristId }
    });
    if (!tourist) {
        throw new Error("Tourist not found");
    }

    // Total bookings
    const totalBookings = await prisma.booking.count({
        where: { touristId }
    });

    const completedBookings = await prisma.booking.count({
        where: { touristId, status: BookingStatus.COMPLETED }
    });

    const upcomingBookings = await prisma.booking.count({
        where: {
            touristId,
            status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] }
        }
    });

    // Total spent
    const spentData = await prisma.booking.aggregate({
        where: {
            touristId,
            status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] }
        },
        _sum: { totalPrice: true }
    });
    const totalSpent = spentData._sum.totalPrice || 0;

    // Total reviews written
    const totalReviews = await prisma.review.count({
        where: { touristId }
    });

    // Recent bookings
    const recentBookings = await prisma.booking.findMany({
        where: { touristId },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
            guide: {
                select: { id: true, name: true, profilePhoto: true }
            },
            tour: {
                select: { id: true, title: true, images: true }
            }
        }
    });

    return {
        tourist: {
            id: tourist.id,
            name: tourist.name,
            profilePhoto: tourist.profilePhoto
        },
        bookings: {
            total: totalBookings,
            completed: completedBookings,
            upcoming: upcomingBookings
        },
        totalSpent: Number(totalSpent.toFixed(2)),
        totalReviews,
        recentBookings
    };
}


export const StatsService = {
getBookingStats,
getPaymentStats,
getTourStats,
getUserStats,
getDashboardStats,
getGuideStats,
getTouristStats
};