using Microsoft.EntityFrameworkCore;
using EventParkingReservationSystem.API.Models.Entities.Customers;

namespace EventParkingReservationSystem.API.Data.Context;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Customer> Customers => Set<Customer>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Customer>()
            .HasIndex(c => c.Email)
            .IsUnique();
    }
}