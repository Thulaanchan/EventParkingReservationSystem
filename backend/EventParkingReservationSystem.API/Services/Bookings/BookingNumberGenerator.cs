using System.Security.Cryptography;
using EventParkingReservationSystem.API.Interfaces.Repositories.Bookings;
using EventParkingReservationSystem.API.Interfaces.Services.Bookings;

namespace EventParkingReservationSystem.API.Services.Bookings;

public class BookingNumberGenerator : IBookingNumberGenerator
{
    private readonly IBookingRepository _bookingRepository;

    public BookingNumberGenerator(
        IBookingRepository bookingRepository)
    {
        _bookingRepository = bookingRepository;
    }

    public async Task<string> GenerateAsync()
    {
        const int maxAttempts = 10;

        for (var attempt = 0;
             attempt < maxAttempts;
             attempt++)
        {
            var year =
                DateTime.UtcNow.Year;

            var randomNumber =
                RandomNumberGenerator.GetInt32(
                    0,
                    1_000_000);

            var bookingNumber =
                $"BKG-{year}-{randomNumber:D6}";

            var existingBooking =
                await _bookingRepository
                    .GetByBookingNumberAsync(
                        bookingNumber);

            if (existingBooking is null)
            {
                return bookingNumber;
            }
        }

        throw new InvalidOperationException(
            "Unable to generate a unique booking number.");
    }
}