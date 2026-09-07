using EventParkingReservationSystem.API.Models.DTOs.Parking;

namespace EventParkingReservationSystem.API.Interfaces.Services.Parking;

public interface IParkingZoneService
{
    Task<IReadOnlyList<ParkingZoneDto>>
        GetEventZonesAsync(
            int eventId,
            CancellationToken cancellationToken = default);

    Task<ParkingZoneDto> CreateAsync(
        int eventId,
        CreateParkingZoneRequest request,
        CancellationToken cancellationToken = default);

    Task<ParkingZoneDto> UpdateAsync(
        int zoneId,
        UpdateParkingZoneRequest request,
        CancellationToken cancellationToken = default);
}