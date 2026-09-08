using EventParkingReservationSystem.API.Data.Context;
using EventParkingReservationSystem.API.Enums.Bookings;
using EventParkingReservationSystem.API.Enums.Payments;
using EventParkingReservationSystem.API.Interfaces.Repositories.Dashboards;
using EventParkingReservationSystem.API.Models.DTOs.Dashboards;
using Microsoft.EntityFrameworkCore;

namespace EventParkingReservationSystem.API.Repositories.Dashboards;

public sealed class CustomerDashboardRepository
    : ICustomerDashboardRepository
{
    private readonly ApplicationDbContext _context;

    public CustomerDashboardRepository(
        ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CustomerDashboardSummaryDto> GetSummaryAsync(
        int customerId,
        CancellationToken cancellationToken = default)
    {
        var today =
            DateOnly.FromDateTime(
                DateTime.UtcNow);

        // We treat payments made during the last
        // 30 days as "recent payments".
        var recentPaymentFromUtc =
            DateTime.UtcNow.AddDays(-30);

        // ==========================================
        // UPCOMING BOOKINGS
        // ==========================================
        var upcomingBookingsCount =
            await _context.Bookings
                .AsNoTracking()
                .CountAsync(
                    booking =>
                        booking.CustomerId == customerId &&
                        booking.Event.EventDate >= today &&
                        booking.BookingStatus !=
                            BookingStatus.Cancelled &&
                        booking.BookingStatus !=
                            BookingStatus.Expired,
                    cancellationToken);

        // ==========================================
        // RESERVED PARKING
        // ==========================================
        //
        // Count parking reservations belonging
        // to this customer's active bookings.
        var reservedParkingCount =
            await _context.ParkingReservations
                .AsNoTracking()
                .CountAsync(
                    reservation =>
                        reservation.Booking.CustomerId ==
                            customerId &&
                        reservation.Booking.BookingStatus !=
                            BookingStatus.Cancelled &&
                        reservation.Booking.BookingStatus !=
                            BookingStatus.Expired,
                    cancellationToken);

        // ==========================================
        // RECENT COMPLETED PAYMENTS
        // ==========================================
        //
        // Payment has BookingId but currently does
        // not expose a Booking navigation property,
        // therefore we join Payments and Bookings.
        var recentPaymentsCount =
            await _context.Payments
                .AsNoTracking()
                .Join(
                    _context.Bookings.AsNoTracking(),

                    payment =>
                        payment.BookingId,

                    booking =>
                        booking.BookingId,

                    (payment, booking) =>
                        new
                        {
                            Payment = payment,
                            Booking = booking
                        })
                .CountAsync(
                    item =>
                        item.Booking.CustomerId ==
                            customerId &&
                        item.Payment.Status ==
                            PaymentStatus.Completed &&
                        item.Payment.PaidAtUtc.HasValue &&
                        item.Payment.PaidAtUtc.Value >=
                            recentPaymentFromUtc,
                    cancellationToken);

        // ==========================================
        // UNREAD NOTIFICATIONS
        // ==========================================
        var unreadNotificationsCount =
            await _context.Notifications
                .AsNoTracking()
                .CountAsync(
                    notification =>
                        notification.CustomerId ==
                            customerId &&
                        !notification.IsRead,
                    cancellationToken);

        return new CustomerDashboardSummaryDto
        {
            UpcomingBookingsCount =
                upcomingBookingsCount,

            ReservedParkingCount =
                reservedParkingCount,

            RecentPaymentsCount =
                recentPaymentsCount,

            UnreadNotificationsCount =
                unreadNotificationsCount
        };
    }
}