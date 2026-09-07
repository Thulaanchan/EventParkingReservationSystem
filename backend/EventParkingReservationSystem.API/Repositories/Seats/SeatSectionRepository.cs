using EventParkingReservationSystem.API.Data.Context;
using EventParkingReservationSystem.API.Interfaces.Repositories.Seats;
using EventParkingReservationSystem.API.Models.Entities.Seats;
using Microsoft.EntityFrameworkCore;

namespace EventParkingReservationSystem.API.Repositories.Seats;

public class SeatSectionRepository
    : ISeatSectionRepository
{
    private readonly ApplicationDbContext _context;

    public SeatSectionRepository(
        ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<SeatSection>>
        GetByEventAsync(
            int eventId,
            CancellationToken cancellationToken = default)
    {
        return await _context
            .Set<SeatSection>()
            .AsNoTracking()
            .Include(x => x.SeatCategory)
            .Include(x => x.Seats)
            .Where(x => x.EventId == eventId)
            .OrderBy(x => x.DisplayOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<SeatSection?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return await _context
            .Set<SeatSection>()
            .Include(x => x.SeatCategory)
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);
    }

    public async Task AddAsync(
        SeatSection section,
        CancellationToken cancellationToken = default)
    {
        await _context
            .Set<SeatSection>()
            .AddAsync(
                section,
                cancellationToken);
    }

    public Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        return _context.SaveChangesAsync(
            cancellationToken);
    }
}