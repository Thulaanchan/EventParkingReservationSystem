using EventParkingReservationSystem.API.Enums.Seats;
using EventParkingReservationSystem.API.Models.Entities.Events;

namespace EventParkingReservationSystem.API.Models.Entities.Seats;

public class Seat
{
    public int Id { get; set; }

    public int EventId { get; set; }

    public int SeatSectionId { get; set; }

    public string RowLabel { get; set; } = string.Empty;

    public int Number { get; set; }

    public string SeatCode { get; set; } = string.Empty;

    public SeatStatus Status { get; set; }
        = SeatStatus.Available;

    public int DisplayOrder { get; set; }

    public decimal? PositionX { get; set; }

    public decimal? PositionY { get; set; }

    public Event Event { get; set; } = null!;

    public SeatSection Section { get; set; } = null!;
}