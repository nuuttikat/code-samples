# playwright-mobile-check

An automatic test that opens every page at small and large phone sizes and fails if:

- anything sticks out past the screen edge (the classic "page scrolls sideways on iPhone" bug)
- the page throws a JavaScript error or logs a console error
- any request fails or answers with an error code

It also saves a full-page screenshot of each page per device, so a quick look through `test-results/` shows every page on every phone. Adapted from the test suite of a web shop I built, where it runs before each release.

`demo/broken.html` is broken on purpose to prove the check catches it. The demo is served by `serve.js`, a tiny server that only serves files inside `demo/`.

```bash
npm install
npx playwright install chromium
npm test
```
