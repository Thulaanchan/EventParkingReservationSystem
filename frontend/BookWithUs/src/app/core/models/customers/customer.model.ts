export interface Customer {
  customerId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  bookingCount: number;
  createdAt: string;
  updatedAt?: string | null;
}
