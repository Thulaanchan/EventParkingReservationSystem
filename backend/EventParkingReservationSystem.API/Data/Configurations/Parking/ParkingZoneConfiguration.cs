using EventParkingReservationSystem.API.Models.Entities.Parking;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EventParkingReservationSystem.API.Data.Configurations.Parking;

public class ParkingZoneConfiguration
    : IEntityTypeConfiguration<ParkingZone>
{
    public void Configure(
        EntityTypeBuilder<ParkingZone> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.VehicleType)
            .IsRequired();

        builder.Property(x => x.Fee)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.IsOnlineBookable)
            .IsRequired();

        builder.Property(x => x.DisplayOrder)
            .IsRequired();

        builder.HasIndex(x => new
        {
            x.EventId,
            x.Name
        })
        .IsUnique();

        builder.HasOne(x => x.Event)
            .WithMany()
            .HasForeignKey(x => x.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.ParkingSlots)
            .WithOne(x => x.ParkingZone)
            .HasForeignKey(x => x.ParkingZoneId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}