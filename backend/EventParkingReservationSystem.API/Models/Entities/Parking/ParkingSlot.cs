using EventParkingReservationSystem.API.Enums.Parking;

namespace EventParkingReservationSystem.API.Models.Entities.Parking;

public class ParkingSlot
{
    public int Id { get; set; }

    public int EventId { get; set; }

    public string SlotCode { get; set; } = string.Empty;

    public ParkingStatus Status { get; set; } = ParkingStatus.Available;
}