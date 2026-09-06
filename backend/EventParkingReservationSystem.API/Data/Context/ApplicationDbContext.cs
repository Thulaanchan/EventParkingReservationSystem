using Microsoft.EntityFrameworkCore;

using EventParkingReservationSystem.API.Models.Entities.Customers;
using EventParkingReservationSystem.API.Models.Entities.Bookings;

// Add these ONLY after the actual member entities exist.
// using EventParkingReservationSystem.API.Models.Entities.Venues;
// using EventParkingReservationSystem.API.Models.Entities.Categories;
// using EventParkingReservationSystem.API.Models.Entities.Events;
// using EventParkingReservationSystem.API.Models.Entities.Seats;
// using EventParkingReservationSystem.API.Models.Entities.Parking;
// using EventParkingReservationSystem.API.Models.Entities.ParkingReservations;
// using EventParkingReservationSystem.API.Models.Entities.Payments;
// using EventParkingReservationSystem.API.Models.Entities.Notifications;

namespace EventParkingReservationSystem.API.Data.Context;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // =========================
    // MEMBER 1
    // Customer + Booking
    // =========================

    public DbSet<Customer> Customers =>
        Set<Customer>();

    public DbSet<Booking> Bookings =>
        Set<Booking>();

    public DbSet<BookingSeat> BookingSeats =>
        Set<BookingSeat>();


    // =========================
    // MEMBER 2
    // Venue + Category + Event
    // =========================

    // Add after M2 entities are integrated.

    // public DbSet<Venue> Venues =>
    //     Set<Venue>();

    // public DbSet<EventCategory> EventCategories =>
    //     Set<EventCategory>();

    // public DbSet<Event> Events =>
    //     Set<Event>();


    // =========================
    // MEMBER 3
    // Seat + Parking
    // =========================

    // Add after M3 entities are integrated.

    // public DbSet<Seat> Seats =>
    //     Set<Seat>();

    // public DbSet<ParkingSlot> ParkingSlots =>
    //     Set<ParkingSlot>();

    // public DbSet<ParkingReservation> ParkingReservations =>
    //     Set<ParkingReservation>();


    // =========================
    // MEMBER 4
    // Payment + Notification
    // =========================

    // Add after M4 entities are integrated.

    // public DbSet<Payment> Payments =>
    //     Set<Payment>();

    // public DbSet<Notification> Notifications =>
    //     Set<Notification>();


    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // =========================
        // CUSTOMER
        // =========================

        modelBuilder.Entity<Customer>()
            .HasIndex(c => c.Email)
            .IsUnique();


        // =========================
        // BOOKING
        // =========================

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


        // Remaining relationships should be added
        // only after the corresponding member entities
        // and FK/navigation properties are final.
    }
}