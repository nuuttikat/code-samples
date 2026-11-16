import { beforeEach, describe, expect, it } from 'vitest'
import { addToCart, cartCount, clampQuantity, readCart, removeFromCart } from './cart.js'

beforeEach(() => window.localStorage.clear())

describe('cart', () => {
  it('adds lines and merges the same product + options', () => {
    addToCart({ slug: 'cable-clip', options: ['black'] })
    addToCart({ slug: 'cable-clip', quantity: 2, options: ['black'] })
    addToCart({ slug: 'cable-clip', options: ['white'] })
    expect(readCart()).toEqual([
      { slug: 'cable-clip', quantity: 3, options: ['black'] },
      { slug: 'cable-clip', quantity: 1, options: ['white'] },
    ])
    expect(cartCount(readCart())).toBe(4)
  })

  it('removes a line', () => {
    addToCart({ slug: 'a' })
    addToCart({ slug: 'b' })
    removeFromCart(0)
    expect(readCart().map((i) => i.slug)).toEqual(['b'])
  })

  it('drops broken or tampered data instead of crashing', () => {
    window.localStorage.setItem('demo_cart', '{not json')
    expect(readCart()).toEqual([])
    window.localStorage.setItem('demo_cart', JSON.stringify([{ slug: 'a', quantity: -5, options: [] }, { slug: 'b', quantity: 99999, options: [] }, 'x']))
    expect(readCart()).toEqual([{ slug: 'b', quantity: 500, options: [] }])
  })

  it('never stores prices', () => {
    addToCart({ slug: 'a', price: 1 })
    expect(window.localStorage.getItem('demo_cart')).not.toContain('price')
  })

  it('clamps typed quantities to 1…500', () => {
    expect(clampQuantity('0')).toBe(1)
    expect(clampQuantity('abc')).toBe(1)
    expect(clampQuantity('12')).toBe(12)
    expect(clampQuantity(10000)).toBe(500)
  })
})
