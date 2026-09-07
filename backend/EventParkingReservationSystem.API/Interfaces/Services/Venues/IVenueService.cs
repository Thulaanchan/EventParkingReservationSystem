using EventParkingReservationSystem.API.Models.DTOs.Venues;

namespace EventParkingReservationSystem.API.Interfaces.Services.Venues;

public interface IVenueService
{
    Task<IReadOnlyList<VenueDto>> GetAllAsync(
        CancellationToken cancellationToken = default);

    Task<VenueDto> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<VenueDto> CreateAsync(
        CreateVenueDto request,
        CancellationToken cancellationToken = default);

    Task<VenueDto> UpdateAsync(
        int id,
        UpdateVenueDto request,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<VenueAvailabilityDto> CheckAvailabilityAsync(
        int venueId,
        DateOnly date,
        TimeOnly start,
        TimeOnly end,
        int? excludeEventId = null,
        CancellationToken cancellationToken = default);
}