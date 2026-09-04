using EventParkingReservationSystem.API.Enums.Bookings;
using EventParkingReservationSystem.API.Enums.Payments;

namespace EventParkingReservationSystem.API.Models.DTOs.Payments
{
    public class PaymentResultDto
    {
        public int PaymentId { get; set; }

        public int BookingId { get; set; }

        public string BookingNumber { get; set; } = string.Empty;

        public decimal AmountPaid { get; set; }

        public string Currency { get; set; } = "LKR";

        public PaymentMethod PaymentMethod { get; set; }

        public PaymentStatus PaymentStatus { get; set; }

        public BookingStatus BookingStatus { get; set; }

        public DateTime PaidAtUtc { get; set; }

        public string Message { get; set; } = string.Empty;
    }
}