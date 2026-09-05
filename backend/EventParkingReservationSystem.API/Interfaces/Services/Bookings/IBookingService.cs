using EventParkingReservationSystem.API.Models.DTOs.Bookings;

namespace EventParkingReservationSystem.API.Interfaces.Services.Bookings;

public interface IBookingService
{
    Task<BookingDto> CreateAsync(
        int customerId,
        CreateBookingRequestDto request);

    Task<BookingDto?> GetByIdAsync(
        int bookingId);

    Task<IReadOnlyList<BookingSummaryDto>> GetCustomerBookingsAsync(
        int customerId);

    Task<IReadOnlyList<BookingSummaryDto>> GetEventBookingsAsync(
        int eventId);

    Task<CancelBookingResponseDto?> CancelAsync(
        int bookingId,
        int customerId);

    Task<int> ExpirePendingBookingsAsync(
        DateTime utcNow);
}