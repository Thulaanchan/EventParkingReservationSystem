namespace EventParkingReservationSystem.API.Models.DTOs.Categories;

public sealed class CategoryDto
{
    public int Id { get; init; }

    public string Name { get; init; } = string.Empty;

    public int EventCount { get; init; }
}