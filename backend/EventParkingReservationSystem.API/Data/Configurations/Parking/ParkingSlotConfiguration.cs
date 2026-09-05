using EventParkingReservationSystem.API.Models.Entities.Events;
using EventParkingReservationSystem.API.Models.Entities.Parking;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EventParkingReservationSystem.API.Data.Configurations.Parking;

public class ParkingSlotConfiguration :
    IEntityTypeConfiguration<ParkingSlot>
{
    public void Configure(EntityTypeBuilder<ParkingSlot> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.SlotCode)
            .IsRequired()
            .HasMaxLength(30);

        builder.Property(x => x.Status)
            .IsRequired();

        builder.HasIndex(x => new
        {
            x.EventId,
            x.SlotCode
        })
        .IsUnique();

        builder.HasOne<Event>()
            .WithMany()
            .HasForeignKey(x => x.EventId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}