using EventParkingReservationSystem.API.Data.Context;
using EventParkingReservationSystem.API.Enums.Bookings;
using EventParkingReservationSystem.API.Enums.Seats;
using EventParkingReservationSystem.API.Interfaces.Repositories.Events;
using EventParkingReservationSystem.API.Models.DTOs.Events;
using Microsoft.EntityFrameworkCore;

using EventEntity =
    EventParkingReservationSystem.API.Models.Entities.Events.Event;

namespace EventParkingReservationSystem.API.Repositories.Events;

public sealed class EventRepository(
    ApplicationDbContext context) : IEventRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task<(
        IReadOnlyList<EventEntity> Items,
        int TotalCount)> SearchAsync(
            EventQueryDto query,
            bool includePast,
            CancellationToken cancellationToken = default)
    {
        var events = _context.Events
            .AsNoTracking()
            .Include(x => x.Venue)
            .Include(x => x.Category)
            .AsQueryable();

        if (!includePast)
        {
            var today =
                DateOnly.FromDateTime(DateTime.UtcNow);

            events = events.Where(
                x => x.EventDate >= today);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim();

            events = events.Where(
                x => x.Name.Contains(search));
        }

        if (query.Venue.HasValue)
        {
            events = events.Where(
                x => x.VenueId == query.Venue.Value);
        }

        if (query.Category.HasValue)
        {
            events = events.Where(
                x => x.CategoryId == query.Category.Value);
        }

        if (query.Date.HasValue)
        {
            events = events.Where(
                x => x.EventDate == query.Date.Value);
        }

        if (query.Time.HasValue)
        {
            events = events.Where(
                x =>
                    x.StartTime <= query.Time.Value &&
                    query.Time.Value <= x.EndTime);
        }

        var totalCount =
            await events.CountAsync(cancellationToken);

        var items = await events
            .OrderBy(x => x.EventDate)
            .ThenBy(x => x.StartTime)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public Task<EventEntity?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return _context.Events
            .Include(x => x.Venue)
            .Include(x => x.Category)
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);
    }

    public async Task<(
        int Total,
        int Available,
        int Booked)> GetSeatStatsAsync(
            int eventId,
            CancellationToken cancellationToken = default)
    {
        var total =
            await _context.Seats.CountAsync(
                x => x.EventId == eventId,
                cancellationToken);

        var available =
            await _context.Seats.CountAsync(
                x =>
                    x.EventId == eventId &&
                    x.Status == SeatStatus.Available,
                cancellationToken);

        var booked =
            await _context.Seats.CountAsync(
                x =>
                    x.EventId == eventId &&
                    x.Status == SeatStatus.Booked,
                cancellationToken);

        return (
            total,
            available,
            booked);
    }

    public Task<bool> HasActiveBookingsAsync(
    int eventId,
    CancellationToken cancellationToken = default)
    {
        return _context.Bookings.AnyAsync(
            x =>
                x.EventId == eventId &&
                x.BookingStatus != BookingStatus.Cancelled &&
                x.BookingStatus != BookingStatus.Expired,
            cancellationToken);
    }

    public async Task AddAsync(
        EventEntity entity,
        CancellationToken cancellationToken = default)
    {
        await _context.Events.AddAsync(
            entity,
            cancellationToken);
    }

    public void Remove(EventEntity entity)
    {
        _context.Events.Remove(entity);
    }

    public Task SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        return _context.SaveChangesAsync(
            cancellationToken);
    }
}