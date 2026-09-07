using EventParkingReservationSystem.API.Data.Context;
using EventParkingReservationSystem.API.Enums.Seats;
using EventParkingReservationSystem.API.Interfaces.Repositories.Seats;
using EventParkingReservationSystem.API.Models.Entities.Seats;
using Microsoft.EntityFrameworkCore;

namespace EventParkingReservationSystem.API.Repositories.Seats;

public class SeatRepository : ISeatRepository
{
    private readonly ApplicationDbContext _context;

    public SeatRepository(
        ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Seat>>
        GetByEventAsync(
            int eventId,
            CancellationToken cancellationToken = default)
    {
        return await _context.Set<Seat>()
            .AsNoTracking()
            .Include(x => x.Event)
            .Include(x => x.Section)
                .ThenInclude(x => x.SeatCategory)
            .Where(x => x.EventId == eventId)
            .OrderBy(x => x.Section.DisplayOrder)
            .ThenBy(x => x.DisplayOrder)
            .ThenBy(x => x.RowLabel)
            .ThenBy(x => x.Number)
            .ToListAsync(cancellationToken);
    }

    public async Task<Seat?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return await _context.Set<Seat>()
            .Include(x => x.Event)
            .Include(x => x.Section)
                .ThenInclude(x => x.SeatCategory)
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);
    }

    public async Task<IReadOnlyList<Seat>>
        GetByIdsAsync(
            IReadOnlyCollection<int> ids,
            CancellationToken cancellationToken = default)
    {
        return await _context.Set<Seat>()
            .Include(x => x.Event)
            .Include(x => x.Section)
                .ThenInclude(x => x.SeatCategory)
            .Where(x => ids.Contains(x.Id))
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> PositionExistsAsync(
        int eventId,
        int seatSectionId,
        string rowLabel,
        int number,
        int? excludeSeatId = null,
        CancellationToken cancellationToken = default)
    {
        return await _context.Set<Seat>()
            .AnyAsync(
                x =>
                    x.EventId == eventId &&
                    x.SeatSectionId == seatSectionId &&
                    x.RowLabel == rowLabel &&
                    x.Number == number &&
                    (!excludeSeatId.HasValue ||
                     x.Id != excludeSeatId.Value),
                cancellationToken);
    }

    public async Task AddAsync(
        Seat seat,
        CancellationToken cancellationToken = default)
    {
        await _context.Set<Seat>()
            .AddAsync(
                seat,
                cancellationToken);
    }

    public void Remove(Seat seat)
    {
        _context.Set<Seat>().Remove(seat);
    }

    public async Task<int> TryChangeStatusAsync(
        IReadOnlyCollection<int> seatIds,
        SeatStatus expectedStatus,
        SeatStatus newStatus,
        CancellationToken cancellationToken = default)
    {
        return await _context.Set<Seat>()
            .Where(x =>
                seatIds.Contains(x.Id) &&
                x.Status == expectedStatus)
            .ExecuteUpdateAsync(
                setters => setters
                    .SetProperty(
                        x => x.Status,
                        newStatus),
                cancellationToken);
    }

    public async Task<IReadOnlyList<int>>
        GetUnavailableSeatIdsAsync(
            IReadOnlyCollection<int> seatIds,
            CancellationToken cancellationToken = default)
    {
        return await _context.Set<Seat>()
            .AsNoTracking()
            .Where(x =>
                seatIds.Contains(x.Id) &&
                x.Status != SeatStatus.Available)
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);
    }

    public Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        return _context.SaveChangesAsync(
            cancellationToken);
    }
}