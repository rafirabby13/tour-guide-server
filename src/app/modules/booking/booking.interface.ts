import { BookingStatus } from "../../../../prisma/generated/prisma/enums";


export interface CreateBookingPayload {
  tourId: string;
  date: string; // ISO datetime with time
  startTime: string;
  endTime: string;
  duration: number; // hours
  numGuests: number;
}

export interface BookingQueryParams {
  status?: BookingStatus;
  tourId?: string;
  touristId?: string;
  startDate?: string;
  endDate?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CancelBookingPayload {
  reason?: string;
  canceledBy: 'TOURIST' | 'GUIDE';
}

export interface SSLCommerzConfig {
  store_id: string;
  store_passwd: string;
  is_live: boolean;
  success_url: string;
  fail_url: string;
  cancel_url: string;
  ipn_url: string;
}

export interface PaymentInitData {
  total_amount: number;
  currency: string;
  tran_id: string;
  success_url: string;
  fail_url: string;
  cancel_url: string;
  ipn_url: string;
  product_name: string;
  product_category: string;
  product_profile: string;
  cus_name: string;
  cus_email: string;
  cus_add1: string;
  cus_city: string;
  cus_country: string;
  cus_phone: string;
  shipping_method: string;
  num_of_item: number;
  value_a?: string; // Custom field - bookingId
  value_b?: string; // Custom field - tourId
  value_c?: string; // Custom field - touristId
}

export interface SSLCommerzResponse {
  status: string;
  GatewayPageURL?: string;
  failedreason?: string;
}

export interface PaymentValidationResponse {
  status: string;
  tran_id: string;
  val_id: string;
  amount: string;
  card_type?: string;
  bank_tran_id?: string;
  store_amount?: string;
  currency?: string;
}

export interface RefundCalculation {
  refundPercentage: number;
  refundAmount: number;
  cancellationFee: number;
  reason: string;
}

export interface BookingAvailabilityCheck {
  available: boolean;
  conflicts?: any[];
  reason?: string;
}