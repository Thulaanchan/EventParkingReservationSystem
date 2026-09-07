using EventParkingReservationSystem.API.Models.Entities.Seats;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EventParkingReservationSystem.API.Data.Configurations.Seats;

public class SeatSectionConfiguration
    : IEntityTypeConfiguration<SeatSection>
{
    public void Configure(
        EntityTypeBuilder<SeatSection> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(100);

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

        builder.HasOne(x => x.SeatCategory)
            .WithMany(x => x.Sections)
            .HasForeignKey(x => x.EventSeatCategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Seats)
            .WithOne(x => x.Section)
            .HasForeignKey(x => x.SeatSectionId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}