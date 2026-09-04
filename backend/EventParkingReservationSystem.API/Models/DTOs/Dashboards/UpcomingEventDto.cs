namespace EventParkingReservationSystem.API.Models.DTOs.Dashboards;

public sealed class UpcomingEventDto
{
    public int EventId { get; init; }

    public string EventName { get; init; } = string.Empty;

    public string VenueName { get; init; } = string.Empty;

    public DateOnly EventDate { get; init; }

    public TimeOnly StartTime { get; init; }

    public int TotalSeats { get; init; }

    public int BookedSeats { get; init; }

    public decimal OccupancyPercentage { get; init; }
}