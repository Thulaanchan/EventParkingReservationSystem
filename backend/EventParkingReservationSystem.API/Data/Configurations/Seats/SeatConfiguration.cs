using EventParkingReservationSystem.API.Models.Entities.Events;
using EventParkingReservationSystem.API.Models.Entities.Seats;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EventParkingReservationSystem.API.Data.Configurations.Seats;

public class SeatConfiguration : IEntityTypeConfiguration<Seat>
{
    public void Configure(EntityTypeBuilder<Seat> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.RowLabel)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.Status)
            .IsRequired();

        builder.HasIndex(x => new
        {
            x.EventId,
            x.RowLabel,
            x.Number
        })
        .IsUnique();

        builder.HasOne<Event>()
            .WithMany()
            .HasForeignKey(x => x.EventId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}