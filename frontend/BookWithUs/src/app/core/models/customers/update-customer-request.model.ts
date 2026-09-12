export interface UpdateCustomerRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
}
