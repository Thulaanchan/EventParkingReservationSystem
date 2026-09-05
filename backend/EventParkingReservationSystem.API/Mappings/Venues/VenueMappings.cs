using EventParkingReservationSystem.API.Models.DTOs.Venues;
using EventParkingReservationSystem.API.Models.Entities.Venues;

namespace EventParkingReservationSystem.API.Mappings.Venues;

public static class VenueMappings
{
    public static VenueDto ToDto(
        this Venue venue,
        int upcomingEventCount = 0)
    {
        return new VenueDto
        {
            Id = venue.Id,
            Name = venue.Name,
            Address = venue.Address,
            TotalCapacity = venue.TotalCapacity,
            UpcomingEventCount = upcomingEventCount
        };
    }
}