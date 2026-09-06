namespace EventParkingReservationSystem.API.Models.DTOs.Seats;

public class SeatAvailabilityDto
{
    public int Id { get; set; }

    public string SeatCode { get; set; } = string.Empty;

    public string RowLabel { get; set; } = string.Empty;

    public int Number { get; set; }

    public int SectionId { get; set; }

    public string SectionCode { get; set; } = string.Empty;

    public string SectionName { get; set; } = string.Empty;

    public string CategoryCode { get; set; } = string.Empty;

    public string CategoryName { get; set; } = string.Empty;

    public decimal AdultPrice { get; set; }

    public decimal ChildPrice { get; set; }

    public bool IsPubliclyBookable { get; set; }

    public string Status { get; set; } = string.Empty;

    public decimal? PositionX { get; set; }

    public decimal? PositionY { get; set; }
}