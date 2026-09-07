using EventParkingReservationSystem.API.Data.Context;
using EventParkingReservationSystem.API.Interfaces.Repositories.Parking;
using EventParkingReservationSystem.API.Models.Entities.ParkingReservations;
using Microsoft.EntityFrameworkCore;

namespace EventParkingReservationSystem.API.Repositories.Parking;

public class ParkingReservationRepository
    : IParkingReservationRepository
{
    private readonly ApplicationDbContext _context;

    public ParkingReservationRepository(
        ApplicationDbContext context)
    {
        _context = context;
    }

    public Task<ParkingReservation?>
        GetByBookingIdAsync(
            int bookingId,
            CancellationToken cancellationToken = default)
    {
        return _context
            .Set<ParkingReservation>()
            .Include(x => x.ParkingSlot)
                .ThenInclude(x => x.ParkingZone)
            .FirstOrDefaultAsync(
                x => x.BookingId == bookingId,
                cancellationToken);
    }

    public async Task AddAsync(
        ParkingReservation reservation,
        CancellationToken cancellationToken = default)
    {
        await _context
            .Set<ParkingReservation>()
            .AddAsync(
                reservation,
                cancellationToken);
    }

    public void Remove(
        ParkingReservation reservation)
    {
        _context
            .Set<ParkingReservation>()
            .Remove(reservation);
    }

    public Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        return _context.SaveChangesAsync(
            cancellationToken);
    }
}