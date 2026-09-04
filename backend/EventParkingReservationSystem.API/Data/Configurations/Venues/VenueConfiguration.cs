using EventParkingReservationSystem.API.Data.Seed.Venues;
using EventParkingReservationSystem.API.Models.Entities.Venues;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EventParkingReservationSystem.API.Data.Configurations.Venues;

public sealed class VenueConfiguration
    : IEntityTypeConfiguration<Venue>
{
    public void Configure(EntityTypeBuilder<Venue> builder)
    {
        builder.ToTable("Venues");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(x => x.Address)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(x => x.TotalCapacity)
            .IsRequired();

        builder.HasIndex(x => x.Name)
            .IsUnique();

        builder.HasMany(x => x.Events)
            .WithOne(x => x.Venue)
            .HasForeignKey(x => x.VenueId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasData(VenueSeedData.GetVenues());
    }
}