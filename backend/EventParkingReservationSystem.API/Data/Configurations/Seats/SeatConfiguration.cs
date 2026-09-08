using EventParkingReservationSystem.API.Models.Entities.Seats;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EventParkingReservationSystem.API.Data.Configurations.Seats;

public class SeatConfiguration
    : IEntityTypeConfiguration<Seat>
{
    public void Configure(
        EntityTypeBuilder<Seat> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.RowLabel)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.SeatCode)
            .IsRequired()
            .HasMaxLength(30);

        builder.Property(x => x.Number)
            .IsRequired();

        builder.Property(x => x.Status)
            .IsRequired();

        builder.Property(x => x.DisplayOrder)
            .IsRequired();

        builder.Property(x => x.PositionX)
            .HasPrecision(10, 2);

        builder.Property(x => x.PositionY)
            .HasPrecision(10, 2);

        // A SeatCode must be unique inside an event.
        builder.HasIndex(x => new
        {
            x.EventId,
            x.SeatCode
        })
        .IsUnique();

        // =====================================================
        // EVENT ↔ SEAT
        // =====================================================
        builder.HasOne(x => x.Event)
            .WithMany()
            .HasForeignKey(x => x.EventId)
            .OnDelete(DeleteBehavior.Restrict);

        // =====================================================
        // SEAT SECTION ↔ SEAT
        // =====================================================
        builder.HasOne(x => x.Section)
            .WithMany(x => x.Seats)
            .HasForeignKey(x => x.SeatSectionId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}