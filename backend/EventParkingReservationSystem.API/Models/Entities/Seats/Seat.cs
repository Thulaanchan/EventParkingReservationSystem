using EventParkingReservationSystem.API.Enums.Seats;

namespace EventParkingReservationSystem.API.Models.Entities.Seats;

public class Seat
{
    public int Id { get; set; }

    public int EventId { get; set; }

    public string RowLabel { get; set; } = string.Empty;

    public int Number { get; set; }

    public SeatStatus Status { get; set; } = SeatStatus.Available;
}