using System.Security.Claims;

using EventParkingReservationSystem.API.Common.Constants;
using EventParkingReservationSystem.API.Interfaces.Services.Notifications;
using EventParkingReservationSystem.API.Models.DTOs.Notifications;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EventParkingReservationSystem.API.Controllers.Notifications
{
    [ApiController]
    [Authorize(Roles = AppRoles.Customer)]
    [Route("api/notifications")]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationsController(
            INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        // GET: /api/notifications/customer/{customerId}
        [HttpGet("customer/{customerId:int}")]
        public async Task<
            ActionResult<IEnumerable<NotificationDto>>>
            GetCustomerNotifications(
                int customerId)
        {
            if (!TryGetAuthenticatedCustomerId(
                    out var authenticatedCustomerId))
            {
                return Unauthorized();
            }

            if (authenticatedCustomerId != customerId)
            {
                return Forbid();
            }

            var notifications =
                await _notificationService
                    .GetCustomerNotificationsAsync(
                        customerId);

            return Ok(notifications);
        }

        // GET: /api/notifications/customer/{customerId}/unread-count
        [HttpGet("customer/{customerId:int}/unread-count")]
        public async Task<ActionResult<int>>
            GetUnreadCount(
                int customerId)
        {
            if (!TryGetAuthenticatedCustomerId(
                    out var authenticatedCustomerId))
            {
                return Unauthorized();
            }

            if (authenticatedCustomerId != customerId)
            {
                return Forbid();
            }

            var unreadCount =
                await _notificationService
                    .GetUnreadCountAsync(
                        customerId);

            return Ok(unreadCount);
        }

        // PUT: /api/notifications/{notificationId}/read
        [HttpPut("{notificationId:int}/read")]
        public async Task<IActionResult>
            MarkAsRead(
                int notificationId)
        {
            if (!TryGetAuthenticatedCustomerId(
                    out var customerId))
            {
                return Unauthorized();
            }

            var updated =
                await _notificationService
                    .MarkAsReadAsync(
                        notificationId,
                        customerId);

            if (!updated)
            {
                return NotFound(
                    new
                    {
                        message =
                            "Notification was not found."
                    });
            }

            return NoContent();
        }

        private bool TryGetAuthenticatedCustomerId(
            out int customerId)
        {
            customerId = 0;

            var customerIdValue =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier);

            return int.TryParse(
                customerIdValue,
                out customerId);
        }
    }
}