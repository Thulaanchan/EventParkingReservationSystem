using EventParkingReservationSystem.API.Interfaces.Repositories.Venues;
using EventParkingReservationSystem.API.Interfaces.Services.Venues;
using EventParkingReservationSystem.API.Mappings.Venues;
using EventParkingReservationSystem.API.Models.DTOs.Venues;
using EventParkingReservationSystem.API.Models.Entities.Venues;
using EventParkingReservationSystem.API.Validators.Venues;
using Microsoft.Extensions.Caching.Memory;

namespace EventParkingReservationSystem.API.Services.Venues;

public sealed class VenueService(
    IVenueRepository repository,
    IMemoryCache cache) : IVenueService
{
    private const string CacheKey = "member2:venues";

    private readonly IVenueRepository _repository = repository;
    private readonly IMemoryCache _cache = cache;

    public async Task<IReadOnlyList<VenueDto>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        var venues =
            await _cache.GetOrCreateAsync(
                CacheKey,
                async entry =>
                {
                    entry.AbsoluteExpirationRelativeToNow =
                        TimeSpan.FromMinutes(10);

                    return await _repository.GetAllAsync(
                        cancellationToken);
                })
            ?? [];

        var result =
            new List<VenueDto>(venues.Count);

        foreach (var venue in venues)
        {
            var count =
                await _repository.GetUpcomingEventCountAsync(
                    venue.Id,
                    cancellationToken);

            result.Add(venue.ToDto(count));
        }

        return result;
    }

    public async Task<VenueDto> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var venue =
            await _repository.GetByIdAsync(
                id,
                cancellationToken)
            ?? throw new KeyNotFoundException(
                "Venue was not found.");

        var count =
            await _repository.GetUpcomingEventCountAsync(
                id,
                cancellationToken);

        return venue.ToDto(count);
    }

    public async Task<VenueDto> CreateAsync(
        CreateVenueDto request,
        CancellationToken cancellationToken = default)
    {
        VenueValidator.Validate(request);

        var name = request.Name.Trim();

        if (await _repository.NameExistsAsync(
                name,
                cancellationToken: cancellationToken))
        {
            throw new InvalidOperationException(
                "A venue with this name already exists.");
        }

        var venue = new Venue
        {
            Name = name,
            Address = request.Address.Trim(),
            TotalCapacity = request.TotalCapacity
        };

        await _repository.AddAsync(
            venue,
            cancellationToken);

        await _repository.SaveChangesAsync(
            cancellationToken);

        _cache.Remove(CacheKey);

        return venue.ToDto();
    }

    public async Task<VenueDto> UpdateAsync(
        int id,
        UpdateVenueDto request,
        CancellationToken cancellationToken = default)
    {
        VenueValidator.Validate(request);

        var venue =
            await _repository.GetByIdAsync(
                id,
                cancellationToken)
            ?? throw new KeyNotFoundException(
                "Venue was not found.");

        var name = request.Name.Trim();

        if (await _repository.NameExistsAsync(
                name,
                id,
                cancellationToken))
        {
            throw new InvalidOperationException(
                "Another venue already uses this name.");
        }

        venue.Name = name;
        venue.Address = request.Address.Trim();
        venue.TotalCapacity = request.TotalCapacity;
        venue.UpdatedAt = DateTime.UtcNow;

        await _repository.SaveChangesAsync(
            cancellationToken);

        _cache.Remove(CacheKey);

        var count =
            await _repository.GetUpcomingEventCountAsync(
                id,
                cancellationToken);

        return venue.ToDto(count);
    }

    public async Task DeleteAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var venue =
            await _repository.GetByIdAsync(
                id,
                cancellationToken)
            ?? throw new KeyNotFoundException(
                "Venue was not found.");

        if (await _repository.HasUpcomingEventsAsync(
                id,
                cancellationToken))
        {
            throw new InvalidOperationException(
                "This venue cannot be deleted because upcoming events are scheduled here.");
        }

        _repository.Remove(venue);

        await _repository.SaveChangesAsync(
            cancellationToken);

        _cache.Remove(CacheKey);
    }

    public async Task<VenueAvailabilityDto>
        CheckAvailabilityAsync(
            int venueId,
            DateOnly date,
            TimeOnly start,
            TimeOnly end,
            int? excludeEventId = null,
            CancellationToken cancellationToken = default)
    {
        _ =
            await _repository.GetByIdAsync(
                venueId,
                cancellationToken)
            ?? throw new KeyNotFoundException(
                "Venue was not found.");

        if (end <= start)
        {
            throw new ArgumentException(
                "End time must be after start time.");
        }

        var conflicts =
            await _repository.GetScheduleConflictsAsync(
                venueId,
                date,
                start,
                end,
                excludeEventId,
                cancellationToken);

        return new VenueAvailabilityDto
        {
            VenueId = venueId,
            Date = date,
            StartTime = start,
            EndTime = end,
            IsAvailable = conflicts.Count == 0,

            Conflicts = conflicts
                .Select(x =>
                    new VenueAvailabilityConflictDto
                    {
                        EventId = x.Id,
                        EventName = x.Name,
                        StartTime = x.StartTime,
                        EndTime = x.EndTime
                    })
                .ToList()
        };
    }
}