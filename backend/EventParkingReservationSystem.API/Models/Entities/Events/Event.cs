using EventParkingReservationSystem.API.Models.Entities.Categories;
using EventParkingReservationSystem.API.Models.Entities.Venues;

namespace EventParkingReservationSystem.API.Models.Entities.Events;

public class Event
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public int VenueId { get; set; }

    public int CategoryId { get; set; }

    public DateOnly EventDate { get; set; }

    public TimeOnly StartTime { get; set; }

    public TimeOnly EndTime { get; set; }

    public decimal TicketPrice { get; set; }

    public int? Capacity { get; set; }

    public string? StageLayout { get; set; }

    public string? PosterUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Venue Venue { get; set; } = null!;

    public EventCategory Category { get; set; } = null!;
}
