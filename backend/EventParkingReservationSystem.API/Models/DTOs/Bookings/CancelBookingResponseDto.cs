using EventParkingReservationSystem.API.Enums.Bookings;

namespace EventParkingReservationSystem.API.Models.DTOs.Bookings;

public class CancelBookingResponseDto
{
    public int BookingId { get; set; }

    public string BookingNumber { get; set; } = string.Empty;

    public BookingStatus BookingStatus { get; set; }

    public string Message { get; set; } = string.Empty;
}