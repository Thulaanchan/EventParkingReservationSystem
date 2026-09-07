using Microsoft.AspNetCore.Http;

namespace EventParkingReservationSystem.API.Interfaces.Services.Events;

public interface IEventPosterStorage
{
    Task<string> SaveAsync(
        IFormFile file,
        CancellationToken cancellationToken = default);

    Task DeleteIfLocalAsync(
        string? relativeUrl,
        CancellationToken cancellationToken = default);
}