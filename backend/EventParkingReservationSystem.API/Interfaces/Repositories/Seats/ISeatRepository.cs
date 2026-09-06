using EventParkingReservationSystem.API.Enums.Seats;
using EventParkingReservationSystem.API.Models.Entities.Seats;

namespace EventParkingReservationSystem.API.Interfaces.Repositories.Seats;

public interface ISeatRepository
{
    Task<IReadOnlyList<Seat>> GetByEventAsync(
        int eventId,
        CancellationToken cancellationToken = default);

    Task<Seat?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Seat>> GetByIdsAsync(
        IReadOnlyCollection<int> ids,
        CancellationToken cancellationToken = default);

    Task<bool> PositionExistsAsync(
        int eventId,
        int seatSectionId,
        string rowLabel,
        int number,
        int? excludeSeatId = null,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        Seat seat,
        CancellationToken cancellationToken = default);

    void Remove(Seat seat);

    Task<int> TryChangeStatusAsync(
        IReadOnlyCollection<int> seatIds,
        SeatStatus expectedStatus,
        SeatStatus newStatus,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<int>>
        GetUnavailableSeatIdsAsync(
            IReadOnlyCollection<int> seatIds,
            CancellationToken cancellationToken = default);

    Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default);
}