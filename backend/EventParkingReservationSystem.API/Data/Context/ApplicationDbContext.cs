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
        // LOAD ALL IEntityTypeConfiguration<T> FILES
        // =====================================================

        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(ApplicationDbContext).Assembly);


        // =====================================================
        // CUSTOMER
        // No separate CustomerConfiguration currently exists.
        // =====================================================

        modelBuilder.Entity<Customer>()
            .HasIndex(c => c.Email)
            .IsUnique();


        // =====================================================
        // BOOKING
        // No separate BookingConfiguration currently exists.
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
        // NOTIFICATION
        // No separate NotificationConfiguration currently exists.
        // =====================================================

        modelBuilder.Entity<Notification>()
            .HasOne(n => n.Customer)
            .WithMany()
            .HasForeignKey(n => n.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}