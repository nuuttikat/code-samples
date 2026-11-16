<?php
declare(strict_types=1);

// Finnish creditor reference number (viitenumero) and virtual barcode (virtuaaliviivakoodi).
// Rules: Finance Finland's public guide for reference numbers and the bank barcode, version 4.

final class ReferenceNumber
{
    /** Base part 3–19 digits + check digit (weights 7, 3, 1 from the right). */
    public static function create(string $base): string
    {
        if (!preg_match('/^\d{3,19}$/', $base)) {
            throw new InvalidArgumentException('Base must be 3–19 digits.');
        }
        return $base . self::checkDigit($base);
    }

    /** True if the reference (spaces allowed) has a valid check digit. */
    public static function isValid(string $ref): bool
    {
        $ref = str_replace(' ', '', $ref);
        if (!preg_match('/^\d{4,20}$/', $ref)) {
            return false;
        }
        return self::checkDigit(substr($ref, 0, -1)) === (int) substr($ref, -1);
    }

    /** "1234561" → "12 34561": groups of five from the right, as printed on invoices. */
    public static function grouped(string $ref): string
    {
        return trim(strrev(chunk_split(strrev($ref), 5, ' ')));
    }

    private static function checkDigit(string $base): int
    {
        $weights = [7, 3, 1];
        $sum = 0;
        foreach (str_split(strrev($base)) as $i => $digit) {
            $sum += (int) $digit * $weights[$i % 3];
        }
        return (10 - $sum % 10) % 10;
    }
}

final class VirtualBarcode
{
    /**
     * Version 4 (Finnish IBAN + national reference), 54 digits:
     * 4 | account 16 | euros 6 | cents 2 | reserved 000 | reference 20 | due date YYMMDD
     */
    public static function create(string $iban, int $cents, string $ref, DateTimeInterface $due): string
    {
        $iban = strtoupper(str_replace(' ', '', $iban));
        $ref = str_replace(' ', '', $ref);
        if (!preg_match('/^FI\d{16}$/', $iban)) {
            throw new InvalidArgumentException('Finnish IBAN expected.');
        }
        if ($cents < 0 || $cents > 99_999_999) {
            throw new InvalidArgumentException('Amount out of range (0–999 999,99 €).');
        }
        if (!ReferenceNumber::isValid($ref)) {
            throw new InvalidArgumentException('Invalid reference number.');
        }
        return '4'
            . substr($iban, 2)
            . str_pad((string) intdiv($cents, 100), 6, '0', STR_PAD_LEFT)
            . str_pad((string) ($cents % 100), 2, '0', STR_PAD_LEFT)
            . '000'
            . str_pad($ref, 20, '0', STR_PAD_LEFT)
            . $due->format('ymd');
    }
}
