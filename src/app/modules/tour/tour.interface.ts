export interface TourAvailabilityInput {
  dayOfWeek: number;
  startTime: string; // Frontend sends "09:00"
  endTime: string;   // Frontend sends "17:00"
  maxBookings: number;
  isActive: boolean;
}

export interface TourPricingInput {
  minGuests: number;
  maxGuests: number;
  pricePerHour: number;
}

export interface BlockedDateInput {
  blockedDate: string;
}

export interface CreateTourPayload {
  title: string;
  description: string;
  location: string;
  availableDates?: string[] | Date[];
  images?: string[];
  
  tourPricings: TourPricingInput[];
  tourAvailabilities: TourAvailabilityInput[];
  blockedDates?: BlockedDateInput[];
}

export interface UpdateTourPayload {
  title?: string;
  description?: string;
  location?: string;
  availableDates?: string[] | Date[];
  images?: string[];
  
  tourPricings?: TourPricingInput[];
  tourAvailabilities?: TourAvailabilityInput[];
  blockedDates?: BlockedDateInput[];
}

export interface TourQueryParams {
  searchTerm?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  guideId?: string;
  available?: boolean;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TourFilters {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  guideId?: string;
}

export interface TourAvailabilityCheckParams {
  tourId: string;
  date: string;
  guestCount: number;
  startTime?: string;
  endTime?: string;
}