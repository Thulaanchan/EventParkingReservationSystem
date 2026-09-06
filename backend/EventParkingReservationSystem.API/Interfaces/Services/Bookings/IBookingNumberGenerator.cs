namespace EventParkingReservationSystem.API.Interfaces.Services.Bookings;

public interface IBookingNumberGenerator
{
    Task<string> GenerateAsync();
}