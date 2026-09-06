using System.Security.Claims;
using EventParkingReservationSystem.API.Interfaces.Services.Notifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EventParkingReservationSystem.API.Controllers.Notifications
{
    [ApiController]
    [Route("api/notifications")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationsController(
            INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        // GET: /api/notifications/customer/5
        [HttpGet("customer/{customerId:int}")]
        public async Task<IActionResult> GetCustomerNotifications(
            int customerId)
        {
            var authenticatedCustomerId = GetAuthenticatedCustomerId();

            if (authenticatedCustomerId == null)
            {
                return Unauthorized();
            }

            if (authenticatedCustomerId.Value != customerId)
            {
                return Forbid();
            }

            var notifications =
                await _notificationService
                    .GetCustomerNotificationsAsync(customerId);

            return Ok(notifications);
        }

        // GET: /api/notifications/customer/5/unread-count
        [HttpGet("customer/{customerId:int}/unread-count")]
        public async Task<IActionResult> GetUnreadCount(
            int customerId)
        {
            var authenticatedCustomerId = GetAuthenticatedCustomerId();

            if (authenticatedCustomerId == null)
            {
                return Unauthorized();
            }

            if (authenticatedCustomerId.Value != customerId)
            {
                return Forbid();
            }

            var unreadCount =
                await _notificationService
                    .GetUnreadCountAsync(customerId);

            return Ok(new
            {
                UnreadCount = unreadCount
            });
        }

        // PUT: /api/notifications/10/read
        [HttpPut("{notificationId:int}/read")]
        public async Task<IActionResult> MarkAsRead(
            int notificationId)
        {
            var customerId = GetAuthenticatedCustomerId();

            if (customerId == null)
            {
                return Unauthorized();
            }

            var updated =
                await _notificationService.MarkAsReadAsync(
                    notificationId,
                    customerId.Value);

            if (!updated)
            {
                return NotFound(new
                {
                    Message = "Notification was not found."
                });
            }

            return NoContent();
        }

        private int? GetAuthenticatedCustomerId()
        {
            var customerIdValue =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier);

            if (!int.TryParse(
                    customerIdValue,
                    out var customerId))
            {
                return null;
            }

            return customerId;
        }
    }
}