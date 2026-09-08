using EventParkingReservationSystem.API.Models.DTOs.Events;
using EventEntity =
    EventParkingReservationSystem.API.Models.Entities.Events.Event;

namespace EventParkingReservationSystem.API.Mappings.Events;

public static class EventMappings
{
    public static EventListItemDto ToListItemDto(
        this EventEntity entity,
        int totalSeats,
        int availableSeats,
        int bookedSeats,
        bool hasBookings)
    {
        var soldPercentage =
            totalSeats == 0
                ? 0m
                : Math.Round(
                    bookedSeats * 100m / totalSeats,
                    1);

        return new EventListItemDto
        {
            Id = entity.Id,
            Name = entity.Name,
            PosterUrl = entity.PosterUrl,
            EventDate = entity.EventDate,
            StartTime = entity.StartTime,
            EndTime = entity.EndTime,
            TicketPrice = entity.TicketPrice,


            VenueId = entity.VenueId,
            VenueName = entity.Venue.Name,

            CategoryId = entity.CategoryId,
            CategoryName = entity.Category.Name,

            Capacity = entity.Capacity,

            TotalSeats = totalSeats,
            AvailableSeats = availableSeats,
            BookedSeats = bookedSeats,
            SoldPercentage = soldPercentage,

            HasBookings = hasBookings,
            CanDelete = !hasBookings
        };
    }

    public static EventDetailsDto ToDetailsDto(
        this EventEntity entity,
        int totalSeats,
        int availableSeats,
        int bookedSeats,
        int bookingCount,
        bool hasBookings)
    {
        var soldPercentage =
            totalSeats == 0
                ? 0m
                : Math.Round(
                    bookedSeats * 100m / totalSeats,
                    1);

        return new EventDetailsDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            PosterUrl = entity.PosterUrl,
            StageLayout = entity.StageLayout,

            EventDate = entity.EventDate,
            StartTime = entity.StartTime,
            EndTime = entity.EndTime,
            TicketPrice = entity.TicketPrice,

            ChildDiscountPercent = entity.ChildDiscountPercent,

            VenueId = entity.VenueId,
            VenueName = entity.Venue.Name,
            VenueAddress = entity.Venue.Address,
            VenueCapacity = entity.Venue.TotalCapacity,

            CategoryId = entity.CategoryId,
            CategoryName = entity.Category.Name,

            Capacity = entity.Capacity,

            TotalSeats = totalSeats,
            AvailableSeats = availableSeats,
            BookedSeats = bookedSeats,
            BookingCount = bookingCount,

            SoldPercentage = soldPercentage,

            HasBookings = hasBookings,

            CanEditTicketPrice = !hasBookings,
            CanEditCapacity = !hasBookings,
            CanEditStageLayout = !hasBookings,
            CanDelete = !hasBookings
        };
    }
}