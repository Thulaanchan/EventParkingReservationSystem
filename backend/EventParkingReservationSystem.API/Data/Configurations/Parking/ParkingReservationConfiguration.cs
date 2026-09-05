using EventParkingReservationSystem.API.Models.Entities.Bookings;
using EventParkingReservationSystem.API.Models.Entities.Parking;
using EventParkingReservationSystem.API.Models.Entities.ParkingReservations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EventParkingReservationSystem.API.Data.Configurations.Parking;

public class ParkingReservationConfiguration :
    IEntityTypeConfiguration<ParkingReservation>
{
    public void Configure(EntityTypeBuilder<ParkingReservation> builder)
    {
        builder.HasKey(x => x.Id);

        // Maximum one parking reservation per booking.
        builder.HasIndex(x => x.BookingId)
            .IsUnique();

        // Useful for availability/reservation lookup.
        builder.HasIndex(x => x.ParkingSlotId);

        builder.HasOne<Booking>()
            .WithMany()
            .HasForeignKey(x => x.BookingId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<ParkingSlot>()
            .WithMany()
            .HasForeignKey(x => x.ParkingSlotId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}