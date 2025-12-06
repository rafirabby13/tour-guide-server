export interface ICreateReview {
    rating: number;
    comment?: string;
    bookingId: string;
}

export interface IUpdateReview {
    rating?: number;
    comment?: string;
}

export interface IReviewFilters {
    guideId?: string;
    touristId?: string;
    rating?: number;
    searchTerm?: string;
}