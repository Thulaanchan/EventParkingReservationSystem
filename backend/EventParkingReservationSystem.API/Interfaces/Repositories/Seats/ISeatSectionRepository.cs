using EventParkingReservationSystem.API.Models.Entities.Seats;

namespace EventParkingReservationSystem.API.Interfaces.Repositories.Seats;

public interface ISeatSectionRepository
{
    Task<IReadOnlyList<SeatSection>>
        GetByEventAsync(
            int eventId,
            CancellationToken cancellationToken = default);

    Task<SeatSection?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        SeatSection section,
        CancellationToken cancellationToken = default);

    Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default);
}