using System.ComponentModel.DataAnnotations;

namespace EventParkingReservationSystem.API.Models.DTOs.Parking;

public class CreateParkingSlotRequest
{
    [Required]
    [MaxLength(30)]
    public string SlotCode { get; set; } = string.Empty;
}