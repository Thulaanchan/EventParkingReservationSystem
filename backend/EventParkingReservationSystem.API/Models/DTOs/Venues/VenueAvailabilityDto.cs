namespace EventParkingReservationSystem.API.Models.DTOs.Venues;

public sealed class VenueAvailabilityDto
{
    public int VenueId { get; init; }

    public DateOnly Date { get; init; }

    public TimeOnly StartTime { get; init; }

    public TimeOnly EndTime { get; init; }

    public bool IsAvailable { get; init; }

    public IReadOnlyList<VenueAvailabilityConflictDto> Conflicts
    { get; init; } = [];
}

public sealed class VenueAvailabilityConflictDto
{
    public int EventId { get; init; }

    public string EventName { get; init; } = string.Empty;

    public TimeOnly StartTime { get; init; }

    public TimeOnly EndTime { get; init; }
}