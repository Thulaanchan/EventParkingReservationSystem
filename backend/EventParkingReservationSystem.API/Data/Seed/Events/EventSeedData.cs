using EventParkingReservationSystem.API.Models.Entities.Events;

namespace EventParkingReservationSystem.API.Data.Seed.Events;

public static class EventSeedData
{
    public static Event[] GetEvents() =>
    [
        new Event
        {
            Id = 1,
            Name = "EventFlow Demo Concert",
            Description = "Demo event for development and testing.",
            VenueId = 1,
            CategoryId = 1,
            EventDate = new DateOnly(2030, 1, 20),
            StartTime = new TimeOnly(18, 0),
            EndTime = new TimeOnly(22, 0),
            TicketPrice = 5000m,
            Capacity = 1000,
            StageLayout = "Standard",
            PosterUrl = null,
            CreatedAt = new DateTime(
                2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(
                2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        }
    ];
}