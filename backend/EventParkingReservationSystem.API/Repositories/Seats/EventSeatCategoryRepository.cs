using EventParkingReservationSystem.API.Data.Context;
using EventParkingReservationSystem.API.Interfaces.Repositories.Seats;
using EventParkingReservationSystem.API.Models.Entities.Seats;
using Microsoft.EntityFrameworkCore;

namespace EventParkingReservationSystem.API.Repositories.Seats;

public class EventSeatCategoryRepository
    : IEventSeatCategoryRepository
{
    private readonly ApplicationDbContext _context;

    public EventSeatCategoryRepository(
        ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<EventSeatCategory>>
        GetByEventAsync(
            int eventId,
            CancellationToken cancellationToken = default)
    {
        return await _context
            .Set<EventSeatCategory>()
            .AsNoTracking()
            .Where(x => x.EventId == eventId)
            .OrderBy(x => x.DisplayOrder)
            .ToListAsync(cancellationToken);
    }

    public Task<EventSeatCategory?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return _context
            .Set<EventSeatCategory>()
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);
    }

    public async Task AddAsync(
        EventSeatCategory category,
        CancellationToken cancellationToken = default)
    {
        await _context
            .Set<EventSeatCategory>()
            .AddAsync(
                category,
                cancellationToken);
    }

    public Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        return _context.SaveChangesAsync(
            cancellationToken);
    }
}