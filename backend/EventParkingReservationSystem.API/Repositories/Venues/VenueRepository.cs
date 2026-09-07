using EventParkingReservationSystem.API.Data.Context;
using EventParkingReservationSystem.API.Interfaces.Repositories.Venues;
using EventParkingReservationSystem.API.Models.Entities.Events;
using EventParkingReservationSystem.API.Models.Entities.Venues;
using Microsoft.EntityFrameworkCore;

namespace EventParkingReservationSystem.API.Repositories.Venues;

public sealed class VenueRepository(
    ApplicationDbContext context) : IVenueRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task<IReadOnlyList<Venue>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        return await _context.Venues
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);
    }

    public Task<Venue?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return _context.Venues
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);
    }

    public Task<bool> NameExistsAsync(
        string name,
        int? excludingId = null,
        CancellationToken cancellationToken = default)
    {
        var normalized = name.Trim().ToUpper();

        return _context.Venues.AnyAsync(
            x =>
                x.Name.ToUpper() == normalized &&
                (!excludingId.HasValue ||
                 x.Id != excludingId.Value),
            cancellationToken);
    }

    public Task<int> GetUpcomingEventCountAsync(
        int venueId,
        CancellationToken cancellationToken = default)
    {
        var today =
            DateOnly.FromDateTime(DateTime.UtcNow);

        return _context.Events.CountAsync(
            x =>
                x.VenueId == venueId &&
                x.EventDate >= today,
            cancellationToken);
    }

    public Task<bool> HasUpcomingEventsAsync(
        int venueId,
        CancellationToken cancellationToken = default)
    {
        var today =
            DateOnly.FromDateTime(DateTime.UtcNow);

        return _context.Events.AnyAsync(
            x =>
                x.VenueId == venueId &&
                x.EventDate >= today,
            cancellationToken);
    }

    public async Task<IReadOnlyList<Event>> GetScheduleConflictsAsync(
        int venueId,
        DateOnly date,
        TimeOnly start,
        TimeOnly end,
        int? excludeEventId = null,
        CancellationToken cancellationToken = default)
    {
        return await _context.Events
            .AsNoTracking()
            .Where(x =>
                x.VenueId == venueId &&
                x.EventDate == date &&
                (!excludeEventId.HasValue ||
                 x.Id != excludeEventId.Value) &&

                x.StartTime < end &&
                start < x.EndTime)
            .OrderBy(x => x.StartTime)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(
        Venue venue,
        CancellationToken cancellationToken = default)
    {
        await _context.Venues.AddAsync(
            venue,
            cancellationToken);
    }

    public void Remove(Venue venue)
    {
        _context.Venues.Remove(venue);
    }

    public Task SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        return _context.SaveChangesAsync(
            cancellationToken);
    }
}