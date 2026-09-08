using EventParkingReservationSystem.API.Enums.Parking;

namespace EventParkingReservationSystem.API.Models.DTOs.Bookings;

public class BookingParkingDetailDto
{
    public int ParkingReservationId { get; set; }

    public int ParkingSlotId { get; set; }

    public string SlotCode { get; set; }
        = string.Empty;

    public string ZoneName { get; set; }
        = string.Empty;

    public VehicleType VehicleType { get; set; }

    public decimal FeeSnapshot { get; set; }

    public DateTime ReservedAtUtc { get; set; }
}