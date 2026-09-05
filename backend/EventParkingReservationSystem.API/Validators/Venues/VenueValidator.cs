using EventParkingReservationSystem.API.Models.DTOs.Venues;

namespace EventParkingReservationSystem.API.Validators.Venues;

public static class VenueValidator
{
    public static void Validate(CreateVenueDto request)
    {
        ValidateValues(
            request.Name,
            request.Address,
            request.TotalCapacity);
    }

    public static void Validate(UpdateVenueDto request)
    {
        ValidateValues(
            request.Name,
            request.Address,
            request.TotalCapacity);
    }

    private static void ValidateValues(
        string name,
        string address,
        int totalCapacity)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Venue name is required.");

        if (string.IsNullOrWhiteSpace(address))
            throw new ArgumentException("Venue address is required.");

        if (totalCapacity <= 0)
            throw new ArgumentException(
                "Venue capacity must be greater than zero.");
    }
}