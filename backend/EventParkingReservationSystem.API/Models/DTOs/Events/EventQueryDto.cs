using System.ComponentModel.DataAnnotations;

namespace EventParkingReservationSystem.API.Models.DTOs.Events;

public sealed class EventQueryDto
{
    public string? Search { get; set; }

    public int? Venue { get; set; }

    public int? Category { get; set; }

    public DateOnly? Date { get; set; }

    public TimeOnly? Time { get; set; }

    [Range(1, int.MaxValue)]
    public int Page { get; set; } = 1;

    [Range(1, 100)]
    public int PageSize { get; set; } = 12;

    public bool IncludePast { get; set; }
}