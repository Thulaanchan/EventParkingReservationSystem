namespace EventParkingReservationSystem.API.Models.DTOs.Venues;

public sealed class VenueDto
{
    public int Id { get; init; }

    public string Name { get; init; } = string.Empty;

    public string Address { get; init; } = string.Empty;

    public int TotalCapacity { get; init; }

    public int UpcomingEventCount { get; init; }
}