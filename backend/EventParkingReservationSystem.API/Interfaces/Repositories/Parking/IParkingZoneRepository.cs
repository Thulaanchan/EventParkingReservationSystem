using EventParkingReservationSystem.API.Models.Entities.Parking;

namespace EventParkingReservationSystem.API.Interfaces.Repositories.Parking;

public interface IParkingZoneRepository
{
    Task<IReadOnlyList<ParkingZone>>
        GetByEventAsync(
            int eventId,
            CancellationToken cancellationToken = default);

    Task<ParkingZone?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        ParkingZone zone,
        CancellationToken cancellationToken = default);

    Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default);
}