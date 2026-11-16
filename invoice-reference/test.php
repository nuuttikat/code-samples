<?php
declare(strict_types=1);

require __DIR__ . '/ReferenceNumber.php';

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
function throws(string $name, callable $fn): void
{
    try {
        $fn();
        check($name, 'no exception', 'exception');
    } catch (InvalidArgumentException) {
        check($name, true, true);
    }
}

check('check digit', ReferenceNumber::create('123456'), '1234561');
check('valid reference', ReferenceNumber::isValid('12 34561'), true);
check('wrong check digit', ReferenceNumber::isValid('1234562'), false);
check('letters are invalid', ReferenceNumber::isValid('12345a1'), false);
check('grouping', ReferenceNumber::grouped('86851625961989'), '8685 16259 61989');
throws('too short base', fn () => ReferenceNumber::create('12'));

// Example from Finance Finland's barcode guide (public test data, not a real account).
check(
    'virtual barcode',
    VirtualBarcode::create('FI79 4405 2020 0360 82', 488315, '86851 62596 19897', new DateTimeImmutable('2010-06-12')),
    '479440520200360820048831500000000868516259619897100612'
);
throws('foreign IBAN', fn () => VirtualBarcode::create('SE45 5000 0000 0583 9825 7466', 100, '1234561', new DateTimeImmutable()));
throws('negative amount', fn () => VirtualBarcode::create('FI79 4405 2020 0360 82', -1, '1234561', new DateTimeImmutable()));
throws('bad reference', fn () => VirtualBarcode::create('FI79 4405 2020 0360 82', 100, '1234562', new DateTimeImmutable()));

exit($failed ? 1 : 0);
