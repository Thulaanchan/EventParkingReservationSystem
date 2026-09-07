using EventParkingReservationSystem.API.Models.DTOs.Categories;

namespace EventParkingReservationSystem.API.Interfaces.Services.Categories;

public interface ICategoryService
{
    Task<IReadOnlyList<CategoryDto>> GetAllAsync(
        CancellationToken cancellationToken = default);

    Task<CategoryDto> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<CategoryDto> CreateAsync(
        CreateCategoryDto request,
        CancellationToken cancellationToken = default);

    Task<CategoryDto> UpdateAsync(
        int id,
        UpdateCategoryDto request,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        int id,
        CancellationToken cancellationToken = default);
}