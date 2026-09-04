using EventParkingReservationSystem.API.Enums.Bookings;
using EventParkingReservationSystem.API.Enums.Payments;

namespace EventParkingReservationSystem.API.Models.DTOs.Payments
{
    public class BookingPaymentDto
    {
        public int BookingId { get; set; }

        public string BookingNumber { get; set; } = string.Empty;

        public decimal AmountDue { get; set; }

        public string Currency { get; set; } = "LKR";

        public PaymentStatus PaymentStatus { get; set; }

        public BookingStatus BookingStatus { get; set; }

        public DateTime? HoldExpiresAtUtc { get; set; }

        public bool IsExpired =>
            BookingStatus == BookingStatus.Expired ||
            (HoldExpiresAtUtc.HasValue &&
             HoldExpiresAtUtc.Value <= DateTime.UtcNow);

        public bool CanPay =>
            BookingStatus == BookingStatus.Pending &&
            PaymentStatus != PaymentStatus.Completed &&
            !IsExpired;
    }
}