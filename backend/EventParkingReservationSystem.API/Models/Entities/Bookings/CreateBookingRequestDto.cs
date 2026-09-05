using System.ComponentModel.DataAnnotations;

namespace EventParkingReservationSystem.API.Models.DTOs.Bookings;

public class CreateBookingRequestDto
{
    [Required]
    public int EventId { get; set; }

    [Required]
    [MinLength(1, ErrorMessage = "At least one seat must be selected.")]
    public List<int> SeatIds { get; set; } = new();

    public int? ParkingSlotId { get; set; }
}