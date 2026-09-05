using EventParkingReservationSystem.API.Models.Entities.Categories;

namespace EventParkingReservationSystem.API.Interfaces.Repositories.Categories;

public interface ICategoryRepository
{
    Task<IReadOnlyList<EventCategory>> GetAllAsync(
        CancellationToken cancellationToken = default);

    Task<EventCategory?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<bool> NameExistsAsync(
        string name,
        int? excludingId = null,
        CancellationToken cancellationToken = default);

    Task<int> GetEventCountAsync(
        int categoryId,
        CancellationToken cancellationToken = default);

    Task<bool> IsInUseAsync(
        int categoryId,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        EventCategory category,
        CancellationToken cancellationToken = default);

    void Remove(EventCategory category);

    Task SaveChangesAsync(
        CancellationToken cancellationToken = default);
}