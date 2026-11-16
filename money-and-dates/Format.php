<?php
declare(strict_types=1);

// Money, VAT and date helpers. Money is always whole cents (int) so sums never drift
// like floats do; VAT rates are basis points (2550 = 25,5 %).

/** fi/sv "1 234,50 €", en "€1,234.50". Non-breaking spaces so the price never wraps. */
function format_price(int $cents, string $lang): string
{
    $sign = $cents < 0 ? '-' : '';
    $euros = abs($cents) / 100;
    if ($lang === 'en') {
        return $sign . '€' . number_format($euros, 2, '.', ',');
    }
    return $sign . number_format($euros, 2, ',', "\u{00A0}") . "\u{00A0}€";
}

/** 2550 → "25,5" (fi/sv) or "25.5" (en). */
function format_rate(int $bp, string $lang): string
{
    $rate = rtrim(rtrim(number_format($bp / 100, 2, '.', ''), '0'), '.');
    return $lang === 'en' ? $rate : str_replace('.', ',', $rate);
}

/** Split a VAT-inclusive price into net + VAT, rounded so that net + vat === gross. */
function split_vat(int $grossCents, int $vatBp): array
{
    $net = (int) round($grossCents * 10000 / (10000 + $vatBp));
    return ['net' => $net, 'vat' => $grossCents - $net, 'gross' => $grossCents];
}

/** Date $days working days (Mon–Fri) after $ymd. Public holidays are not skipped. */
function add_working_days(string $ymd, int $days): string
{
    if ($days < 0) {
        throw new InvalidArgumentException('Days must be zero or more.');
    }
    $date = DateTimeImmutable::createFromFormat('!Y-m-d', $ymd);
    if ($date === false || $date->format('Y-m-d') !== $ymd) {
        throw new InvalidArgumentException('Date must be YYYY-MM-DD.');
    }
    while ($days > 0) {
        $date = $date->modify('+1 day');
        if ((int) $date->format('N') <= 5) {
            $days--;
        }
    }
    return $date->format('Y-m-d');
}
