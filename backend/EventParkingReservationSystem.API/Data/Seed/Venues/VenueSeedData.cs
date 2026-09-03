using EventParkingReservationSystem.API.Models.Entities.Venues;

namespace EventParkingReservationSystem.API.Data.Seed.Venues;

public static class VenueSeedData
{
    public static Venue[] GetVenues() =>
    [
        new Venue
        {
            Id = 1,
            Name = "EventFlow Main Hall",
            Address = "Colombo, Sri Lanka",
            TotalCapacity = 1500,
            CreatedAt = new DateTime(
                2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(
                2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        }
    ];
}