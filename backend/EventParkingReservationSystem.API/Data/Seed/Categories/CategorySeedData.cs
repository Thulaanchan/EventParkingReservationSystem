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
            CreatedAt = new DateTime(
                2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(
                2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        }
    ];
}