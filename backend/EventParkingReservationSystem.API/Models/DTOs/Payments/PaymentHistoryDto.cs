using EventParkingReservationSystem.API.Enums.Payments;

namespace EventParkingReservationSystem.API.Models.DTOs.Payments
{
    public class PaymentHistoryDto
    {
        public int PaymentId { get; set; }

        public int BookingId { get; set; }

        public string BookingNumber { get; set; } = string.Empty;

        public string EventName { get; set; } = string.Empty;

        public decimal Amount { get; set; }

        public string Currency { get; set; } = "LKR";

        public PaymentMethod PaymentMethod { get; set; }

        public PaymentStatus Status { get; set; }

        public DateTime PaidAtUtc { get; set; }

        public bool ReceiptAvailable =>
            Status == PaymentStatus.Completed;
    }
}