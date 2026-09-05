using EventParkingReservationSystem.API.Models.Entities.Events;
using EventParkingReservationSystem.API.Models.Entities.Venues;

namespace EventParkingReservationSystem.API.Interfaces.Repositories.Venues;

public interface IVenueRepository
{
    Task<IReadOnlyList<Venue>> GetAllAsync(
        CancellationToken cancellationToken = default);

    Task<Venue?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<bool> NameExistsAsync(
        string name,
        int? excludingId = null,
        CancellationToken cancellationToken = default);

    Task<int> GetUpcomingEventCountAsync(
        int venueId,
        CancellationToken cancellationToken = default);

    Task<bool> HasUpcomingEventsAsync(
        int venueId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Event>> GetScheduleConflictsAsync(
        int venueId,
        DateOnly date,
        TimeOnly start,
        TimeOnly end,
        int? excludeEventId = null,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        Venue venue,
        CancellationToken cancellationToken = default);

    void Remove(Venue venue);

    Task SaveChangesAsync(
        CancellationToken cancellationToken = default);
}