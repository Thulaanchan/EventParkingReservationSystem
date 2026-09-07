using EventParkingReservationSystem.API.Models.Entities.Events;
using EventParkingReservationSystem.API.Enums.Parking;

namespace EventParkingReservationSystem.API.Models.Entities.Parking
{
    public class ParkingZone
    {
        public int Id { get; set; }

        public int EventId { get; set; }

        public string Name { get; set; } = string.Empty;

        public VehicleType VehicleType { get; set; }

        public decimal Fee { get; set; }

        public bool IsOnlineBookable { get; set; } = true;

        public int DisplayOrder { get; set; }

        public Event Event { get; set; } = null!;

        public ICollection<ParkingSlot> ParkingSlots { get; set; }
            = new List<ParkingSlot>();
    }
}
