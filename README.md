# Code samples · Koodiesimerkit

Small, working pieces of code that show how I write software. Most of my code lives in private repositories because it is production code for businesses, so I took parts of it, removed everything specific to those businesses (names, data, addresses, business rules) and turned them into standalone samples with tests.

*Pieniä, toimivia koodiesimerkkejä siitä, miten kirjoitan ohjelmistoja. Suurin osa koodistani on yksityisissä repositorioissa, koska se on yritysten tuotantokoodia. Otin siitä osia, poistin kaiken yrityksiin liittyvän ja tein niistä itsenäisiä, testattuja esimerkkejä.*

| Sample | Stack | What it shows |
|---|---|---|
| [invoice-reference](invoice-reference/) | PHP 8 | Finnish invoice reference numbers and the bank virtual barcode |
| [money-and-dates](money-and-dates/) | PHP 8 | Money as whole cents, VAT split, prices per language, working days |
| [react-cart](react-cart/) | React, Vite, Vitest | A shopping cart that never trusts the browser with prices |
| [express-auth](express-auth/) | Node.js, Express, JWT, bcrypt | Login and admin roles done securely, with tests that try to break them |
| [playwright-mobile-check](playwright-mobile-check/) | Playwright | Automatic check that pages fit phone screens without errors |

Every sample runs on its own and is tested on each push (see [.github/workflows](.github/workflows/)).

Nuutti Katajala · [nuuttikat.github.io](https://nuuttikat.github.io)
