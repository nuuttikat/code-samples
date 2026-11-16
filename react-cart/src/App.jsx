import { useState } from 'react'
import { addToCart, cartCount, removeFromCart, useCart } from './cart.js'
import { cartTotal, formatPrice, withoutVat } from './price.js'

// Demo catalogue. In a real shop this comes from the API.
const VAT_BP = 2550
const CATALOGUE = [
  { slug: 'phone-stand', name: 'Puhelinteline', price: 1490 },
  { slug: 'cable-clip', name: 'Johtopidike (5 kpl)', price: 690 },
  { slug: 'plant-pot', name: 'Kukkaruukku', price: 2290 },
]

export default function App() {
  const items = useCart()
  const [business, setBusiness] = useState(false)
  const total = cartTotal(items, CATALOGUE)
  const shown = (cents) => formatPrice(business ? withoutVat(cents, VAT_BP) : cents, 'fi')

  return (
    <main>
      <h1>Tuotteet</h1>
      <label>
        <input type="checkbox" checked={business} onChange={(e) => setBusiness(e.target.checked)} /> Yritysasiakas (alv 0 %)
      </label>
      <ul>
        {CATALOGUE.map((p) => (
          <li key={p.slug}>
            {p.name} {shown(p.price)}{' '}
            <button type="button" onClick={() => addToCart({ slug: p.slug })}>Lisää koriin</button>
          </li>
        ))}
      </ul>
      <h2>Ostoskori ({cartCount(items)})</h2>
      <ul>
        {items.map((i, index) => {
          const product = CATALOGUE.find((p) => p.slug === i.slug)
          if (!product) return null
          return (
            <li key={`${i.slug}-${index}`}>
              {i.quantity} × {product.name}{' '}
              <button type="button" onClick={() => removeFromCart(index)}>Poista</button>
            </li>
          )
        })}
      </ul>
      <p>Yhteensä {shown(total)} {business ? 'alv 0 %' : 'sis. alv 25,5 %'}</p>
    </main>
  )
}
