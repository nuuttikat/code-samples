import { describe, expect, it } from 'vitest'
import { cartTotal, withoutVat } from './price.js'

const catalogue = [
  { slug: 'a', price: 1490 },
  { slug: 'b', price: 690 },
]

describe('price', () => {
  it('removes 25,5 % VAT', () => {
    expect(withoutVat(2990, 2550)).toBe(2382)
  })

  it('totals the cart from catalogue prices and skips missing products', () => {
    const items = [
      { slug: 'a', quantity: 2, options: [] },
      { slug: 'gone', quantity: 1, options: [] },
      { slug: 'b', quantity: 1, options: [] },
    ]
    expect(cartTotal(items, catalogue)).toBe(3670)
  })
})
