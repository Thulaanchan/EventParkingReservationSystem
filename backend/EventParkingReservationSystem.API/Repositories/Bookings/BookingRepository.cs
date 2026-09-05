using EventParkingReservationSystem.API.Data.Context;
using EventParkingReservationSystem.API.Enums.Bookings;
using EventParkingReservationSystem.API.Interfaces.Repositories.Bookings;
using EventParkingReservationSystem.API.Models.Entities.Bookings;
using Microsoft.EntityFrameworkCore;

namespace EventParkingReservationSystem.API.Repositories.Bookings;

public class BookingRepository : IBookingRepository
{
    private readonly ApplicationDbContext _context;

    public BookingRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Booking?> GetByIdAsync(int bookingId)
    {
        return await _context.Bookings
            .FirstOrDefaultAsync(b => b.BookingId == bookingId);
    }

    public async Task<Booking?> GetByBookingNumberAsync(
        string bookingNumber)
    {
        return await _context.Bookings
            .FirstOrDefaultAsync(
                b => b.BookingNumber == bookingNumber);
    }

    public async Task<IReadOnlyList<Booking>> GetByCustomerIdAsync(
        int customerId)
    {
        return await _context.Bookings
            .AsNoTracking()
            .Where(b => b.CustomerId == customerId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<Booking>> GetByEventIdAsync(
        int eventId)
    {
        return await _context.Bookings
            .AsNoTracking()
            .Where(b => b.EventId == eventId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<Booking>>
        GetExpiredPendingBookingsAsync(DateTime utcNow)
    {
        return await _context.Bookings
            .Where(b =>
                b.BookingStatus == BookingStatus.Pending &&
                b.HoldExpiresAtUtc <= utcNow)
            .ToListAsync();
    }

    public async Task<Booking> AddAsync(Booking booking)
    {
        await _context.Bookings.AddAsync(booking);
        await _context.SaveChangesAsync();

        return booking;
    }

    public async Task UpdateAsync(Booking booking)
    {
        _context.Bookings.Update(booking);
        await _context.SaveChangesAsync();
    }
}