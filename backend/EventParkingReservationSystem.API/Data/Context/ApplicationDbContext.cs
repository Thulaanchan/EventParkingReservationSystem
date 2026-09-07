using Microsoft.EntityFrameworkCore;

using EventParkingReservationSystem.API.Models.Entities.Bookings;
using EventParkingReservationSystem.API.Models.Entities.Categories;
using EventParkingReservationSystem.API.Models.Entities.Customers;
using EventParkingReservationSystem.API.Models.Entities.Events;
using EventParkingReservationSystem.API.Models.Entities.Notifications;
using EventParkingReservationSystem.API.Models.Entities.Parking;
using EventParkingReservationSystem.API.Models.Entities.ParkingReservations;
using EventParkingReservationSystem.API.Models.Entities.Payments;
using EventParkingReservationSystem.API.Models.Entities.Seats;
using EventParkingReservationSystem.API.Models.Entities.Venues;

namespace EventParkingReservationSystem.API.Data.Context;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // =========================================================
    // MEMBER 1
    // Customer + Booking
    // =========================================================

    public DbSet<Customer> Customers =>
        Set<Customer>();

    public DbSet<Booking> Bookings =>
        Set<Booking>();

    public DbSet<BookingSeat> BookingSeats =>
        Set<BookingSeat>();


    // =========================================================
    // MEMBER 2
    // Venue + Category + Event
    // =========================================================

    public DbSet<Venue> Venues =>
        Set<Venue>();

    public DbSet<EventCategory> EventCategories =>
        Set<EventCategory>();

    public DbSet<Event> Events =>
        Set<Event>();

    public DbSet<EventSeatCategory> EventSeatCategories =>
        Set<EventSeatCategory>();


    // =========================================================
    // MEMBER 3
    // Seat + Parking
    // =========================================================

    public DbSet<SeatSection> SeatSections =>
        Set<SeatSection>();

    public DbSet<Seat> Seats =>
        Set<Seat>();

    public DbSet<ParkingZone> ParkingZones =>
        Set<ParkingZone>();

    public DbSet<ParkingSlot> ParkingSlots =>
        Set<ParkingSlot>();

    public DbSet<ParkingReservation> ParkingReservations =>
        Set<ParkingReservation>();


    // =========================================================
    // MEMBER 4
    // Payment + Notification
    // =========================================================

    public DbSet<Payment> Payments =>
        Set<Payment>();

    public DbSet<Notification> Notifications =>
        Set<Notification>();


    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);


        // =====================================================
        // MEMBER 1
        // CUSTOMER
        // =====================================================

        modelBuilder.Entity<Customer>()
            .HasIndex(c => c.Email)
            .IsUnique();


        // =====================================================
        // MEMBER 1
        // BOOKING
        // =====================================================

        modelBuilder.Entity<Booking>()
            .HasIndex(b => b.BookingNumber)
            .IsUnique();

        modelBuilder.Entity<Booking>()
            .HasOne(b => b.Customer)
            .WithMany()
            .HasForeignKey(b => b.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Booking>()
            .HasOne(b => b.Event)
            .WithMany()
            .HasForeignKey(b => b.EventId)
            .OnDelete(DeleteBehavior.Restrict);


        // =====================================================
        // MEMBER 1 + MEMBER 3
        // BOOKING ↔ BOOKING SEAT ↔ SEAT
        // =====================================================

        modelBuilder.Entity<BookingSeat>()
            .HasOne(bs => bs.Booking)
            .WithMany()
            .HasForeignKey(bs => bs.BookingId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<BookingSeat>()
            .HasOne(bs => bs.Seat)
            .WithMany()
            .HasForeignKey(bs => bs.SeatId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<BookingSeat>()
            .HasIndex(bs => new
            {
                bs.BookingId,
                bs.SeatId
            })
            .IsUnique();

        modelBuilder.Entity<BookingSeat>()
            .Property(bs => bs.PriceSnapshot)
            .HasPrecision(18, 2);


        // =====================================================
        // MEMBER 2
        // VENUE ↔ EVENT
        // =====================================================

        modelBuilder.Entity<Event>()
            .HasOne(e => e.Venue)
            .WithMany(v => v.Events)
            .HasForeignKey(e => e.VenueId)
            .OnDelete(DeleteBehavior.Restrict);


        // =====================================================
        // MEMBER 2
        // EVENT CATEGORY ↔ EVENT
        // =====================================================

        modelBuilder.Entity<Event>()
            .HasOne(e => e.Category)
            .WithMany(c => c.Events)
            .HasForeignKey(e => e.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);


        // =====================================================
        // MEMBER 2
        // EVENT DECIMAL PRECISION
        // =====================================================

        modelBuilder.Entity<Event>()
            .Property(e => e.TicketPrice)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Event>()
            .Property(e => e.ChildDiscountPercent)
            .HasPrecision(5, 2);

        // =====================================================
        // MEMBER 2 + MEMBER 3
        // EVENT ↔ EVENT SEAT CATEGORY
        // =====================================================

        modelBuilder.Entity<EventSeatCategory>()
            .HasOne(esc => esc.Event)
            .WithMany()
            .HasForeignKey(esc => esc.EventId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<EventSeatCategory>()
            .Property(esc => esc.AdultPrice)
            .HasPrecision(18, 2);


        // =====================================================
        // MEMBER 3
        // EVENT ↔ SEAT SECTION
        // =====================================================

        modelBuilder.Entity<SeatSection>()
            .HasOne(ss => ss.Event)
            .WithMany()
            .HasForeignKey(ss => ss.EventId)
            .OnDelete(DeleteBehavior.Restrict);


        // =====================================================
        // MEMBER 2 + MEMBER 3
        // EVENT SEAT CATEGORY ↔ SEAT SECTION
        // =====================================================

        modelBuilder.Entity<SeatSection>()
            .HasOne(ss => ss.SeatCategory)
            .WithMany(esc => esc.Sections)
            .HasForeignKey(ss => ss.EventSeatCategoryId)
            .OnDelete(DeleteBehavior.Restrict);


        // =====================================================
        // MEMBER 3
        // EVENT ↔ SEAT
        // =====================================================

        modelBuilder.Entity<Seat>()
            .HasOne(s => s.Event)
            .WithMany()
            .HasForeignKey(s => s.EventId)
            .OnDelete(DeleteBehavior.Restrict);


        // =====================================================
        // MEMBER 3
        // SEAT SECTION ↔ SEAT
        // =====================================================

        modelBuilder.Entity<Seat>()
            .HasOne(s => s.Section)
            .WithMany(ss => ss.Seats)
            .HasForeignKey(s => s.SeatSectionId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Seat>()
            .HasIndex(s => new
            {
                s.EventId,
                s.SeatCode
            })
            .IsUnique();

        modelBuilder.Entity<Seat>()
            .Property(s => s.PositionX)
            .HasPrecision(10, 2);

        modelBuilder.Entity<Seat>()
            .Property(s => s.PositionY)
            .HasPrecision(10, 2);


        // =====================================================
        // MEMBER 3
        // EVENT ↔ PARKING ZONE
        // =====================================================

        modelBuilder.Entity<ParkingZone>()
            .HasOne(pz => pz.Event)
            .WithMany()
            .HasForeignKey(pz => pz.EventId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ParkingZone>()
            .Property(pz => pz.Fee)
            .HasPrecision(18, 2);


        // =====================================================
        // MEMBER 3
        // EVENT ↔ PARKING SLOT
        // =====================================================

        modelBuilder.Entity<ParkingSlot>()
            .HasOne(ps => ps.Event)
            .WithMany()
            .HasForeignKey(ps => ps.EventId)
            .OnDelete(DeleteBehavior.Restrict);


        // =====================================================
        // MEMBER 3
        // PARKING ZONE ↔ PARKING SLOT
        // =====================================================

        modelBuilder.Entity<ParkingSlot>()
            .HasOne(ps => ps.ParkingZone)
            .WithMany(pz => pz.ParkingSlots)
            .HasForeignKey(ps => ps.ParkingZoneId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ParkingSlot>()
            .HasIndex(ps => new
            {
                ps.EventId,
                ps.SlotCode
            })
            .IsUnique();

        modelBuilder.Entity<ParkingSlot>()
            .Property(ps => ps.PositionX)
            .HasPrecision(10, 2);

        modelBuilder.Entity<ParkingSlot>()
            .Property(ps => ps.PositionY)
            .HasPrecision(10, 2);


        // =====================================================
        // MEMBER 1 + MEMBER 3
        // BOOKING ↔ PARKING RESERVATION
        // =====================================================

        modelBuilder.Entity<ParkingReservation>()
            .HasOne(pr => pr.Booking)
            .WithMany()
            .HasForeignKey(pr => pr.BookingId)
            .OnDelete(DeleteBehavior.Restrict);


        // =====================================================
        // MEMBER 3
        // PARKING SLOT ↔ PARKING RESERVATION
        // =====================================================

        modelBuilder.Entity<ParkingReservation>()
            .HasOne(pr => pr.ParkingSlot)
            .WithMany()
            .HasForeignKey(pr => pr.ParkingSlotId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ParkingReservation>()
            .Property(pr => pr.FeeSnapshot)
            .HasPrecision(18, 2);

        // Finalized flow allows at most one parking
        // reservation for a booking.
        modelBuilder.Entity<ParkingReservation>()
            .HasIndex(pr => pr.BookingId)
            .IsUnique();


        // =====================================================
        // MEMBER 4
        // BOOKING ↔ PAYMENT
        // =====================================================

        modelBuilder.Entity<Payment>()
            .Property(p => p.Amount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Payment>()
            .HasOne<Booking>()
            .WithOne()
            .HasForeignKey<Payment>(
                p => p.BookingId)
            .OnDelete(DeleteBehavior.Restrict);


        // =====================================================
        // MEMBER 4
        // CUSTOMER ↔ NOTIFICATION
        // =====================================================

        modelBuilder.Entity<Notification>()
            .HasOne(n => n.Customer)
            .WithMany()
            .HasForeignKey(n => n.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}