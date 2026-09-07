namespace EventParkingReservationSystem.API.Models.DTOs.Seats;

public class SeatDto
{
    public int Id { get; set; }

    public int EventId { get; set; }

    public int SeatSectionId { get; set; }

    public string SeatCode { get; set; } = string.Empty;

    public string RowLabel { get; set; } = string.Empty;

    public int Number { get; set; }

    public string SectionCode { get; set; } = string.Empty;

    public string SectionName { get; set; } = string.Empty;

    public string CategoryCode { get; set; } = string.Empty;

    public string CategoryName { get; set; } = string.Empty;

    public decimal AdultPrice { get; set; }

    public decimal ChildPrice { get; set; }

    public bool IsPubliclyBookable { get; set; }

    public string Status { get; set; } = string.Empty;

    public int DisplayOrder { get; set; }

    public decimal? PositionX { get; set; }

    public decimal? PositionY { get; set; }
}