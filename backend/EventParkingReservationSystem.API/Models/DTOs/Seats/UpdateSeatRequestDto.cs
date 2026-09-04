using System.ComponentModel.DataAnnotations;

namespace EventParkingReservationSystem.API.Models.DTOs.Seats;

public class UpdateSeatRequest
{
    [Required]
    [MaxLength(20)]
    public string RowLabel { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int Number { get; set; }
}