using EventParkingReservationSystem.API.Enums.Bookings;

namespace EventParkingReservationSystem.API.Models.DTOs.Bookings;

public class BookingDto
{
    public int BookingId { get; set; }

    public string BookingNumber { get; set; }
        = string.Empty;

    public int CustomerId { get; set; }

    public int EventId { get; set; }

    public BookingStatus BookingStatus { get; set; }

    public DateTime HoldExpiresAtUtc { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    // Full event information for booking-details screen.
    public BookingEventDetailDto? Event { get; set; }

    // One booking must contain one or more seats.
    public List<BookingSeatDetailDto> Seats { get; set; }
        = new();

    // Parking is optional.
    public BookingParkingDetailDto? Parking { get; set; }

    // Calculated from seat price snapshots
    // + optional parking fee snapshot.
    public decimal TotalAmount { get; set; }
}