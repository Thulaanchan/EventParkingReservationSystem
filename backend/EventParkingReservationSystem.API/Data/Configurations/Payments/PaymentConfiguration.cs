using EventParkingReservationSystem.API.Models.Entities.Bookings;
using EventParkingReservationSystem.API.Models.Entities.Payments;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EventParkingReservationSystem.API.Data.Configurations.Payments;

public class PaymentConfiguration
    : IEntityTypeConfiguration<Payment>
{
    public void Configure(
        EntityTypeBuilder<Payment> builder)
    {
        builder.ToTable("Payments");

        builder.HasKey(p => p.PaymentId);

        builder.Property(p => p.BookingId)
            .IsRequired();

        builder.Property(p => p.Amount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(p => p.Currency)
            .HasMaxLength(3)
            .HasDefaultValue("LKR")
            .IsRequired();

        builder.Property(p => p.PaymentMethod)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(p => p.Status)
            .HasConversion<int>()
            .IsRequired();

        // Nullable because an incomplete/pending payment
        // may not have a payment completion time yet.
        builder.Property(p => p.PaidAtUtc);

        builder.Property(p => p.CreatedAtUtc)
            .IsRequired();

        // =====================================================
        // BOOKING ↔ PAYMENT
        // One booking can have at most one payment.
        // =====================================================
        builder.HasOne<Booking>()
            .WithOne()
            .HasForeignKey<Payment>(
                p => p.BookingId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(p => p.BookingId)
            .IsUnique();
    }
}