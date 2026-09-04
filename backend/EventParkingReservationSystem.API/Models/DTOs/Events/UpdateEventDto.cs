using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace EventParkingReservationSystem.API.Models.DTOs.Events;

public sealed class UpdateEventDto
{
    [Required]
    [StringLength(180)]
    public string Name { get; set; } = string.Empty;

    [StringLength(3000)]
    public string? Description { get; set; }

    [Range(1, int.MaxValue)]
    public int VenueId { get; set; }

    [Range(1, int.MaxValue)]
    public int CategoryId { get; set; }

    public DateOnly EventDate { get; set; }

    public TimeOnly StartTime { get; set; }

    public TimeOnly EndTime { get; set; }

    [Range(typeof(decimal), "0", "999999999")]
    public decimal TicketPrice { get; set; }

    [Range(1, int.MaxValue)]
    public int Capacity { get; set; }

    [StringLength(100)]
    public string? StageLayout { get; set; }

    public IFormFile? Poster { get; set; }
}