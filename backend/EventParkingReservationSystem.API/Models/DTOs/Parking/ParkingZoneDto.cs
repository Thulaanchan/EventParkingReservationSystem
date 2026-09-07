namespace EventParkingReservationSystem.API.Models.DTOs.Parking;

public class ParkingZoneDto
{
    public int Id { get; set; }

    public int EventId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string VehicleType { get; set; } = string.Empty;

    public decimal Fee { get; set; }

    public bool IsOnlineBookable { get; set; }

    public int DisplayOrder { get; set; }

    public int SlotCount { get; set; }
}