// Prices are cents INCLUDING VAT; vatBp is VAT in basis points (2550 = 25,5 %).
const LOCALES = { fi: 'fi-FI', en: 'en-IE' }

export const formatPrice = (cents, lang) =>
  (cents / 100).toLocaleString(LOCALES[lang] || 'fi-FI', { style: 'currency', currency: 'EUR' })

export const withoutVat = (cents, vatBp) => Math.round((cents * 10000) / (10000 + vatBp))

/** Cart total from the catalogue's prices. Lines for products that no longer exist are skipped. */
export function cartTotal(items, catalogue) {
  return items.reduce((sum, i) => {
    const product = catalogue.find((p) => p.slug === i.slug)
    return product ? sum + product.price * i.quantity : sum
  }, 0)
}
