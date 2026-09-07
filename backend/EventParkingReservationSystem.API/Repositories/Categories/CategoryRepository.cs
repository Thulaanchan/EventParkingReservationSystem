using EventParkingReservationSystem.API.Data.Context;
using EventParkingReservationSystem.API.Interfaces.Repositories.Categories;
using EventParkingReservationSystem.API.Models.Entities.Categories;
using Microsoft.EntityFrameworkCore;

namespace EventParkingReservationSystem.API.Repositories.Categories;

public sealed class CategoryRepository(
    ApplicationDbContext context) : ICategoryRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task<IReadOnlyList<EventCategory>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        return await _context.EventCategories
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);
    }

    public Task<EventCategory?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return _context.EventCategories
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);
    }

    public Task<bool> NameExistsAsync(
        string name,
        int? excludingId = null,
        CancellationToken cancellationToken = default)
    {
        var normalized = name.Trim().ToUpper();

        return _context.EventCategories.AnyAsync(
            x =>
                x.Name.ToUpper() == normalized &&
                (!excludingId.HasValue ||
                 x.Id != excludingId.Value),
            cancellationToken);
    }

    public Task<int> GetEventCountAsync(
        int categoryId,
        CancellationToken cancellationToken = default)
    {
        return _context.Events.CountAsync(
            x => x.CategoryId == categoryId,
            cancellationToken);
    }

    public Task<bool> IsInUseAsync(
        int categoryId,
        CancellationToken cancellationToken = default)
    {
        return _context.Events.AnyAsync(
            x => x.CategoryId == categoryId,
            cancellationToken);
    }

    public async Task AddAsync(
        EventCategory category,
        CancellationToken cancellationToken = default)
    {
        await _context.EventCategories.AddAsync(
            category,
            cancellationToken);
    }

    public void Remove(EventCategory category)
    {
        _context.EventCategories.Remove(category);
    }

    public Task SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        return _context.SaveChangesAsync(
            cancellationToken);
    }
}