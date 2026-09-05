namespace EventParkingReservationSystem.API.Validators.Events;

public static class EventValidator
{
    public static void ValidateSchedule(
        DateOnly eventDate,
        TimeOnly startTime,
        TimeOnly endTime,
        decimal ticketPrice,
        int capacity)
    {
        if (endTime <= startTime)
            throw new ArgumentException(
                "End time must be after start time.");

        if (ticketPrice < 0)
            throw new ArgumentException(
                "Ticket price cannot be negative.");

        if (capacity <= 0)
            throw new ArgumentException(
                "Event capacity must be greater than zero.");

        var eventStart = DateTime.SpecifyKind(
            eventDate.ToDateTime(startTime),
            DateTimeKind.Utc);

        if (eventStart <= DateTime.UtcNow)
            throw new ArgumentException(
                "Event date and start time must be in the future.");
    }
}