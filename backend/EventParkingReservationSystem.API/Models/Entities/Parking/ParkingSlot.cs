using EventParkingReservationSystem.API.Enums.Parking;
using EventParkingReservationSystem.API.Models.Entities.Events;

namespace EventParkingReservationSystem.API.Models.Entities.Parking;

public class ParkingSlot
{
    public int Id { get; set; }

    public int EventId { get; set; }

    public int ParkingZoneId { get; set; }

    public string SlotCode { get; set; } = string.Empty;

    public ParkingStatus Status { get; set; }
        = ParkingStatus.Available;

    public int DisplayOrder { get; set; }

    public decimal? PositionX { get; set; }

    public decimal? PositionY { get; set; }

    public Event Event { get; set; } = null!;

    public ParkingZone ParkingZone { get; set; } = null!;
}