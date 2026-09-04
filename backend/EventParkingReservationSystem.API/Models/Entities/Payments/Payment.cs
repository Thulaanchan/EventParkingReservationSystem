using EventParkingReservationSystem.API.Enums.Payments;

namespace EventParkingReservationSystem.API.Models.Entities.Payments
{
    public class Payment
    {
        public int PaymentId { get; set; }

        public int BookingId { get; set; }

        public decimal Amount { get; set; }

        public string Currency { get; set; } = "LKR";

        public PaymentMethod PaymentMethod { get; set; }

        public PaymentStatus Status { get; set; }

        public DateTime? PaidAtUtc { get; set; }

        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    }
}