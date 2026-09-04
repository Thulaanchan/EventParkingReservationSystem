using EventParkingReservationSystem.API.Models.Entities.Payments;

namespace EventParkingReservationSystem.API.Interfaces.Repositories.Payments
{
    public interface IPaymentRepository
    {
        Task<Payment?> GetByIdAsync(int paymentId);

        Task<Payment?> GetByBookingIdAsync(int bookingId);

        Task<bool> ExistsForBookingAsync(int bookingId);

        Task<IEnumerable<Payment>> GetAllAsync();

        Task AddAsync(Payment payment);

        Task UpdateAsync(Payment payment);

        Task SaveChangesAsync();
    }
}