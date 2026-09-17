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
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        },
        new Venue
        {
            Id = 2,
            Name = "Unicom TIC",
            Address = "A9 Road, Jaffna, Sri Lanka",
            TotalCapacity = 2500,
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        },
        new Venue
        {
            Id = 3,
            Name = "Sugathadasa Indoor Stadium",
            Address = "Prince of Wales Ave, Colombo 14, Sri Lanka",
            TotalCapacity = 5000,
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        },
        new Venue
        {
            Id = 4,
            Name = "Nelum Pokuna Mahinda Rajapaksa Theatre",
            Address = "110 Ananda Coomaraswamy Mawatha, Colombo 07, Sri Lanka",
            TotalCapacity = 1288,
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        },
        new Venue
        {
            Id = 5,
            Name = "BMICH, Colombo",
            Address = "Bauddhaloka Mawatha, Colombo 07, Sri Lanka",
            TotalCapacity = 3000,
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        },
        new Venue
        {
            Id = 6,
            Name = "Cinnamon Life, Colombo",
            Address = "1 Justice Akbar Mawatha, Colombo 02, Sri Lanka",
            TotalCapacity = 1500,
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        },
        new Venue
        {
            Id = 7,
            Name = "Jaffna Cultural Centre",
            Address = "Mahatma Gandhi Road, Jaffna, Sri Lanka",
            TotalCapacity = 1000,
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        }
    ];
}