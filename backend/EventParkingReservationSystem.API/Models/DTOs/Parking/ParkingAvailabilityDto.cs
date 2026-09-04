namespace EventParkingReservationSystem.API.Models.DTOs.Parking;

public class ParkingAvailabilityDto
{
    public int Id { get; set; }

    public string SlotCode { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;
}