# react-cart

A shopping cart in React, adapted from a web shop I built.

The cart lives in the browser (`localStorage`) but **stores no prices**, only the product, options and quantity. Prices always come from the catalogue, and in the real shop the server recalculates the order when it is placed. Editing the cart in the browser's developer tools therefore can't change what anyone pays.

- Same product + options adds up into one line; quantities are kept between 1 and 500
- Broken or tampered cart data is dropped instead of crashing the page
- The cart updates across browser tabs
- Business customers can switch prices to VAT 0 %

```bash
npm install
npm run dev    # demo page
npm test       # Vitest
```
