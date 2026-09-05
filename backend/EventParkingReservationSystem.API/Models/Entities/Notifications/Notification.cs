using System.ComponentModel.DataAnnotations;
using EventParkingReservationSystem.API.Models.Entities.Customers;

namespace EventParkingReservationSystem.API.Models.Entities.Notifications
{
    public class Notification
    {
        public int NotificationId { get; set; }

        public int CustomerId { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string Message { get; set; } = string.Empty;

        public bool IsRead { get; set; } = false;

        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

        public Customer Customer { get; set; } = null!;
    }
}