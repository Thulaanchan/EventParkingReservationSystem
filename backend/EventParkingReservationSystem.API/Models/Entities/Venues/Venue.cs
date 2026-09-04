<<<<<<< HEAD
﻿namespace EventParkingReservationSystem.API.Models.Entities.Venues;

public class Venue
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public int TotalCapacity { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Models.Entities.Events.Event> Events { get; set; }
        = new List<Models.Entities.Events.Event>();
}
=======
﻿namespace EventParkingReservationSystem.API.Models.Entities.Venues
{
    public class Venue
    {
    }
}
>>>>>>> 1ab0d77b5954dfd2c2db8b36cfda8232aec1a478
