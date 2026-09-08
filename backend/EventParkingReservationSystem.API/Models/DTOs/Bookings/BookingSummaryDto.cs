using EventParkingReservationSystem.API.Enums.Bookings;

namespace EventParkingReservationSystem.API.Models.DTOs.Bookings;

public class BookingSummaryDto
{
    public int BookingId { get; set; }

    public string BookingNumber { get; set; }
        = string.Empty;

    public int CustomerId { get; set; }

    public int EventId { get; set; }

    public BookingStatus BookingStatus { get; set; }

    // ==============================
    // EVENT SUMMARY
    // ==============================
    public string EventName { get; set; }
        = string.Empty;

    public DateOnly? EventDate { get; set; }

    public TimeOnly? StartTime { get; set; }

    public string VenueName { get; set; }
        = string.Empty;

    public string? PosterUrl { get; set; }

    // ==============================
    // BOOKING SUMMARY
    // ==============================
    public int SeatCount { get; set; }

    public bool HasParking { get; set; }

    public decimal TotalAmount { get; set; }

    public DateTime HoldExpiresAtUtc { get; set; }

    public DateTime CreatedAt { get; set; }
}