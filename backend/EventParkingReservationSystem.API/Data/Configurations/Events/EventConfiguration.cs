using EventParkingReservationSystem.API.Data.Seed.Events;
using EventParkingReservationSystem.API.Models.Entities.Events;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EventParkingReservationSystem.API.Data.Configurations.Events;

public sealed class EventConfiguration
    : IEntityTypeConfiguration<Event>
{
    public void Configure(EntityTypeBuilder<Event> builder)
    {
        builder.ToTable("Events");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(180);

        builder.Property(x => x.Description)
            .HasMaxLength(3000);

        builder.Property(x => x.TicketPrice)
            .HasPrecision(18, 2);

        builder.Property(x => x.StageLayout)
            .HasMaxLength(100);

        builder.Property(x => x.PosterUrl)
            .HasMaxLength(500);

        builder.HasIndex(x => x.EventDate);

        builder.HasIndex(x => x.CategoryId);

        builder.HasIndex(x => new
        {
            x.VenueId,
            x.EventDate
        });

        builder.HasData(EventSeedData.GetEvents());
    }
}