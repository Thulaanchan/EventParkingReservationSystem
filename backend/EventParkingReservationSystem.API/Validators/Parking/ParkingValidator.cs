using EventParkingReservationSystem.API.Models.DTOs.Parking;

namespace EventParkingReservationSystem.API.Validators.Parking;

public static class ParkingValidator
{
    public static void ValidateReserveRequest(ReserveParkingRequest request)
    {
        if (request.ParkingSlotId <= 0)
        {
            throw new ArgumentException(
                "A valid parking slot id is required.");
        }
    }

    public static string NormalizeSlotCode(string slotCode)
    {
        return slotCode.Trim().ToUpperInvariant();
    }
}