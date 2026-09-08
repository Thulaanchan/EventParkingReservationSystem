using System.ComponentModel.DataAnnotations;
using EventParkingReservationSystem.API.Enums.Bookings;

namespace EventParkingReservationSystem.API.Models.DTOs.Seats;

public class SeatSelectionRequest
{
    [Range(1, int.MaxValue)]
    public int SeatId { get; set; }

    [Required]
    public AttendeeType AttendeeType { get; set; }

    [Required]
    [MaxLength(100)]
    public string AttendeeName { get; set; }
        = string.Empty;
}