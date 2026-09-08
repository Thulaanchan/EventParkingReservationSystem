using EventParkingReservationSystem.API.Models.Entities.Parking;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EventParkingReservationSystem.API.Data.Configurations.Parking;

public class ParkingSlotConfiguration
    : IEntityTypeConfiguration<ParkingSlot>
{
    public void Configure(
        EntityTypeBuilder<ParkingSlot> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.SlotCode)
            .IsRequired()
            .HasMaxLength(30);

        builder.Property(x => x.Status)
            .IsRequired();

        builder.Property(x => x.DisplayOrder)
            .IsRequired();

        builder.Property(x => x.PositionX)
            .HasPrecision(10, 2);

        builder.Property(x => x.PositionY)
            .HasPrecision(10, 2);

        builder.HasIndex(x => new
        {
            x.EventId,
            x.SlotCode
        })
        .IsUnique();

        // =====================================================
        // EVENT ↔ PARKING SLOT
        // =====================================================
        builder.HasOne(x => x.Event)
            .WithMany()
            .HasForeignKey(x => x.EventId)
            .OnDelete(DeleteBehavior.Restrict);

        // =====================================================
        // PARKING ZONE ↔ PARKING SLOT
        // =====================================================
        builder.HasOne(x => x.ParkingZone)
            .WithMany(x => x.ParkingSlots)
            .HasForeignKey(x => x.ParkingZoneId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}