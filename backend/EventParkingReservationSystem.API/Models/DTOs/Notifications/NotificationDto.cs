namespace EventParkingReservationSystem.API.Models.DTOs.Notifications
{
    public class NotificationDto
    {
        public int NotificationId { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Message { get; set; } = string.Empty;

        public bool IsRead { get; set; }

        public DateTime CreatedAtUtc { get; set; }
    }
}