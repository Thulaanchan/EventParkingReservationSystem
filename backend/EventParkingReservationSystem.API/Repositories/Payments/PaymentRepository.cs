using EventParkingReservationSystem.API.Data.Context;
using EventParkingReservationSystem.API.Interfaces.Repositories.Payments;
using EventParkingReservationSystem.API.Models.Entities.Bookings;
using EventParkingReservationSystem.API.Models.Entities.Payments;
using Microsoft.EntityFrameworkCore;

namespace EventParkingReservationSystem.API.Repositories.Payments
{
    public class PaymentRepository : IPaymentRepository
    {
        private readonly ApplicationDbContext _context;

        public PaymentRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Payment?> GetByIdAsync(int paymentId)
        {
            return await _context.Set<Payment>()
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    p => p.PaymentId == paymentId);
        }

        public async Task<Payment?> GetByBookingIdAsync(
            int bookingId)
        {
            return await _context.Set<Payment>()
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    p => p.BookingId == bookingId);
        }

        public async Task<bool> ExistsForBookingAsync(
            int bookingId)
        {
            return await _context.Set<Payment>()
                .AnyAsync(
                    p => p.BookingId == bookingId);
        }

        public async Task<IEnumerable<Payment>> GetAllAsync()
        {
            return await _context.Set<Payment>()
                .AsNoTracking()
                .OrderByDescending(p => p.CreatedAtUtc)
                .ToListAsync();
        }

        public async Task<IEnumerable<Payment>>
            GetByCustomerIdAsync(int customerId)
        {
            return await (
                from payment in _context.Set<Payment>()
                    .AsNoTracking()
                join booking in _context.Bookings
                    .AsNoTracking()
                    on payment.BookingId
                    equals booking.BookingId
                where booking.CustomerId == customerId
                orderby payment.CreatedAtUtc descending
                select payment
            ).ToListAsync();
        }

        public async Task<decimal> GetSeatAmountForBookingAsync(
            int bookingId)
        {
            return await _context.Set<BookingSeat>()
                .Where(
                    bs => bs.BookingId == bookingId)
                .SumAsync(
                    bs => bs.PriceSnapshot);
        }

        public async Task AddAsync(Payment payment)
        {
            await _context.Set<Payment>()
                .AddAsync(payment);
        }

        public Task UpdateAsync(Payment payment)
        {
            _context.Set<Payment>()
                .Update(payment);

            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}