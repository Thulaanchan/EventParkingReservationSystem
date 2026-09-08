namespace EventParkingReservationSystem.API.Models.DTOs.Bookings;

public class BookingEventDetailDto
{
    public int EventId { get; set; }

    public string EventName { get; set; }
        = string.Empty;

    public string? Description { get; set; }

    public DateOnly EventDate { get; set; }

    public TimeOnly StartTime { get; set; }

    public TimeOnly EndTime { get; set; }

    public string VenueName { get; set; }
        = string.Empty;

    public string CategoryName { get; set; }
        = string.Empty;

    public string? PosterUrl { get; set; }
}