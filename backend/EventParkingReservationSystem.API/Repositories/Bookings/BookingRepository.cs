using EventParkingReservationSystem.API.Data.Context;
using EventParkingReservationSystem.API.Enums.Bookings;
using EventParkingReservationSystem.API.Interfaces.Repositories.Bookings;
using EventParkingReservationSystem.API.Models.Entities.Bookings;
using Microsoft.EntityFrameworkCore;

namespace EventParkingReservationSystem.API.Repositories.Bookings;

public class BookingRepository : IBookingRepository
{
    private readonly ApplicationDbContext _context;

    public BookingRepository(
        ApplicationDbContext context)
    {
        _context = context;
    }

    // =====================================================
    // GET BOOKING BY ID
    // =====================================================
    public async Task<Booking?> GetByIdAsync(
        int bookingId)
    {
        return await _context.Bookings

            // Event details
            .Include(b => b.Event)
                .ThenInclude(e => e.Venue)

            .Include(b => b.Event)
                .ThenInclude(e => e.Category)

            // Selected/booked seats
            .Include(b => b.BookingSeats)
                .ThenInclude(bs => bs.Seat)
                    .ThenInclude(s => s!.Section)

            // Optional parking
            .Include(b => b.ParkingReservation)
                .ThenInclude(pr => pr.ParkingSlot)

            .FirstOrDefaultAsync(
                b => b.BookingId == bookingId);
    }

    // =====================================================
    // GET BOOKING BY BOOKING NUMBER
    // =====================================================
    public async Task<Booking?> GetByBookingNumberAsync(
        string bookingNumber)
    {
        return await _context.Bookings
            .FirstOrDefaultAsync(
                b =>
                    b.BookingNumber == bookingNumber);
    }

    // =====================================================
    // CUSTOMER BOOKING HISTORY
    // =====================================================
    public async Task<IReadOnlyList<Booking>>
        GetByCustomerIdAsync(
            int customerId)
    {
        return await _context.Bookings
            .AsNoTracking()

            // Event + venue information
            .Include(b => b.Event)
                .ThenInclude(e => e.Venue)

            // Used for SeatCount and seat total
            .Include(b => b.BookingSeats)

            // Used for HasParking and parking fee
            .Include(b => b.ParkingReservation)

            .Where(b =>
                b.CustomerId == customerId)

            .OrderByDescending(
                b => b.CreatedAt)

            .ToListAsync();
    }

    // =====================================================
    // ADMIN - BOOKINGS BY EVENT
    // =====================================================
    public async Task<IReadOnlyList<Booking>>
        GetByEventIdAsync(
            int eventId)
    {
        return await _context.Bookings
            .AsNoTracking()

            .Include(b => b.Event)
                .ThenInclude(e => e.Venue)

            .Include(b => b.BookingSeats)

            .Include(b => b.ParkingReservation)

            .Where(b =>
                b.EventId == eventId)

            .OrderByDescending(
                b => b.CreatedAt)

            .ToListAsync();
    }

    // =====================================================
    // GET EXPIRED PENDING BOOKINGS
    // =====================================================
    public async Task<IReadOnlyList<Booking>>
        GetExpiredPendingBookingsAsync(
            DateTime utcNow)
    {
        return await _context.Bookings
            .Where(b =>
                b.BookingStatus ==
                    BookingStatus.Pending &&
                b.HoldExpiresAtUtc <= utcNow)
            .ToListAsync();
    }

    // =====================================================
    // ATOMIC PENDING -> CONFIRMED
    // =====================================================
    public async Task<bool> TryConfirmPendingAsync(
        int bookingId,
        DateTime utcNow)
    {
        var affectedRows =
            await _context.Bookings
                .Where(booking =>
                    booking.BookingId == bookingId &&
                    booking.BookingStatus ==
                        BookingStatus.Pending &&
                    booking.HoldExpiresAtUtc >
                        utcNow)
                .ExecuteUpdateAsync(setters =>
                    setters
                        .SetProperty(
                            booking =>
                                booking.BookingStatus,
                            BookingStatus.Confirmed)
                        .SetProperty(
                            booking =>
                                booking.UpdatedAt,
                            utcNow));

        return affectedRows == 1;
    }

    // =====================================================
    // ATOMIC PENDING -> EXPIRED
    // =====================================================
    public async Task<bool> TryExpirePendingAsync(
        int bookingId,
        DateTime utcNow)
    {
        var affectedRows =
            await _context.Bookings
                .Where(booking =>
                    booking.BookingId == bookingId &&
                    booking.BookingStatus ==
                        BookingStatus.Pending &&
                    booking.HoldExpiresAtUtc <=
                        utcNow)
                .ExecuteUpdateAsync(setters =>
                    setters
                        .SetProperty(
                            booking =>
                                booking.BookingStatus,
                            BookingStatus.Expired)
                        .SetProperty(
                            booking =>
                                booking.UpdatedAt,
                            utcNow));

        return affectedRows == 1;
    }

    // =====================================================
    // CUSTOMER BOOKING COUNT
    // =====================================================
    public async Task<int> CountByCustomerIdAsync(
        int customerId)
    {
        return await _context.Bookings
            .CountAsync(b =>
                b.CustomerId == customerId);
    }

    // =====================================================
    // ADD BOOKING
    // =====================================================
    public async Task<Booking> AddAsync(
        Booking booking)
    {
        await _context.Bookings
            .AddAsync(booking);

        await _context
            .SaveChangesAsync();

        return booking;
    }

    // =====================================================
    // UPDATE BOOKING
    // =====================================================
    public async Task UpdateAsync(
        Booking booking)
    {
        _context.Bookings
            .Update(booking);

        await _context
            .SaveChangesAsync();
    }
}