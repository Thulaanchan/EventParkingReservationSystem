namespace EventParkingReservationSystem.API.Models.Entities.ParkingReservations;

public class ParkingReservation
{
    public int Id { get; set; }

    public int BookingId { get; set; }

    public int ParkingSlotId { get; set; }

    public DateTime ReservedAtUtc { get; set; } = DateTime.UtcNow;
}