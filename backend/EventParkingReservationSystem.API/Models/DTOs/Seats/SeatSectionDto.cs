namespace EventParkingReservationSystem.API.Models.DTOs.Seats;

public class SeatSectionDto
{
    public int Id { get; set; }

    public int EventId { get; set; }

    public int EventSeatCategoryId { get; set; }

    public string Code { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string CategoryName { get; set; } = string.Empty;

    public int DisplayOrder { get; set; }

    public int SeatCount { get; set; }
}