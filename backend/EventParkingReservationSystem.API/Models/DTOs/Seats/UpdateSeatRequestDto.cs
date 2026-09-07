using System.ComponentModel.DataAnnotations;

namespace EventParkingReservationSystem.API.Models.DTOs.Seats;

public class UpdateSeatRequest
{
    [Range(1, int.MaxValue)]
    public int SeatSectionId { get; set; }

    [Required]
    [MaxLength(20)]
    public string RowLabel { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int Number { get; set; }

    [Range(0, int.MaxValue)]
    public int DisplayOrder { get; set; }

    public decimal? PositionX { get; set; }

    public decimal? PositionY { get; set; }
}