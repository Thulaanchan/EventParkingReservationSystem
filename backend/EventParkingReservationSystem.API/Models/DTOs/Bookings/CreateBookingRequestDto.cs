using System.ComponentModel.DataAnnotations;
using EventParkingReservationSystem.API.Models.DTOs.Seats;

namespace EventParkingReservationSystem.API.Models.DTOs.Bookings;

public class CreateBookingRequestDto
{
    [Range(
        1,
        int.MaxValue,
        ErrorMessage = "A valid event must be selected.")]
    public int EventId { get; set; }

    [Required]
    [MinLength(
        1,
        ErrorMessage = "At least one seat must be selected.")]
    public List<SeatSelectionRequest> Seats { get; set; }
        = new();

    [Range(
        1,
        int.MaxValue,
        ErrorMessage = "Invalid parking slot.")]
    public int? ParkingSlotId { get; set; }
}