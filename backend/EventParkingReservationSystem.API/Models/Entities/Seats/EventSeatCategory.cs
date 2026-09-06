using EventParkingReservationSystem.API.Models.Entities.Events;

namespace EventParkingReservationSystem.API.Models.Entities.Seats
{
    public class EventSeatCategory
    {
        public int Id { get; set; }

        public int EventId { get; set; }

        public string Name { get; set; } = string.Empty;
        // VIP, Platinum, Gold, Silver

        public decimal AdultPrice { get; set; }

        public bool IsPubliclyBookable { get; set; } = true;

        public int DisplayOrder { get; set; }

        public Event Event { get; set; } = null!;

        public ICollection<SeatSection> Sections { get; set; }
            = new List<SeatSection>();
    }
}
