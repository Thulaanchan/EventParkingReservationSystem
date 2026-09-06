using EventParkingReservationSystem.API.Enums.Bookings;
using EventParkingReservationSystem.API.Models.Entities.Seats;

namespace EventParkingReservationSystem.API.Models.Entities.Bookings
{
    public class BookingSeat
    {
        public int Id { get; set; }

        public int BookingId { get; set; }

        public int SeatId { get; set; }

        public string AttendeeName { get; set; } = string.Empty;

        public AttendeeType AttendeeType { get; set; }

        public decimal PriceSnapshot { get; set; }

        public DateTime CreatedAtUtc { get; set; }
            = DateTime.UtcNow;

        public Booking Booking { get; set; } = null!;

        public Seat Seat { get; set; } = null!;
    }
}
