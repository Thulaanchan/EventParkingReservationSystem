using EventParkingReservationSystem.API.Models.DTOs.Payments;

namespace EventParkingReservationSystem.API.Interfaces.Services.Payments
{
    public interface IPaymentService
    {
        Task<BookingPaymentDto?> GetBookingPaymentAsync(
            int bookingId,
            int customerId);

        Task<PaymentResultDto> ProcessPaymentAsync(
            int bookingId,
            int customerId,
            ProcessPaymentRequestDto request);

        Task<IEnumerable<PaymentHistoryDto>> GetCustomerPaymentHistoryAsync(
            int customerId);

        Task<PaymentReceiptDto?> GetReceiptAsync(
            int paymentId,
            int customerId);

        Task<IEnumerable<PaymentHistoryDto>> GetAllPaymentsAsync();
    }
}