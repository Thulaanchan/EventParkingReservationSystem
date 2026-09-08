using EventParkingReservationSystem.API.Models.Entities.ParkingReservations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EventParkingReservationSystem.API.Data.Configurations.Parking;

public class ParkingReservationConfiguration
    : IEntityTypeConfiguration<ParkingReservation>
{
    public void Configure(
        EntityTypeBuilder<ParkingReservation> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.FeeSnapshot)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.VehicleTypeSnapshot)
            .IsRequired();

        builder.Property(x => x.ZoneNameSnapshot)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.ReservedAtUtc)
            .IsRequired();

        // One booking can have at most one parking reservation.
        builder.HasIndex(x => x.BookingId)
            .IsUnique();

        builder.HasIndex(x => x.ParkingSlotId);

        // =====================================================
        // BOOKING ↔ PARKING RESERVATION
        // One-to-one relationship
        // =====================================================
        builder.HasOne(x => x.Booking)
            .WithOne(b => b.ParkingReservation)
            .HasForeignKey<ParkingReservation>(
                x => x.BookingId)
            .OnDelete(DeleteBehavior.Restrict);

        // =====================================================
        // PARKING SLOT ↔ PARKING RESERVATION
        // =====================================================
        builder.HasOne(x => x.ParkingSlot)
            .WithMany()
            .HasForeignKey(x => x.ParkingSlotId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}