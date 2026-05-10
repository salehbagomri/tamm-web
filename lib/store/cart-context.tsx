'use client'

import { createContext, useContext, useReducer, useEffect, useMemo } from 'react'

export type CartItem = {
  id: string
  name: string
  price: number | null
  imageUrl: string | null
  installationPrice: number
  includeInstallation: boolean
  quantity: number
  isPriceOnRequest: boolean
  requiresInstallation: boolean
}

type CartState = { items: CartItem[] }

type CartAction =
  | { type: 'ADD'; item: CartItem }
  | { type: 'REMOVE'; id: string }
  | { type: 'UPDATE'; id: string; quantity: number }
  | { type: 'TOGGLE_INSTALL'; id: string }
  | { type: 'CLEAR' }
  | { type: 'LOAD'; items: CartItem[] }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const exists = state.items.find((i) => i.id === action.item.id)
      if (exists) {
        return { items: state.items.map((i) => i.id === action.item.id ? { ...i, quantity: i.quantity + 1 } : i) }
      }
      return { items: [...state.items, { ...action.item, quantity: 1 }] }
    }
    case 'REMOVE':
      return { items: state.items.filter((i) => i.id !== action.id) }
    case 'UPDATE':
      return { items: state.items.map((i) => i.id === action.id ? { ...i, quantity: Math.max(1, action.quantity) } : i) }
    case 'TOGGLE_INSTALL':
      return { items: state.items.map((i) => i.id === action.id ? { ...i, includeInstallation: !i.includeInstallation } : i) }
    case 'CLEAR':
      return { items: [] }
    case 'LOAD':
      return { items: action.items }
    default:
      return state
  }
}

interface CartContextType {
  items: CartItem[]
  totalItems: number
  totalAmount: number
  addToCart: (item: Omit<CartItem, 'quantity'>) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  toggleInstallation: (id: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

const STORAGE_KEY = 'tamm_cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })

  // تحميل السلة من localStorage عند البداية
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) dispatch({ type: 'LOAD', items: JSON.parse(saved) })
    } catch { /* تجاهل الخطأ */ }
  }, [])

  // حفظ السلة في localStorage عند كل تغيير
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
    } catch { /* تجاهل الخطأ */ }
  }, [state.items])

  const value = useMemo<CartContextType>(() => ({
    items: state.items,
    totalItems: state.items.reduce((s, i) => s + i.quantity, 0),
    totalAmount: state.items.reduce((s, i) => {
      if (i.isPriceOnRequest) return s
      const base = (i.price ?? 0) + (i.includeInstallation ? i.installationPrice : 0)
      return s + base * i.quantity
    }, 0),
    addToCart: (item) => dispatch({ type: 'ADD', item: { ...item, quantity: 1 } }),
    removeFromCart: (id) => dispatch({ type: 'REMOVE', id }),
    updateQuantity: (id, quantity) => dispatch({ type: 'UPDATE', id, quantity }),
    toggleInstallation: (id) => dispatch({ type: 'TOGGLE_INSTALL', id }),
    clearCart: () => dispatch({ type: 'CLEAR' }),
  }), [state.items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
