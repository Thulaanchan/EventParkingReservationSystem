using EventParkingReservationSystem.API.Models.Entities.Events;

namespace EventParkingReservationSystem.API.Models.Entities.Seats
{
    public class SeatSection
    {
        public int Id { get; set; }

        public int EventId { get; set; }

        public int EventSeatCategoryId { get; set; }

        public string Code { get; set; } = string.Empty;
        // N1, NE1, E1, S1 etc.

        public string Name { get; set; } = string.Empty;

        public int DisplayOrder { get; set; }

        public Event Event { get; set; } = null!;

        public EventSeatCategory SeatCategory { get; set; } = null!;

        public ICollection<Seat> Seats { get; set; }
            = new List<Seat>();
    }
}
