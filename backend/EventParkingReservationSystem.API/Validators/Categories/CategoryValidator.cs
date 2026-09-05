using EventParkingReservationSystem.API.Models.DTOs.Categories;

namespace EventParkingReservationSystem.API.Validators.Categories;

public static class CategoryValidator
{
    public static void Validate(CreateCategoryDto request)
    {
        ValidateName(request.Name);
    }

    public static void Validate(UpdateCategoryDto request)
    {
        ValidateName(request.Name);
    }

    private static void ValidateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Category name is required.");
    }
}