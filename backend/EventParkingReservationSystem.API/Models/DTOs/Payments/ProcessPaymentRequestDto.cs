using System.ComponentModel.DataAnnotations;
using EventParkingReservationSystem.API.Enums.Payments;

namespace EventParkingReservationSystem.API.Models.DTOs.Payments
{
    public class ProcessPaymentRequestDto
    {
        [Required]
        public PaymentMethod PaymentMethod { get; set; }

        [MaxLength(100)]
        public string? CardholderName { get; set; }

        /*
         * SIMULATION VALUES ONLY.
         *
         * Never persist or log these values.
         * Angular must clearly tell the user to use test values.
         */
        [MaxLength(19)]
        public string? TestCardNumber { get; set; }

        [RegularExpression(
            @"^(0[1-9]|1[0-2])\/\d{2}$",
            ErrorMessage = "Expiry must use MM/YY format."
        )]
        public string? Expiry { get; set; }

        [RegularExpression(
            @"^\d{3}$",
            ErrorMessage = "CVV must contain exactly 3 digits."
        )]
        public string? TestCvv { get; set; }
    }
}