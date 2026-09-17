using EventParkingReservationSystem.API.Models.Entities.Categories;

namespace EventParkingReservationSystem.API.Data.Seed.Categories;

public static class CategorySeedData
{
    public static EventCategory[] GetCategories() =>
    [
        new EventCategory
        {
            Id = 1,
            Name = "Concert",
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        },
        new EventCategory
        {
            Id = 2,
            Name = "Concerts & Music",
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        },
        new EventCategory
        {
            Id = 3,
            Name = "Sports & Fitness",
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        },
        new EventCategory
        {
            Id = 4,
            Name = "Theatre & Arts",
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        },
        new EventCategory
        {
            Id = 5,
            Name = "Conferences & Seminars",
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        },
        new EventCategory
        {
            Id = 6,
            Name = "Expos & Trade Shows",
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        }
    ];
}