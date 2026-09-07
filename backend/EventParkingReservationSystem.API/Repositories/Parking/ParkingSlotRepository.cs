using EventParkingReservationSystem.API.Data.Context;
using EventParkingReservationSystem.API.Enums.Parking;
using EventParkingReservationSystem.API.Interfaces.Repositories.Parking;
using EventParkingReservationSystem.API.Models.Entities.Parking;
using Microsoft.EntityFrameworkCore;

namespace EventParkingReservationSystem.API.Repositories.Parking;

public class ParkingSlotRepository
    : IParkingSlotRepository
{
    private readonly ApplicationDbContext _context;

    public ParkingSlotRepository(
        ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<ParkingSlot>>
        GetByEventAsync(
            int eventId,
            CancellationToken cancellationToken = default)
    {
        return await _context
            .Set<ParkingSlot>()
            .AsNoTracking()
            .Include(x => x.ParkingZone)
            .Where(x => x.EventId == eventId)
            .OrderBy(x => x.ParkingZone.DisplayOrder)
            .ThenBy(x => x.DisplayOrder)
            .ThenBy(x => x.SlotCode)
            .ToListAsync(cancellationToken);
    }

    public async Task<ParkingSlot?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return await _context
            .Set<ParkingSlot>()
            .Include(x => x.ParkingZone)
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);
    }

    public Task<bool> SlotCodeExistsAsync(
        int eventId,
        string slotCode,
        int? excludeSlotId = null,
        CancellationToken cancellationToken = default)
    {
        return _context
            .Set<ParkingSlot>()
            .AnyAsync(
                x =>
                    x.EventId == eventId &&
                    x.SlotCode == slotCode &&
                    (!excludeSlotId.HasValue ||
                     x.Id != excludeSlotId.Value),
                cancellationToken);
    }

    public async Task AddAsync(
        ParkingSlot slot,
        CancellationToken cancellationToken = default)
    {
        await _context
            .Set<ParkingSlot>()
            .AddAsync(
                slot,
                cancellationToken);
    }

    public void Remove(ParkingSlot slot)
    {
        _context
            .Set<ParkingSlot>()
            .Remove(slot);
    }

    public Task<int> TryChangeStatusAsync(
        int slotId,
        ParkingStatus expectedStatus,
        ParkingStatus newStatus,
        CancellationToken cancellationToken = default)
    {
        return _context
            .Set<ParkingSlot>()
            .Where(x =>
                x.Id == slotId &&
                x.Status == expectedStatus)
            .ExecuteUpdateAsync(
                setters =>
                    setters.SetProperty(
                        x => x.Status,
                        newStatus),
                cancellationToken);
    }

    public Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        return _context.SaveChangesAsync(
            cancellationToken);
    }
}