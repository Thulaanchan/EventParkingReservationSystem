using EventParkingReservationSystem.API.Models.Entities.Seats;

namespace EventParkingReservationSystem.API.Interfaces.Repositories.Seats;

public interface IEventSeatCategoryRepository
{
    Task<IReadOnlyList<EventSeatCategory>>
        GetByEventAsync(
            int eventId,
            CancellationToken cancellationToken = default);

    Task<EventSeatCategory?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        EventSeatCategory category,
        CancellationToken cancellationToken = default);

    Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default);
}