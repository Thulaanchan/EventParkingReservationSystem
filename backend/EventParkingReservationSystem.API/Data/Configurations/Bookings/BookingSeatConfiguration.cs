using EventParkingReservationSystem.API.Models.Entities.Bookings;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EventParkingReservationSystem.API.Data.Configurations.Bookings;

public class BookingSeatConfiguration
    : IEntityTypeConfiguration<BookingSeat>
{
    public void Configure(
        EntityTypeBuilder<BookingSeat> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.AttendeeName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.AttendeeType)
            .IsRequired();

        builder.Property(x => x.PriceSnapshot)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.CreatedAtUtc)
            .IsRequired();

        builder.HasIndex(x => new
        {
            x.BookingId,
            x.SeatId
        })
        .IsUnique();

        builder.HasOne(x => x.Booking)
            .WithMany(b => b.BookingSeats)
            .HasForeignKey(x => x.BookingId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Seat)
            .WithMany()
            .HasForeignKey(x => x.SeatId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}