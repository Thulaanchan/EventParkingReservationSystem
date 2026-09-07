using System.ComponentModel.DataAnnotations;

namespace EventParkingReservationSystem.API.Models.DTOs.Seats;

public class CreateEventSeatCategoryRequest
{
    [Required]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(10)]
    public string Code { get; set; } = string.Empty;

    [Range(0, double.MaxValue)]
    public decimal AdultPrice { get; set; }

    public bool IsPubliclyBookable { get; set; } = true;

    [Range(0, int.MaxValue)]
    public int DisplayOrder { get; set; }
}