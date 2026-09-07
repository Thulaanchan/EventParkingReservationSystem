using System.Security.Claims;

using EventParkingReservationSystem.API.Common.Constants;
using EventParkingReservationSystem.API.Interfaces.Services.Payments;
using EventParkingReservationSystem.API.Models.DTOs.Payments;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EventParkingReservationSystem.API.Controllers.Payments
{
    [ApiController]
    [Authorize]
    [Route("api")]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentsController(
            IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        // GET: /api/bookings/{bookingId}/payment
        [Authorize(Roles = AppRoles.Customer)]
        [HttpGet("bookings/{bookingId:int}/payment")]
        public async Task<ActionResult<BookingPaymentDto>>
            GetBookingPayment(int bookingId)
        {
            if (!TryGetAuthenticatedCustomerId(
                    out var customerId))
            {
                return Unauthorized();
            }

            var payment =
                await _paymentService
                    .GetBookingPaymentAsync(
                        bookingId,
                        customerId);

            if (payment == null)
            {
                return NotFound(
                    new
                    {
                        message =
                            "Booking or payment information was not found."
                    });
            }

            return Ok(payment);
        }

        // POST: /api/bookings/{bookingId}/payment
        [Authorize(Roles = AppRoles.Customer)]
        [HttpPost("bookings/{bookingId:int}/payment")]
        public async Task<ActionResult<PaymentResultDto>>
            ProcessPayment(
                int bookingId,
                [FromBody] ProcessPaymentRequestDto request)
        {
            if (!TryGetAuthenticatedCustomerId(
                    out var customerId))
            {
                return Unauthorized();
            }

            try
            {
                var result =
                    await _paymentService
                        .ProcessPaymentAsync(
                            bookingId,
                            customerId,
                            request);

                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(
                    new
                    {
                        message = ex.Message
                    });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(
                    new
                    {
                        message = ex.Message
                    });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(
                    new
                    {
                        message = ex.Message
                    });
            }
        }

        // GET: /api/payments/customer/{customerId}
        [Authorize(Roles = AppRoles.Customer)]
        [HttpGet("payments/customer/{customerId:int}")]
        public async Task<
            ActionResult<IEnumerable<PaymentHistoryDto>>>
            GetCustomerPaymentHistory(
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

            var payments =
                await _paymentService
                    .GetCustomerPaymentHistoryAsync(
                        customerId);

            return Ok(payments);
        }

        // GET: /api/payments/{paymentId}/receipt
        [Authorize(Roles = AppRoles.Customer)]
        [HttpGet("payments/{paymentId:int}/receipt")]
        public async Task<ActionResult<PaymentReceiptDto>>
            GetReceipt(int paymentId)
        {
            if (!TryGetAuthenticatedCustomerId(
                    out var customerId))
            {
                return Unauthorized();
            }

            var receipt =
                await _paymentService
                    .GetReceiptAsync(
                        paymentId,
                        customerId);

            if (receipt == null)
            {
                return NotFound(
                    new
                    {
                        message =
                            "Payment receipt was not found."
                    });
            }

            return Ok(receipt);
        }

        // GET: /api/payments
        // Administrator only
        [Authorize(Roles = AppRoles.Administrator)]
        [HttpGet("payments")]
        public async Task<
            ActionResult<IEnumerable<PaymentHistoryDto>>>
            GetAllPayments()
        {
            var payments =
                await _paymentService
                    .GetAllPaymentsAsync();

            return Ok(payments);
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