import type { OrderItem } from '@/lib/types/order'

// قواعد الحساب الموحّدة لكل سطوح عرض الطلب.
// المصدر: unitPrice = صافي السلعة، installationPricePerUnit = أجور التركيب لكل وحدة،
// includeInstallation = هل التركيب مفعّل لهذا السطر.

export type LineTotals = {
  productSubtotal: number      // unitPrice × quantity
  installationSubtotal: number // installationPricePerUnit × quantity (إن فُعِّل)
  lineTotal: number            // productSubtotal + installationSubtotal
  hasInstallation: boolean
}

export function computeLineTotals(item: OrderItem): LineTotals {
  const qty = item.quantity ?? 0
  const productSubtotal = (item.unitPrice ?? 0) * qty
  const hasInstallation = !!item.includeInstallation && (item.installationPricePerUnit ?? 0) > 0
  const installationSubtotal = hasInstallation ? (item.installationPricePerUnit ?? 0) * qty : 0
  return {
    productSubtotal,
    installationSubtotal,
    lineTotal: productSubtotal + installationSubtotal,
    hasInstallation,
  }
}

export type OrderTotals = {
  productsSubtotal: number
  installationSubtotal: number
  grandTotal: number
  itemsCount: number              // مجموع الكميات
  installationItemsCount: number  // عدد السطور التي فعّلت التركيب
}

export function computeOrderTotals(items: OrderItem[]): OrderTotals {
  let productsSubtotal = 0
  let installationSubtotal = 0
  let itemsCount = 0
  let installationItemsCount = 0

  for (const it of items) {
    const t = computeLineTotals(it)
    productsSubtotal += t.productSubtotal
    installationSubtotal += t.installationSubtotal
    itemsCount += it.quantity ?? 0
    if (t.hasInstallation) installationItemsCount += 1
  }

  return {
    productsSubtotal,
    installationSubtotal,
    grandTotal: productsSubtotal + installationSubtotal,
    itemsCount,
    installationItemsCount,
  }
}
