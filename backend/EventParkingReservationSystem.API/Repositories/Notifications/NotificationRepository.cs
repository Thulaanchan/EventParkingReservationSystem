using EventParkingReservationSystem.API.Data.Context;
using EventParkingReservationSystem.API.Interfaces.Repositories.Notifications;
using EventParkingReservationSystem.API.Models.Entities.Notifications;
using Microsoft.EntityFrameworkCore;

namespace EventParkingReservationSystem.API.Repositories.Notifications
{
    public class NotificationRepository : INotificationRepository
    {
        private readonly ApplicationDbContext _context;

        public NotificationRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Notification?> GetByIdAsync(int notificationId)
        {
            return await _context.Set<Notification>()
                .FirstOrDefaultAsync(n => n.NotificationId == notificationId);
        }

        public async Task<IEnumerable<Notification>> GetByCustomerIdAsync(
            int customerId)
        {
            return await _context.Set<Notification>()
                .AsNoTracking()
                .Where(n => n.CustomerId == customerId)
                .OrderByDescending(n => n.CreatedAtUtc)
                .ToListAsync();
        }

        public async Task<int> GetUnreadCountAsync(int customerId)
        {
            return await _context.Set<Notification>()
                .CountAsync(n =>
                    n.CustomerId == customerId &&
                    !n.IsRead);
        }

        public async Task AddAsync(Notification notification)
        {
            await _context.Set<Notification>()
                .AddAsync(notification);
        }

        public Task UpdateAsync(Notification notification)
        {
            _context.Set<Notification>()
                .Update(notification);

            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}