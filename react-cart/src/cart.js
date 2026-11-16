import { useEffect, useState } from 'react'

// Shopping cart kept on the customer's device (localStorage). Only product + options +
// quantity are stored, never prices: prices always come from the catalogue (in a real shop,
// the server recalculates everything when the order is placed, so an edited cart can't
// change what the customer pays).
const STORAGE_KEY = 'demo_cart'
const CHANGE_EVENT = 'demo-cart'
export const MAX_QUANTITY = 500

const isLine = (i) =>
  i && typeof i.slug === 'string' && Number.isInteger(i.quantity) && i.quantity > 0 && Array.isArray(i.options)

/** Cart from storage. Anything broken or tampered with is dropped instead of crashing the page. */
export function readCart() {
  try {
    const items = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(items) ? items.filter(isLine).map((i) => ({ ...i, quantity: clampQuantity(i.quantity) })) : []
  } catch {
    return []
  }
}

export function writeCart(items) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // storage blocked (private mode): the cart lasts only for this page
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

const sameLine = (a, b) => a.slug === b.slug && [...a.options].sort().join() === [...b.options].sort().join()

/** Add a line, or raise the quantity if the same product + options is already in the cart. */
export function addToCart({ slug, quantity = 1, options = [] }) {
  const items = readCart()
  const existing = items.find((i) => sameLine(i, { slug, options }))
  if (existing) existing.quantity = clampQuantity(existing.quantity + quantity)
  else items.push({ slug, quantity: clampQuantity(quantity), options: [...options] })
  writeCart(items)
}

export function removeFromCart(index) {
  writeCart(readCart().filter((_, i) => i !== index))
}

/** Current cart; updates when it changes on this page or in another tab. */
export function useCart() {
  const [items, setItems] = useState([])
  useEffect(() => {
    const update = () => setItems(readCart())
    update()
    window.addEventListener(CHANGE_EVENT, update)
    window.addEventListener('storage', update)
    return () => {
      window.removeEventListener(CHANGE_EVENT, update)
      window.removeEventListener('storage', update)
    }
  }, [])
  return items
}

export const cartCount = (items) => items.reduce((sum, i) => sum + i.quantity, 0)

/** Quantity typed by the customer → 1…500. */
export const clampQuantity = (value) => Math.min(MAX_QUANTITY, Math.max(1, parseInt(value, 10) || 1))
