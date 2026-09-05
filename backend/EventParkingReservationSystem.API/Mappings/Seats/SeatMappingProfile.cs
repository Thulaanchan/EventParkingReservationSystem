using EventParkingReservationSystem.API.Models.DTOs.Seats;
using EventParkingReservationSystem.API.Models.Entities.Seats;

namespace EventParkingReservationSystem.API.Mappings.Seats;

public static class SeatMappingProfile
{
    public static SeatDto ToDto(this Seat seat)
    {
        return new SeatDto
        {
            Id = seat.Id,
            EventId = seat.EventId,
            RowLabel = seat.RowLabel,
            Number = seat.Number,
            Status = seat.Status.ToString()
        };
    }

    public static SeatAvailabilityDto ToAvailabilityDto(this Seat seat)
    {
        return new SeatAvailabilityDto
        {
            Id = seat.Id,
            RowLabel = seat.RowLabel,
            Number = seat.Number,
            Status = seat.Status.ToString()
        };
    }
}