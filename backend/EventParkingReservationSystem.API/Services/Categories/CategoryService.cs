using EventParkingReservationSystem.API.Interfaces.Repositories.Categories;
using EventParkingReservationSystem.API.Interfaces.Services.Categories;
using EventParkingReservationSystem.API.Mappings.Categories;
using EventParkingReservationSystem.API.Models.DTOs.Categories;
using EventParkingReservationSystem.API.Models.Entities.Categories;
using EventParkingReservationSystem.API.Validators.Categories;
using Microsoft.Extensions.Caching.Memory;

namespace EventParkingReservationSystem.API.Services.Categories;

public sealed class CategoryService(
    ICategoryRepository repository,
    IMemoryCache cache)
    : ICategoryService
{
    private const string CacheKey =
        "member2:event-categories";

    private readonly ICategoryRepository _repository =
        repository;

    private readonly IMemoryCache _cache =
        cache;

    public async Task<IReadOnlyList<CategoryDto>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        var categories =
            await _cache.GetOrCreateAsync(
                CacheKey,
                async entry =>
                {
                    entry.AbsoluteExpirationRelativeToNow =
                        TimeSpan.FromMinutes(10);

                    return await _repository.GetAllAsync(
                        cancellationToken);
                })
            ?? [];

        var result =
            new List<CategoryDto>(
                categories.Count);

        foreach (var category in categories)
        {
            var count =
                await _repository.GetEventCountAsync(
                    category.Id,
                    cancellationToken);

            result.Add(
                category.ToDto(count));
        }

        return result;
    }

    public async Task<CategoryDto> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var category =
            await _repository.GetByIdAsync(
                id,
                cancellationToken)
            ?? throw new KeyNotFoundException(
                "Category was not found.");

        var count =
            await _repository.GetEventCountAsync(
                id,
                cancellationToken);

        return category.ToDto(count);
    }

    public async Task<CategoryDto> CreateAsync(
        CreateCategoryDto request,
        CancellationToken cancellationToken = default)
    {
        CategoryValidator.Validate(request);

        var name = request.Name.Trim();

        if (await _repository.NameExistsAsync(
                name,
                cancellationToken: cancellationToken))
        {
            throw new InvalidOperationException(
                "A category with this name already exists.");
        }

        var category =
            new EventCategory
            {
                Name = name
            };

        await _repository.AddAsync(
            category,
            cancellationToken);

        await _repository.SaveChangesAsync(
            cancellationToken);

        _cache.Remove(CacheKey);

        return category.ToDto();
    }

    public async Task<CategoryDto> UpdateAsync(
        int id,
        UpdateCategoryDto request,
        CancellationToken cancellationToken = default)
    {
        CategoryValidator.Validate(request);

        var category =
            await _repository.GetByIdAsync(
                id,
                cancellationToken)
            ?? throw new KeyNotFoundException(
                "Category was not found.");

        var name = request.Name.Trim();

        if (await _repository.NameExistsAsync(
                name,
                id,
                cancellationToken))
        {
            throw new InvalidOperationException(
                "Another category already uses this name.");
        }

        category.Name = name;
        category.UpdatedAt = DateTime.UtcNow;

        await _repository.SaveChangesAsync(
            cancellationToken);

        _cache.Remove(CacheKey);

        var count =
            await _repository.GetEventCountAsync(
                id,
                cancellationToken);

        return category.ToDto(count);
    }

    public async Task DeleteAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var category =
            await _repository.GetByIdAsync(
                id,
                cancellationToken)
            ?? throw new KeyNotFoundException(
                "Category was not found.");

        if (await _repository.IsInUseAsync(
                id,
                cancellationToken))
        {
            throw new InvalidOperationException(
                "This category cannot be deleted because one or more events are using it.");
        }

        _repository.Remove(category);

        await _repository.SaveChangesAsync(
            cancellationToken);

        _cache.Remove(CacheKey);
    }
}