namespace EventParkingReservationSystem.API.Models.Entities.Categories;

public class EventCategory
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Models.Entities.Events.Event> Events { get; set; }
        = new List<Models.Entities.Events.Event>();
}