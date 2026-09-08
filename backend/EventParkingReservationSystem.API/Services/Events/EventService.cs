using EventParkingReservationSystem.API.Common.Pagination;
using EventParkingReservationSystem.API.Interfaces.Repositories.Categories;
using EventParkingReservationSystem.API.Interfaces.Repositories.Events;
using EventParkingReservationSystem.API.Interfaces.Repositories.Venues;
using EventParkingReservationSystem.API.Interfaces.Services.Events;
using EventParkingReservationSystem.API.Mappings.Events;
using EventParkingReservationSystem.API.Models.DTOs.Events;
using EventParkingReservationSystem.API.Validators.Events;

using EventEntity =
    EventParkingReservationSystem.API.Models.Entities.Events.Event;

namespace EventParkingReservationSystem.API.Services.Events;

public sealed class EventService(
    IEventRepository eventRepository,
    IVenueRepository venueRepository,
    ICategoryRepository categoryRepository,
    IEventPosterStorage posterStorage)
    : IEventService
{
    private readonly IEventRepository _eventRepository =
        eventRepository;

    private readonly IVenueRepository _venueRepository =
        venueRepository;

    private readonly ICategoryRepository _categoryRepository =
        categoryRepository;

    private readonly IEventPosterStorage _posterStorage =
        posterStorage;

    public async Task<PagedResult<EventListItemDto>>
        SearchAsync(
            EventQueryDto query,
            bool includePast,
            CancellationToken cancellationToken = default)
    {
        var (items, totalCount) =
            await _eventRepository.SearchAsync(
                query,
                includePast,
                cancellationToken);

        var result =
            new List<EventListItemDto>(
                items.Count);

        foreach (var item in items)
        {
            var stats =
                await _eventRepository.GetSeatStatsAsync(
                    item.Id,
                    cancellationToken);

            var hasBookings =
                await _eventRepository.HasActiveBookingsAsync(
                    item.Id,
                    cancellationToken);

            result.Add(
                item.ToListItemDto(
                    stats.Total,
                    stats.Available,
                    stats.Booked,
                    hasBookings));
        }

        return new PagedResult<EventListItemDto>
        {
            Items = result,
            Page = query.Page,
            PageSize = query.PageSize,
            TotalCount = totalCount
        };
    }

    public async Task<EventDetailsDto> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity =
            await _eventRepository.GetByIdAsync(
                id,
                cancellationToken)
            ?? throw new KeyNotFoundException(
                "Event was not found.");

        var stats =
            await _eventRepository.GetSeatStatsAsync(
                id,
                cancellationToken);

        var bookingCount =
            await _eventRepository.GetActiveBookingCountAsync(
                 id,
                 cancellationToken);

        var hasBookings =
            await _eventRepository.HasActiveBookingsAsync(
                id,
                cancellationToken);

        return entity.ToDetailsDto(
            stats.Total,
            stats.Available,
            stats.Booked,
            bookingCount,
            hasBookings);
    }

    public async Task<EventDetailsDto> CreateAsync(
        CreateEventDto request,
        CancellationToken cancellationToken = default)
    {
        EventValidator.ValidateSchedule(
            request.EventDate,
            request.StartTime,
            request.EndTime,
            request.TicketPrice,
            request.Capacity);

        var venue =
            await _venueRepository.GetByIdAsync(
                request.VenueId,
                cancellationToken)
            ?? throw new ArgumentException(
                "Selected venue does not exist.");

        _ =
            await _categoryRepository.GetByIdAsync(
                request.CategoryId,
                cancellationToken)
            ?? throw new ArgumentException(
                "Selected category does not exist.");

        if (request.Capacity >
            venue.TotalCapacity)
        {
            throw new InvalidOperationException(
                $"Event capacity cannot exceed venue capacity of {venue.TotalCapacity}.");
        }

        var conflicts =
            await _venueRepository
                .GetScheduleConflictsAsync(
                    request.VenueId,
                    request.EventDate,
                    request.StartTime,
                    request.EndTime,
                    null,
                    cancellationToken);

        if (conflicts.Count > 0)
        {
            throw new InvalidOperationException(
                "The selected venue is not available during this date and time.");
        }

        string? posterUrl = null;

        if (request.Poster is not null)
        {
            posterUrl =
                await _posterStorage.SaveAsync(
                    request.Poster,
                    cancellationToken);
        }

        var entity =
            new EventEntity
            {
                Name = request.Name.Trim(),

                Description =
                    string.IsNullOrWhiteSpace(
                        request.Description)
                        ? null
                        : request.Description.Trim(),

                VenueId = request.VenueId,

                CategoryId = request.CategoryId,

                EventDate = request.EventDate,

                StartTime = request.StartTime,

                EndTime = request.EndTime,

                TicketPrice = request.TicketPrice,

                Capacity = request.Capacity,

                StageLayout =
                    string.IsNullOrWhiteSpace(
                        request.StageLayout)
                        ? null
                        : request.StageLayout.Trim(),

                PosterUrl = posterUrl
            };

        await _eventRepository.AddAsync(
            entity,
            cancellationToken);

        await _eventRepository.SaveChangesAsync(
            cancellationToken);

        return await GetByIdAsync(
            entity.Id,
            cancellationToken);
    }

    public async Task<EventDetailsDto> UpdateAsync(
        int id,
        UpdateEventDto request,
        CancellationToken cancellationToken = default)
    {
        EventValidator.ValidateSchedule(
            request.EventDate,
            request.StartTime,
            request.EndTime,
            request.TicketPrice,
            request.Capacity);

        var entity =
            await _eventRepository.GetByIdAsync(
                id,
                cancellationToken)
            ?? throw new KeyNotFoundException(
                "Event was not found.");

        var venue =
            await _venueRepository.GetByIdAsync(
                request.VenueId,
                cancellationToken)
            ?? throw new ArgumentException(
                "Selected venue does not exist.");

        _ =
            await _categoryRepository.GetByIdAsync(
                request.CategoryId,
                cancellationToken)
            ?? throw new ArgumentException(
                "Selected category does not exist.");

        if (request.Capacity >
            venue.TotalCapacity)
        {
            throw new InvalidOperationException(
                $"Event capacity cannot exceed venue capacity of {venue.TotalCapacity}.");
        }

        var hasBookings =
            await _eventRepository
                .HasActiveBookingsAsync(
                    id,
                    cancellationToken);

        
         // BRD safeguard:
         // price must not change after bookings exist.
         
        if (hasBookings &&
            request.TicketPrice != entity.TicketPrice)
        {
            throw new InvalidOperationException(
                "Ticket price cannot be changed because this event already has active bookings.");
        }

        
        // Finalized-screen safeguard.
          
        if (hasBookings &&
            request.Capacity != entity.Capacity)
        {
            throw new InvalidOperationException(
                "Event capacity cannot be changed because this event already has active bookings.");
        }

        if (hasBookings &&
            !string.Equals(
                request.StageLayout?.Trim(),
                entity.StageLayout,
                StringComparison.Ordinal))
        {
            throw new InvalidOperationException(
                "Stage/seat-layout basis cannot be changed because this event already has active bookings.");
        }

        var conflicts =
            await _venueRepository
                .GetScheduleConflictsAsync(
                    request.VenueId,
                    request.EventDate,
                    request.StartTime,
                    request.EndTime,
                    id,
                    cancellationToken);

        if (conflicts.Count > 0)
        {
            throw new InvalidOperationException(
                "The selected venue is not available during this date and time.");
        }

        var oldPoster =
            entity.PosterUrl;

        entity.Name =
            request.Name.Trim();

        entity.Description =
            string.IsNullOrWhiteSpace(
                request.Description)
                ? null
                : request.Description.Trim();

        entity.VenueId =
            request.VenueId;

        entity.CategoryId =
            request.CategoryId;

        entity.EventDate =
            request.EventDate;

        entity.StartTime =
            request.StartTime;

        entity.EndTime =
            request.EndTime;

        entity.TicketPrice =
            request.TicketPrice;

        entity.Capacity =
            request.Capacity;

        entity.StageLayout =
            string.IsNullOrWhiteSpace(
                request.StageLayout)
                ? null
                : request.StageLayout.Trim();

        entity.UpdatedAt =
            DateTime.UtcNow;

        if (request.Poster is not null)
        {
            entity.PosterUrl =
                await _posterStorage.SaveAsync(
                    request.Poster,
                    cancellationToken);
        }

        await _eventRepository.SaveChangesAsync(
            cancellationToken);

        if (request.Poster is not null)
        {
            await _posterStorage.DeleteIfLocalAsync(
                oldPoster,
                cancellationToken);
        }

        return await GetByIdAsync(
            id,
            cancellationToken);
    }

    public async Task DeleteAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity =
            await _eventRepository.GetByIdAsync(
                id,
                cancellationToken)
            ?? throw new KeyNotFoundException(
                "Event was not found.");

        if (await _eventRepository
            .HasActiveBookingsAsync(
                id,
                cancellationToken))
        {
            throw new InvalidOperationException(
                "This event cannot be deleted because it has active bookings.");
        }

        var poster =
            entity.PosterUrl;

        _eventRepository.Remove(entity);

        await _eventRepository.SaveChangesAsync(
            cancellationToken);

        await _posterStorage.DeleteIfLocalAsync(
            poster,
            cancellationToken);
    }
}