using EventParkingReservationSystem.API.Configurations.Booking;
using Microsoft.Extensions.Options;

namespace EventParkingReservationSystem.API.Validators.Bookings;

public sealed class BookingHoldOptionsValidator
    : IValidateOptions<BookingHoldOptions>
{
    public ValidateOptionsResult Validate(
        string? name,
        BookingHoldOptions options)
    {
        if (options.HoldDurationMinutes <= 0)
        {
            return ValidateOptionsResult.Fail(
                "Booking hold duration must be greater than 0 minutes.");
        }

        return ValidateOptionsResult.Success;
    }
}