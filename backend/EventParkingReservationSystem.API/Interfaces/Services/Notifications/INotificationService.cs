using EventParkingReservationSystem.API.Models.DTOs.Notifications;

namespace EventParkingReservationSystem.API.Interfaces.Services.Notifications
{
    public interface INotificationService
    {
        Task<IEnumerable<NotificationDto>> GetCustomerNotificationsAsync(
            int customerId);

        Task<int> GetUnreadCountAsync(
            int customerId);

        Task<bool> MarkAsReadAsync(
            int notificationId,
            int customerId);

        Task CreateNotificationAsync(
            int customerId,
            string title,
            string message);
    }
}