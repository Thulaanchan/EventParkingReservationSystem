using EventParkingReservationSystem.API.Models.DTOs.Events;
using EventEntity =
    EventParkingReservationSystem.API.Models.Entities.Events.Event;

namespace EventParkingReservationSystem.API.Interfaces.Repositories.Events;

public interface IEventRepository
{
    Task<(IReadOnlyList<EventEntity> Items, int TotalCount)> SearchAsync(
        EventQueryDto query,
        bool includePast,
        CancellationToken cancellationToken = default);

    Task<EventEntity?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<(int Total, int Available, int Booked)> GetSeatStatsAsync(
        int eventId,
        CancellationToken cancellationToken = default);

    Task<bool> HasActiveBookingsAsync(
        int eventId,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        EventEntity entity,
        CancellationToken cancellationToken = default);

    void Remove(EventEntity entity);

    Task SaveChangesAsync(
        CancellationToken cancellationToken = default);
}