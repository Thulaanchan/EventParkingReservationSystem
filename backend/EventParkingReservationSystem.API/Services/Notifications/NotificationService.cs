using EventParkingReservationSystem.API.Interfaces.Repositories.Notifications;
using EventParkingReservationSystem.API.Interfaces.Services.Notifications;
using EventParkingReservationSystem.API.Models.DTOs.Notifications;
using EventParkingReservationSystem.API.Models.Entities.Notifications;

namespace EventParkingReservationSystem.API.Services.Notifications
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _notificationRepository;

        public NotificationService(
            INotificationRepository notificationRepository)
        {
            _notificationRepository = notificationRepository;
        }

        public async Task<IEnumerable<NotificationDto>>
            GetCustomerNotificationsAsync(int customerId)
        {
            var notifications =
                await _notificationRepository.GetByCustomerIdAsync(customerId);

            return notifications.Select(n => new NotificationDto
            {
                NotificationId = n.NotificationId,
                Title = n.Title,
                Message = n.Message,
                IsRead = n.IsRead,
                CreatedAtUtc = n.CreatedAtUtc
            });
        }

        public async Task<int> GetUnreadCountAsync(int customerId)
        {
            return await _notificationRepository
                .GetUnreadCountAsync(customerId);
        }

        public async Task<bool> MarkAsReadAsync(
            int notificationId,
            int customerId)
        {
            var notification =
                await _notificationRepository.GetByIdAsync(notificationId);

            if (notification == null)
                return false;

            if (notification.CustomerId != customerId)
                return false;

            if (notification.IsRead)
                return true;

            notification.IsRead = true;

            await _notificationRepository.UpdateAsync(notification);
            await _notificationRepository.SaveChangesAsync();

            return true;
        }

        public async Task CreateNotificationAsync(
            int customerId,
            string title,
            string message)
        {
            if (string.IsNullOrWhiteSpace(title))
                throw new ArgumentException(
                    "Notification title is required.",
                    nameof(title));

            if (string.IsNullOrWhiteSpace(message))
                throw new ArgumentException(
                    "Notification message is required.",
                    nameof(message));

            var notification = new Notification
            {
                CustomerId = customerId,
                Title = title.Trim(),
                Message = message.Trim(),
                IsRead = false,
                CreatedAtUtc = DateTime.UtcNow
            };

            await _notificationRepository.AddAsync(notification);
            await _notificationRepository.SaveChangesAsync();
        }
    }
}