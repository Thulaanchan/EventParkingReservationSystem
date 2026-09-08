using EventParkingReservationSystem.API.Enums.Bookings;

namespace EventParkingReservationSystem.API.Models.DTOs.Bookings;

public class BookingSeatDetailDto
{
    public int SeatId { get; set; }

    public string SeatCode { get; set; }
        = string.Empty;

    public string RowLabel { get; set; }
        = string.Empty;

    public int SeatNumber { get; set; }

    public string SectionName { get; set; }
        = string.Empty;

    public string AttendeeName { get; set; }
        = string.Empty;

    public AttendeeType AttendeeType { get; set; }

    public decimal PriceSnapshot { get; set; }
}