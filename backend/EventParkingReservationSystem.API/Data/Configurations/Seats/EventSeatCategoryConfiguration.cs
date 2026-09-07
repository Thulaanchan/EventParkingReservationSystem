using EventParkingReservationSystem.API.Models.Entities.Seats;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EventParkingReservationSystem.API.Data.Configurations.Seats;

public class EventSeatCategoryConfiguration
    : IEntityTypeConfiguration<EventSeatCategory>
{
    public void Configure(
        EntityTypeBuilder<EventSeatCategory> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.Code)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(x => x.AdultPrice)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.IsPubliclyBookable)
            .IsRequired();

        builder.Property(x => x.DisplayOrder)
            .IsRequired();

        builder.HasIndex(x => new
        {
            x.EventId,
            x.Code
        })
        .IsUnique();

        builder.HasOne(x => x.Event)
            .WithMany()
            .HasForeignKey(x => x.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.Sections)
            .WithOne(x => x.SeatCategory)
            .HasForeignKey(x => x.EventSeatCategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}