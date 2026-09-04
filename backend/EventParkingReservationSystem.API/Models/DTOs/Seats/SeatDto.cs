namespace EventParkingReservationSystem.API.Models.DTOs.Seats;

public class SeatDto
{
    public int Id { get; set; }

    public int EventId { get; set; }

    public string RowLabel { get; set; } = string.Empty;

    public int Number { get; set; }

    public string Status { get; set; } = string.Empty;
}