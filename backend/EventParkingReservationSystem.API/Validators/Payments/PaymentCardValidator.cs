using System.Text.RegularExpressions;

namespace EventParkingReservationSystem.API.Validators.Payments
{
    public static class PaymentCardValidator
    {
        public static bool IsValidCardNumber(string? cardNumber)
        {
            if (string.IsNullOrWhiteSpace(cardNumber))
                return false;

            // Allow spaces in card number input.
            var digitsOnly = cardNumber.Replace(" ", "");

            // Our simulation uses 16-digit card numbers.
            if (!Regex.IsMatch(digitsOnly, @"^\d{16}$"))
                return false;

            return PassesLuhnCheck(digitsOnly);
        }

        public static bool IsValidCvv(string? cvv)
        {
            // Project requirement: exactly 3 digits.
            return !string.IsNullOrWhiteSpace(cvv)
                && Regex.IsMatch(cvv, @"^\d{3}$");
        }

        public static bool IsValidExpiryFormat(string? expiry)
        {
            if (string.IsNullOrWhiteSpace(expiry))
                return false;

            // Required format: MM/YY
            return Regex.IsMatch(
                expiry,
                @"^(0[1-9]|1[0-2])\/\d{2}$");
        }

        public static bool IsExpiryInFuture(string? expiry)
        {
            if (!IsValidExpiryFormat(expiry))
                return false;

            var parts = expiry!.Split('/');

            int month = int.Parse(parts[0]);
            int year = 2000 + int.Parse(parts[1]);

            // Expiry is valid until the end of the selected month.
            var expiryDate = new DateTime(year, month, 1)
                .AddMonths(1)
                .AddTicks(-1);

            return expiryDate >= DateTime.UtcNow;
        }

        private static bool PassesLuhnCheck(string cardNumber)
        {
            int sum = 0;
            bool shouldDouble = false;

            for (int i = cardNumber.Length - 1; i >= 0; i--)
            {
                int digit = cardNumber[i] - '0';

                if (shouldDouble)
                {
                    digit *= 2;

                    if (digit > 9)
                        digit -= 9;
                }

                sum += digit;
                shouldDouble = !shouldDouble;
            }

            return sum % 10 == 0;
        }
    }
}