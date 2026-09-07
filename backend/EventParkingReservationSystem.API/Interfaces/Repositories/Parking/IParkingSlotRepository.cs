using EventParkingReservationSystem.API.Enums.Parking;
using EventParkingReservationSystem.API.Models.Entities.Parking;

namespace EventParkingReservationSystem.API.Interfaces.Repositories.Parking;

public interface IParkingSlotRepository
{
    Task<IReadOnlyList<ParkingSlot>>
        GetByEventAsync(
            int eventId,
            CancellationToken cancellationToken = default);

    Task<ParkingSlot?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<bool> SlotCodeExistsAsync(
        int eventId,
        string slotCode,
        int? excludeSlotId = null,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        ParkingSlot slot,
        CancellationToken cancellationToken = default);

    void Remove(ParkingSlot slot);

    Task<int> TryChangeStatusAsync(
        int slotId,
        ParkingStatus expectedStatus,
        ParkingStatus newStatus,
        CancellationToken cancellationToken = default);

    Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default);
}