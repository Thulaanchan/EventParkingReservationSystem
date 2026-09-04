using System.ComponentModel.DataAnnotations;

namespace EventParkingReservationSystem.API.Models.DTOs.Seats;

public class ReserveSeatsRequest
{
    [Required]
    [MinLength(1)]
    public List<int> SeatIds { get; set; } = new();
}