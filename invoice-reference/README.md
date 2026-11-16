# invoice-reference

Finnish creditor reference numbers (*viitenumero*) and the version 4 virtual barcode (*virtuaaliviivakoodi*) that customers paste into their online bank.

Adapted from invoicing code I've written for a web service where every invoice is created automatically with a reference number and barcode.

- `ReferenceNumber::create('123456')` → `1234561` (check digit with weights 7, 3, 1 from the right)
- `ReferenceNumber::grouped()` prints it in groups of five, the way invoices show it
- `VirtualBarcode::create()` builds the 54-digit barcode and refuses bad input (non-Finnish IBAN, invalid reference, amount out of range) instead of printing a barcode that pays the wrong thing

Run the tests: `php test.php`

**What I learned:** money code should fail loudly. An exception during invoicing is easy to fix; a barcode with a wrong reference means a payment nobody can match.
