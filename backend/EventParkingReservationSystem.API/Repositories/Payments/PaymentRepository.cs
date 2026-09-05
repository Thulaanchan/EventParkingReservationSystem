using EventParkingReservationSystem.API.Data.Context;
using EventParkingReservationSystem.API.Interfaces.Repositories.Payments;
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
                .FirstOrDefaultAsync(p => p.PaymentId == paymentId);
        }

        public async Task<Payment?> GetByBookingIdAsync(int bookingId)
        {
            return await _context.Set<Payment>()
                .FirstOrDefaultAsync(p => p.BookingId == bookingId);
        }

        public async Task<bool> ExistsForBookingAsync(int bookingId)
        {
            return await _context.Set<Payment>()
                .AnyAsync(p => p.BookingId == bookingId);
        }

        public async Task<IEnumerable<Payment>> GetAllAsync()
        {
            return await _context.Set<Payment>()
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task AddAsync(Payment payment)
        {
            await _context.Set<Payment>().AddAsync(payment);
        }

        public Task UpdateAsync(Payment payment)
        {
            _context.Set<Payment>().Update(payment);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}