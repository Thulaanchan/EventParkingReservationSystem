namespace EventParkingReservationSystem.API.Models.DTOs.Parking;

public class ParkingSlotDto
{
    public int Id { get; set; }

    public int EventId { get; set; }

    public string SlotCode { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;
}