export const API_ENDPOINTS = {
  payments: {
    all: '/payments',
    forBooking: (bookingId: number): string => `/bookings/${bookingId}/payment`,
    forCustomer: (customerId: number): string => `/payments/customer/${customerId}`,
    receipt: (paymentId: number): string => `/payments/${paymentId}/receipt`
  },
  notifications: {
    forCustomer: (customerId: number): string => `/notifications/customer/${customerId}`,
    unreadCount: (customerId: number): string => `/notifications/customer/${customerId}/unread-count`,
    markRead: (notificationId: number): string => `/notifications/${notificationId}/read`
  }
} as const;
