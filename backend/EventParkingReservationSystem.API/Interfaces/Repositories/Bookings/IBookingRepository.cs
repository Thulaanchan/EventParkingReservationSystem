using EventParkingReservationSystem.API.Models.Entities.Bookings;

namespace EventParkingReservationSystem.API.Interfaces.Repositories.Bookings;

public interface IBookingRepository
{
    Task<Booking?> GetByIdAsync(int bookingId);

    Task<Booking?> GetByBookingNumberAsync(string bookingNumber);

    Task<IReadOnlyList<Booking>> GetByCustomerIdAsync(int customerId);

    Task<IReadOnlyList<Booking>> GetByEventIdAsync(int eventId);

    Task<IReadOnlyList<Booking>> GetExpiredPendingBookingsAsync(
        DateTime utcNow);
    Task<int> CountByCustomerIdAsync(int customerId);

    Task<Booking> AddAsync(Booking booking);

    Task UpdateAsync(Booking booking);
    Task<bool> TryConfirmPendingAsync(
    int bookingId,
    DateTime utcNow);

    Task<bool> TryExpirePendingAsync(
        int bookingId,
        DateTime utcNow);
    Task<bool> TryCancelAsync(
        int bookingId,
        DateTime utcNow);
}