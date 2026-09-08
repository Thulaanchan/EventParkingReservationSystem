using EventParkingReservationSystem.API.Models.DTOs.Notifications;
using EventParkingReservationSystem.API.Models.Entities.Notifications;

namespace EventParkingReservationSystem.API.Mappings.Notifications;

public static class NotificationMappings
{
    public static NotificationDto ToDto(
        this Notification notification)
    {
        return new NotificationDto
        {
            NotificationId = notification.NotificationId,
            Title = notification.Title,
            Message = notification.Message,
            IsRead = notification.IsRead,
            CreatedAtUtc = notification.CreatedAtUtc
        };
    }
}