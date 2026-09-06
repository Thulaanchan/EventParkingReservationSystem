using EventParkingReservationSystem.API.Enums.Parking;
using EventParkingReservationSystem.API.Models.Entities.Bookings;
using EventParkingReservationSystem.API.Models.Entities.Parking;

namespace EventParkingReservationSystem.API.Models.Entities.ParkingReservations;

public class ParkingReservation
{
    public int Id { get; set; }

    public int BookingId { get; set; }

    public int ParkingSlotId { get; set; }

    // Preserve the parking fee charged at the time of reservation.
    public decimal FeeSnapshot { get; set; }

    // Preserve what vehicle type was used when this reservation was made.
    public VehicleType VehicleTypeSnapshot { get; set; }

    // Preserve the zone name used at booking time.
    public string ZoneNameSnapshot { get; set; } = string.Empty;

    public DateTime ReservedAtUtc { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Booking Booking { get; set; } = null!;

    public ParkingSlot ParkingSlot { get; set; } = null!;
}