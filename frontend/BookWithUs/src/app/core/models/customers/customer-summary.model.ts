export interface CustomerSummary {
  customerId: number;
  firstName: string;
  lastName: string;
  email: string;
  isEmailVerified: boolean;
  isActive: boolean;
  bookingCount: number;
}
