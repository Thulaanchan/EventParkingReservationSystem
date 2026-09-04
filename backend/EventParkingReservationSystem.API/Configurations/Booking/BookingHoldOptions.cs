namespace EventParkingReservationSystem.API.Configurations.Booking;

public sealed class BookingHoldOptions
{
    public const string SectionName = "Booking";

    public int HoldDurationMinutes { get; set; } = 15;
}