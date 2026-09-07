using EventParkingReservationSystem.API.Interfaces.Repositories.Parking;
using EventParkingReservationSystem.API.Interfaces.Services.Parking;
using EventParkingReservationSystem.API.Models.DTOs.Parking;
using EventParkingReservationSystem.API.Models.Entities.Parking;
using EventParkingReservationSystem.API.Validators.Parking;

namespace EventParkingReservationSystem.API.Services.Parking;

public class ParkingZoneService
    : IParkingZoneService
{
    private readonly IParkingZoneRepository
        _zoneRepository;

    public ParkingZoneService(
        IParkingZoneRepository zoneRepository)
    {
        _zoneRepository = zoneRepository;
    }

    public async Task<IReadOnlyList<ParkingZoneDto>>
        GetEventZonesAsync(
            int eventId,
            CancellationToken cancellationToken = default)
    {
        var zones =
            await _zoneRepository.GetByEventAsync(
                eventId,
                cancellationToken);

        return zones.Select(x =>
            new ParkingZoneDto
            {
                Id = x.Id,
                EventId = x.EventId,
                Name = x.Name,
                VehicleType =
                    x.VehicleType.ToString(),
                Fee = x.Fee,
                IsOnlineBookable =
                    x.IsOnlineBookable,
                DisplayOrder =
                    x.DisplayOrder,
                SlotCount =
                    x.ParkingSlots.Count
            })
            .ToList();
    }

    public async Task<ParkingZoneDto>
        CreateAsync(
            int eventId,
            CreateParkingZoneRequest request,
            CancellationToken cancellationToken = default)
    {
        var zone =
            new ParkingZone
            {
                EventId = eventId,

                Name =
                    ParkingValidator
                    .NormalizeZoneName(
                        request.Name),

                VehicleType =
                    request.VehicleType,

                Fee = request.Fee,

                IsOnlineBookable =
                    request.IsOnlineBookable,

                DisplayOrder =
                    request.DisplayOrder
            };

        await _zoneRepository.AddAsync(
            zone,
            cancellationToken);

        await _zoneRepository.SaveChangesAsync(
            cancellationToken);

        return new ParkingZoneDto
        {
            Id = zone.Id,
            EventId = zone.EventId,
            Name = zone.Name,
            VehicleType =
                zone.VehicleType.ToString(),
            Fee = zone.Fee,
            IsOnlineBookable =
                zone.IsOnlineBookable,
            DisplayOrder =
                zone.DisplayOrder
        };
    }

    public async Task<ParkingZoneDto>
        UpdateAsync(
            int zoneId,
            UpdateParkingZoneRequest request,
            CancellationToken cancellationToken = default)
    {
        var zone =
            await _zoneRepository.GetByIdAsync(
                zoneId,
                cancellationToken);

        if (zone is null)
        {
            throw new KeyNotFoundException(
                "Parking zone was not found.");
        }

        zone.Name =
            ParkingValidator
                .NormalizeZoneName(
                    request.Name);

        zone.VehicleType =
            request.VehicleType;

        /*
         * Important:
         * Updating current zone fee does NOT alter
         * ParkingReservation.FeeSnapshot.
         */
        zone.Fee = request.Fee;

        zone.IsOnlineBookable =
            request.IsOnlineBookable;

        zone.DisplayOrder =
            request.DisplayOrder;

        await _zoneRepository.SaveChangesAsync(
            cancellationToken);

        return new ParkingZoneDto
        {
            Id = zone.Id,
            EventId = zone.EventId,
            Name = zone.Name,

            VehicleType =
                zone.VehicleType.ToString(),

            Fee = zone.Fee,

            IsOnlineBookable =
                zone.IsOnlineBookable,

            DisplayOrder =
                zone.DisplayOrder,

            SlotCount =
                zone.ParkingSlots.Count
        };
    }
}