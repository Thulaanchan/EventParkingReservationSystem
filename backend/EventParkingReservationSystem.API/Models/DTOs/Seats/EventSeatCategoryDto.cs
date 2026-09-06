namespace EventParkingReservationSystem.API.Models.DTOs.Seats;

public class EventSeatCategoryDto
{
    public int Id { get; set; }

    public int EventId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Code { get; set; } = string.Empty;

    public decimal AdultPrice { get; set; }

    public decimal ChildPrice { get; set; }

    public bool IsPubliclyBookable { get; set; }

    public int DisplayOrder { get; set; }
}