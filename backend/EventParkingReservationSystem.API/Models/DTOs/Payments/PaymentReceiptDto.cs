using EventParkingReservationSystem.API.Enums.Payments;

namespace EventParkingReservationSystem.API.Models.DTOs.Payments
{
    public class PaymentReceiptDto
    {
        public int PaymentId { get; set; }

        public int BookingId { get; set; }

        public string BookingNumber { get; set; } = string.Empty;

        public string CustomerName { get; set; } = string.Empty;

        public string EventName { get; set; } = string.Empty;

        public DateTime EventDateTime { get; set; }

        public string VenueName { get; set; } = string.Empty;

        public decimal SeatAmount { get; set; }

        public decimal ParkingAmount { get; set; }

        public decimal TotalAmount { get; set; }

        public string Currency { get; set; } = "LKR";

        public PaymentMethod PaymentMethod { get; set; }

        public PaymentStatus PaymentStatus { get; set; }

        public DateTime PaidAtUtc { get; set; }
    }
}