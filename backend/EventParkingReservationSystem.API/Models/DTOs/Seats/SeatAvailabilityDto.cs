namespace EventParkingReservationSystem.API.Models.DTOs.Seats;

public class SeatAvailabilityDto
{
    public int Id { get; set; }

    public string RowLabel { get; set; } = string.Empty;

    public int Number { get; set; }

    public string Status { get; set; } = string.Empty;
}