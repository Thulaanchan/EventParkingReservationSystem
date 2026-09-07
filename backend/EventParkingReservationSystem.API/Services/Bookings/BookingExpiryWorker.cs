using EventParkingReservationSystem.API.Interfaces.Services.Bookings;

namespace EventParkingReservationSystem.API.Services.Bookings;

public class BookingExpiryWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<BookingExpiryWorker> _logger;

    public BookingExpiryWorker(
        IServiceScopeFactory scopeFactory,
        ILogger<BookingExpiryWorker> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(
        CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope =
                    _scopeFactory.CreateScope();

                var bookingService =
                    scope.ServiceProvider
                        .GetRequiredService<IBookingService>();

                var expiredCount =
                    await bookingService
                        .ExpirePendingBookingsAsync(
                            DateTime.UtcNow);

                if (expiredCount > 0)
                {
                    _logger.LogInformation(
                        "Expired {ExpiredBookingCount} pending bookings.",
                        expiredCount);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "An error occurred while expiring pending bookings.");
            }

            await Task.Delay(
                TimeSpan.FromMinutes(1),
                stoppingToken);
        }
    }
}