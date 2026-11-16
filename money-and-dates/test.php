<?php
declare(strict_types=1);

require __DIR__ . '/Format.php';

$failed = 0;
function check(string $name, mixed $actual, mixed $expected): void
{
    global $failed;
    $ok = $actual === $expected;
    if (!$ok) {
        $failed++;
    }
    printf("%s %s%s\n", $ok ? 'ok  ' : 'FAIL', $name, $ok ? '' : ' → got ' . var_export($actual, true));
}

$nb = "\u{00A0}";
check('price fi', format_price(123450, 'fi'), "1{$nb}234,50{$nb}€");
check('price en', format_price(123450, 'en'), '€1,234.50');
check('negative price (credit note)', format_price(-2990, 'fi'), "-29,90{$nb}€");
check('rate fi', format_rate(2550, 'fi'), '25,5');
check('rate en whole', format_rate(1400, 'en'), '14');
check('vat split adds up', split_vat(2990, 2550), ['net' => 2382, 'vat' => 608, 'gross' => 2990]);
check('friday + 1 working day = monday', add_working_days('2026-11-13', 1), '2026-11-16');
check('zero days', add_working_days('2026-11-14', 0), '2026-11-14');
try {
    add_working_days('2026-02-30', 1);
    check('impossible date rejected', 'accepted', 'rejected');
} catch (InvalidArgumentException) {
    check('impossible date rejected', true, true);
}

exit($failed ? 1 : 0);
