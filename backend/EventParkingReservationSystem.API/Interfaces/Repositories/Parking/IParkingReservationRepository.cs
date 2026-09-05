using EventParkingReservationSystem.API.Models.Entities.ParkingReservations;

namespace EventParkingReservationSystem.API.Interfaces.Repositories.Parking;

public interface IParkingReservationRepository
{
    Task<ParkingReservation?> GetByBookingIdAsync(
        int bookingId,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        ParkingReservation reservation,
        CancellationToken cancellationToken = default);

    void Remove(ParkingReservation reservation);

    Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default);
}