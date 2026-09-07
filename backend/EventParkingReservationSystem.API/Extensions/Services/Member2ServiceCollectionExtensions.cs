using EventParkingReservationSystem.API.Interfaces.Repositories.Categories;
using EventParkingReservationSystem.API.Interfaces.Repositories.Dashboards;
using EventParkingReservationSystem.API.Interfaces.Repositories.Events;
using EventParkingReservationSystem.API.Interfaces.Repositories.Venues;

using EventParkingReservationSystem.API.Interfaces.Services.Categories;
using EventParkingReservationSystem.API.Interfaces.Services.Dashboards;
using EventParkingReservationSystem.API.Interfaces.Services.Events;
using EventParkingReservationSystem.API.Interfaces.Services.Venues;

using EventParkingReservationSystem.API.Repositories.Categories;
using EventParkingReservationSystem.API.Repositories.Dashboards;
using EventParkingReservationSystem.API.Repositories.Events;
using EventParkingReservationSystem.API.Repositories.Venues;

using EventParkingReservationSystem.API.Services.Categories;
using EventParkingReservationSystem.API.Services.Dashboards;
using EventParkingReservationSystem.API.Services.Events;
using EventParkingReservationSystem.API.Services.Venues;

namespace EventParkingReservationSystem.API.Extensions.Services;

public static class Member2ServiceCollectionExtensions
{
    public static IServiceCollection AddMember2Module(
        this IServiceCollection services)
    {
        services.AddMemoryCache();

        services.AddScoped<
            IVenueRepository,
            VenueRepository>();

        services.AddScoped<
            ICategoryRepository,
            CategoryRepository>();

        services.AddScoped<
            IEventRepository,
            EventRepository>();

        services.AddScoped<
            IAdminDashboardRepository,
            AdminDashboardRepository>();

        services.AddScoped<
            IVenueService,
            VenueService>();

        services.AddScoped<
            ICategoryService,
            CategoryService>();

        services.AddScoped<
            IEventService,
            EventService>();

        services.AddScoped<
            IAdminDashboardService,
            AdminDashboardService>();

        services.AddScoped<
            IEventPosterStorage,
            LocalEventPosterStorage>();

        return services;
    }
}