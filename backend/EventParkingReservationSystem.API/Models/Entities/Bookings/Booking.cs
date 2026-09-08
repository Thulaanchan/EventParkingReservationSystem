using System.ComponentModel.DataAnnotations;
using EventParkingReservationSystem.API.Enums.Bookings;
using EventParkingReservationSystem.API.Models.Entities.Customers;
using EventParkingReservationSystem.API.Models.Entities.Events;
using EventParkingReservationSystem.API.Models.Entities.ParkingReservations;

namespace EventParkingReservationSystem.API.Models.Entities.Bookings;

public class Booking
{
    public int BookingId { get; set; }

    [Required]
    [MaxLength(30)]
    public string BookingNumber { get; set; }
        = string.Empty;

    public int CustomerId { get; set; }

    public Customer Customer { get; set; }
        = null!;

    public int EventId { get; set; }

    public Event Event { get; set; }
        = null!;

    public BookingStatus BookingStatus { get; set; }
        = BookingStatus.Pending;

    public DateTime HoldExpiresAtUtc { get; set; }

    public DateTime CreatedAt { get; set; }
        = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // One booking can contain one or more seats.
    public ICollection<BookingSeat> BookingSeats { get; set; }
        = new List<BookingSeat>();

    // Parking is optional and a booking can have
    // at most one parking reservation.
    public ParkingReservation? ParkingReservation { get; set; }
}