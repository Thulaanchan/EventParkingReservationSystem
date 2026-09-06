using System.ComponentModel.DataAnnotations;

namespace EventParkingReservationSystem.API.Models.DTOs.Parking;

public class CreateParkingSlotRequest
{
    [Range(1, int.MaxValue)]
    public int ParkingZoneId { get; set; }

    [Required]
    [MaxLength(30)]
    public string SlotCode { get; set; } = string.Empty;

    [Range(0, int.MaxValue)]
    public int DisplayOrder { get; set; }

    public decimal? PositionX { get; set; }

    public decimal? PositionY { get; set; }
}