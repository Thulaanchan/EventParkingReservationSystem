using EventParkingReservationSystem.API.Models.DTOs.Categories;
using EventParkingReservationSystem.API.Models.Entities.Categories;

namespace EventParkingReservationSystem.API.Mappings.Categories;

public static class CategoryMappings
{
    public static CategoryDto ToDto(
        this EventCategory category,
        int eventCount = 0)
    {
        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            EventCount = eventCount
        };
    }
}