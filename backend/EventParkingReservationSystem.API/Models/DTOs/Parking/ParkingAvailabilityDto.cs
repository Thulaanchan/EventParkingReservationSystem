namespace EventParkingReservationSystem.API.Models.DTOs.Parking;

public class ParkingAvailabilityDto
{
    public int Id { get; set; }

    public string SlotCode { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public int ZoneId { get; set; }

    public string ZoneName { get; set; } = string.Empty;

    public string VehicleType { get; set; } = string.Empty;

    public decimal Fee { get; set; }

    public bool IsOnlineBookable { get; set; }

    public decimal? PositionX { get; set; }

    public decimal? PositionY { get; set; }
}