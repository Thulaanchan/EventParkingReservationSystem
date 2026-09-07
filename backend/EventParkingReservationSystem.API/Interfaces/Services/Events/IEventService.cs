using EventParkingReservationSystem.API.Common.Pagination;
using EventParkingReservationSystem.API.Models.DTOs.Events;

namespace EventParkingReservationSystem.API.Interfaces.Services.Events;

public interface IEventService
{
    Task<PagedResult<EventListItemDto>> SearchAsync(
        EventQueryDto query,
        bool includePast,
        CancellationToken cancellationToken = default);

    Task<EventDetailsDto> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<EventDetailsDto> CreateAsync(
        CreateEventDto request,
        CancellationToken cancellationToken = default);

    Task<EventDetailsDto> UpdateAsync(
        int id,
        UpdateEventDto request,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        int id,
        CancellationToken cancellationToken = default);
}