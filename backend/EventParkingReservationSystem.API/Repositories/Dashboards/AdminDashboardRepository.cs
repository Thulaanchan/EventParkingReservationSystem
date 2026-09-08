using EventParkingReservationSystem.API.Data.Context;
using EventParkingReservationSystem.API.Enums.Bookings;
using EventParkingReservationSystem.API.Enums.Payments;
using EventParkingReservationSystem.API.Enums.Seats;
using EventParkingReservationSystem.API.Interfaces.Repositories.Dashboards;
using EventParkingReservationSystem.API.Models.DTOs.Dashboards;
using Microsoft.EntityFrameworkCore;

namespace EventParkingReservationSystem.API.Repositories.Dashboards;

public sealed class AdminDashboardRepository(
    ApplicationDbContext context)
    : IAdminDashboardRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task<AdminDashboardSummaryDto> GetSummaryAsync(
        CancellationToken cancellationToken = default)
    {
        var totalRevenue =
            await _context.Payments
                .Where(
                    x => x.Status == PaymentStatus.Completed)
                .SumAsync(
                    x => (decimal?)x.Amount,
                    cancellationToken)
            ?? 0m;

        return new AdminDashboardSummaryDto
        {
            TotalEvents =
                await _context.Events.CountAsync(
                    cancellationToken),

            TotalBookings =
                await _context.Bookings.CountAsync(
                    cancellationToken),

            AvailableSeats =
                await _context.Seats.CountAsync(
                    x => x.Status == SeatStatus.Available,
                    cancellationToken),

            OccupiedParking =
                await _context.ParkingReservations.CountAsync(
                    cancellationToken),

            TotalRevenue = totalRevenue,

            TotalCustomers =
                await _context.Customers.CountAsync(
                    cancellationToken)
        };
    }

    public async Task<IReadOnlyList<UpcomingEventDto>>
        GetUpcomingEventsAsync(
            int take = 5,
            CancellationToken cancellationToken = default)
    {
        var today =
            DateOnly.FromDateTime(DateTime.UtcNow);

        var events =
            await _context.Events
                .AsNoTracking()
                .Include(x => x.Venue)
                .Where(x => x.EventDate >= today)
                .OrderBy(x => x.EventDate)
                .ThenBy(x => x.StartTime)
                .Take(take)
                .Select(x => new
                {
                    x.Id,
                    x.Name,
                    VenueName = x.Venue.Name,
                    x.EventDate,
                    x.StartTime
                })
                .ToListAsync(cancellationToken);

        var result =
            new List<UpcomingEventDto>();

        foreach (var item in events)
        {
            var total =
                await _context.Seats.CountAsync(
                    x => x.EventId == item.Id,
                    cancellationToken);

            var booked =
                await _context.Seats.CountAsync(
                    x =>
                        x.EventId == item.Id &&
                        x.Status == SeatStatus.Booked,
                    cancellationToken);
            var available =
                await _context.Seats.CountAsync(
                    x =>
                        x.EventId == item.Id &&
                        x.Status == SeatStatus.Available,
                    cancellationToken);

            var bookingCount =
                await _context.Bookings.CountAsync(
                    x =>
                        x.EventId == item.Id &&
                        x.BookingStatus != BookingStatus.Cancelled &&
                        x.BookingStatus != BookingStatus.Expired,
                    cancellationToken);

            result.Add(
                new UpcomingEventDto
                {
                    EventId = item.Id,
                    EventName = item.Name,
                    VenueName = item.VenueName,
                    EventDate = item.EventDate,
                    StartTime = item.StartTime,

                    BookingCount = bookingCount,

                    TotalSeats = total,
                    AvailableSeats = available,
                    BookedSeats = booked,

                    OccupancyPercentage =
                        total == 0
                            ? 0
                            : Math.Round(
                                booked * 100m / total,
                                1)
                });
        }

        return result;
    }

    public async Task<IReadOnlyList<RecentBookingDto>>
        GetRecentBookingsAsync(
            int take = 5,
            CancellationToken cancellationToken = default)
    {
        return await _context.Bookings
            .AsNoTracking()
            .Include(x => x.Customer)
            .Include(x => x.Event)
            .OrderByDescending(x => x.CreatedAt)
            .Take(take)
            .Select(x => new RecentBookingDto
            {
                BookingId = x.BookingId,
                BookingNumber = x.BookingNumber,

                CustomerName =
                    x.Customer.FirstName + " " +
                    x.Customer.LastName,

                EventName = x.Event.Name,

                CreatedAt = x.CreatedAt,

                Status =
                    x.BookingStatus.ToString(),

                Amount =
                    _context.Payments
                        .Where(p =>
                            p.BookingId == x.BookingId &&
                            p.Status == PaymentStatus.Completed)
                        .Select(p =>
                            (decimal?)p.Amount)
                        .FirstOrDefault()
                    ?? 0m
            })
            .ToListAsync(cancellationToken);
    }
}