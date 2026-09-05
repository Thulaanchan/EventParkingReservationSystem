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

    Task<Booking> AddAsync(Booking booking);

    Task UpdateAsync(Booking booking);
}