using EventParkingReservationSystem.API.Enums.Payments;
using EventParkingReservationSystem.API.Models.DTOs.Payments;
using EventParkingReservationSystem.API.Models.Entities.Bookings;
using EventParkingReservationSystem.API.Models.Entities.Payments;

namespace EventParkingReservationSystem.API.Mappings.Payments;

public static class PaymentMappings
{
    public static BookingPaymentDto ToBookingPaymentDto(
        this Booking booking,
        Payment? payment,
        decimal calculatedTotal)
    {
        return new BookingPaymentDto
        {
            BookingId = booking.BookingId,
            BookingNumber = booking.BookingNumber,
            AmountDue = payment?.Amount ?? calculatedTotal,
            Currency = payment?.Currency ?? "LKR",
            PaymentStatus =
                payment?.Status ?? PaymentStatus.Pending,
            BookingStatus = booking.BookingStatus,
            HoldExpiresAtUtc = booking.HoldExpiresAtUtc
        };
    }

    public static PaymentResultDto ToResultDto(
        this Payment payment,
        Booking booking,
        string message)
    {
        return new PaymentResultDto
        {
            PaymentId = payment.PaymentId,
            BookingId = payment.BookingId,
            BookingNumber = booking.BookingNumber,
            AmountPaid = payment.Amount,
            Currency = payment.Currency,
            PaymentMethod = payment.PaymentMethod,
            PaymentStatus = payment.Status,
            BookingStatus = booking.BookingStatus,
            PaidAtUtc =
                payment.PaidAtUtc ?? payment.CreatedAtUtc,
            Message = message
        };
    }

    public static PaymentHistoryDto ToHistoryDto(
        this Payment payment,
        string bookingNumber,
        string eventName)
    {
        return new PaymentHistoryDto
        {
            PaymentId = payment.PaymentId,
            BookingId = payment.BookingId,
            BookingNumber = bookingNumber,
            EventName = eventName,
            Amount = payment.Amount,
            Currency = payment.Currency,
            PaymentMethod = payment.PaymentMethod,
            Status = payment.Status,
            PaidAtUtc =
                payment.PaidAtUtc ?? payment.CreatedAtUtc
        };
    }

    public static PaymentReceiptDto ToReceiptDto(
        this Payment payment,
        string bookingNumber,
        string customerName,
        string eventName,
        DateTime eventDateTime,
        string venueName,
        decimal seatAmount,
        decimal parkingAmount)
    {
        return new PaymentReceiptDto
        {
            PaymentId = payment.PaymentId,
            BookingId = payment.BookingId,
            BookingNumber = bookingNumber,
            CustomerName = customerName,
            EventName = eventName,
            EventDateTime = eventDateTime,
            VenueName = venueName,
            SeatAmount = seatAmount,
            ParkingAmount = parkingAmount,
            TotalAmount = payment.Amount,
            Currency = payment.Currency,
            PaymentMethod = payment.PaymentMethod,
            PaymentStatus = payment.Status,
            PaidAtUtc =
                payment.PaidAtUtc ?? payment.CreatedAtUtc
        };
    }
}