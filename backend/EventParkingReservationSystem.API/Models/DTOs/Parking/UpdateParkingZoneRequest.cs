using System.ComponentModel.DataAnnotations;
using EventParkingReservationSystem.API.Enums.Parking;

namespace EventParkingReservationSystem.API.Models.DTOs.Parking;

public class UpdateParkingZoneRequest
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public VehicleType VehicleType { get; set; }

    [Range(0, double.MaxValue)]
    public decimal Fee { get; set; }

    public bool IsOnlineBookable { get; set; }

    [Range(0, int.MaxValue)]
    public int DisplayOrder { get; set; }
}