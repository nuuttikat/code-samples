# money-and-dates

Helpers for money and dates from a web shop's back end.

- Money is always whole **cents** (`int`), never floats, so totals never drift by a cent
- VAT rates are **basis points** (`2550` = 25,5 %), so the 2024 Finnish VAT change from 24 % to 25,5 % needed no special cases
- `split_vat()` rounds so that net + VAT always equals the gross price on the receipt
- `format_price()` writes `1 234,50 €` in Finnish and `€1,234.50` in English, with non-breaking spaces so a price never wraps onto two lines
- `add_working_days()` gives delivery estimates and rejects impossible dates like 30 February

Run the tests: `php test.php`
