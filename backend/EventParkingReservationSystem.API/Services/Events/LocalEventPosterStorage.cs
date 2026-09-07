using EventParkingReservationSystem.API.Interfaces.Services.Events;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace EventParkingReservationSystem.API.Services.Events;

public sealed class LocalEventPosterStorage(
    IWebHostEnvironment environment)
    : IEventPosterStorage
{
    private static readonly HashSet<string>
        AllowedContentTypes =
        [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

    private const long MaxFileSize =
        5 * 1024 * 1024;

    private readonly IWebHostEnvironment _environment =
        environment;

    public async Task<string> SaveAsync(
        IFormFile file,
        CancellationToken cancellationToken = default)
    {
        if (file.Length <= 0)
            throw new ArgumentException(
                "Poster file is empty.");

        if (file.Length > MaxFileSize)
            throw new ArgumentException(
                "Poster image must be 5 MB or smaller.");

        if (!AllowedContentTypes.Contains(
                file.ContentType))
        {
            throw new ArgumentException(
                "Poster must be JPEG, PNG or WebP.");
        }

        var extension =
            Path.GetExtension(file.FileName)
                .ToLowerInvariant();

        if (extension is not ".jpg"
            and not ".jpeg"
            and not ".png"
            and not ".webp")
        {
            throw new ArgumentException(
                "Poster file extension is not supported.");
        }

        var root = _environment.WebRootPath;

        if (string.IsNullOrWhiteSpace(root))
        {
            root = Path.Combine(
                _environment.ContentRootPath,
                "wwwroot");
        }

        var folder = Path.Combine(
            root,
            "uploads",
            "events");

        Directory.CreateDirectory(folder);

        var fileName =
            $"{Guid.NewGuid():N}{extension}";

        var fullPath =
            Path.Combine(folder, fileName);

        await using var stream =
            File.Create(fullPath);

        await file.CopyToAsync(
            stream,
            cancellationToken);

        return $"/uploads/events/{fileName}";
    }

    public Task DeleteIfLocalAsync(
        string? relativeUrl,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(relativeUrl) ||
            !relativeUrl.StartsWith(
                "/uploads/events/",
                StringComparison.OrdinalIgnoreCase))
        {
            return Task.CompletedTask;
        }

        var root = _environment.WebRootPath;

        if (string.IsNullOrWhiteSpace(root))
        {
            root = Path.Combine(
                _environment.ContentRootPath,
                "wwwroot");
        }

        var fileName =
            Path.GetFileName(relativeUrl);

        var fullPath =
            Path.Combine(
                root,
                "uploads",
                "events",
                fileName);

        if (File.Exists(fullPath))
            File.Delete(fullPath);

        return Task.CompletedTask;
    }
}