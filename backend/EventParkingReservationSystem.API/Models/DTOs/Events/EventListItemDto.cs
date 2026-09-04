namespace EventParkingReservationSystem.API.Models.DTOs.Events;

public sealed class EventListItemDto
{
    public int Id { get; init; }

    public string Name { get; init; } = string.Empty;

    public string? PosterUrl { get; init; }

    public DateOnly EventDate { get; init; }

    public TimeOnly StartTime { get; init; }

    public TimeOnly EndTime { get; init; }

    public decimal TicketPrice { get; init; }

    public int VenueId { get; init; }

    public string VenueName { get; init; } = string.Empty;

    public int CategoryId { get; init; }

    public string CategoryName { get; init; } = string.Empty;

    public int? Capacity { get; init; }

    public int TotalSeats { get; init; }

    public int AvailableSeats { get; init; }

    public int BookedSeats { get; init; }

    public decimal SoldPercentage { get; init; }

    public bool HasBookings { get; init; }

    public bool CanDelete { get; init; }
}