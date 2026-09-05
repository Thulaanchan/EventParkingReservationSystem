using EventParkingReservationSystem.API.Models.Entities.Notifications;

namespace EventParkingReservationSystem.API.Interfaces.Repositories.Notifications
{
    public interface INotificationRepository
    {
        Task<Notification?> GetByIdAsync(int notificationId);

        Task<IEnumerable<Notification>> GetByCustomerIdAsync(int customerId);

        Task<int> GetUnreadCountAsync(int customerId);

        Task AddAsync(Notification notification);

        Task UpdateAsync(Notification notification);

        Task SaveChangesAsync();
    }
}