using EventParkingReservationSystem.API.Data.Context;
using EventParkingReservationSystem.API.Interfaces.Repositories.Parking;
using EventParkingReservationSystem.API.Models.Entities.Parking;
using Microsoft.EntityFrameworkCore;

namespace EventParkingReservationSystem.API.Repositories.Parking;

public class ParkingZoneRepository
    : IParkingZoneRepository
{
    private readonly ApplicationDbContext _context;

    public ParkingZoneRepository(
        ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<ParkingZone>>
        GetByEventAsync(
            int eventId,
            CancellationToken cancellationToken = default)
    {
        return await _context
            .Set<ParkingZone>()
            .AsNoTracking()
            .Include(x => x.ParkingSlots)
            .Where(x => x.EventId == eventId)
            .OrderBy(x => x.DisplayOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<ParkingZone?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return await _context
            .Set<ParkingZone>()
            .Include(x => x.ParkingSlots)
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);
    }

    public async Task AddAsync(
        ParkingZone zone,
        CancellationToken cancellationToken = default)
    {
        await _context
            .Set<ParkingZone>()
            .AddAsync(
                zone,
                cancellationToken);
    }

    public Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        return _context.SaveChangesAsync(
            cancellationToken);
    }
}