import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient, createAdminClient } from '@/lib/supabase/server'
import { getInvoiceByOrderId, createInvoiceForOrder } from '@/lib/actions/admin/invoices'
import { getAdminOrderById } from '@/lib/data/admin/orders'
import { getOrderById } from '@/lib/data/orders'
import PrintInvoiceButton from '@/components/customer/orders/PrintInvoiceButton'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  return {
    title: `فاتورة طلب #${id.substring(0, 8)} | تمّ`,
  }
}

export default async function InvoicePage({ params }: Props) {
  const { id: orderId } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // التحقق من دور المستخدم (عميل أم مدير)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isManager = profile?.role === 'manager'

  // جلب الطلب بناءً على صلاحية المستخدم لحماية البيانات RLS
  let order = null
  if (isManager) {
    order = await getAdminOrderById(orderId)
  } else {
    order = await getOrderById(orderId, user.id)
  }

  if (!order) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#080E18',
        color: '#E8F0F8',
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'var(--font-alexandria), sans-serif',
      }}>
        <div style={{
          backgroundColor: '#0D1825',
          border: '1px solid #1A2E44',
          borderRadius: '16px',
          padding: '2.5rem',
          maxWidth: '500px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
        }}>
          <span style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}>⚠️</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#E8F0F8' }}>الطلب غير موجود</h2>
          <p style={{ color: '#7A96B0', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            عذراً، الطلب الذي تحاول الوصول إليه غير موجود أو غير مصرح لك بالوصول إليه. يرجى التأكد من الرابط الصحيح والمحاولة مرة أخرى.
          </p>
          <Link href={isManager ? '/admin/dashboard' : '/home'} style={{
            display: 'inline-block',
            padding: '0.75rem 2rem',
            backgroundColor: '#1576D4',
            color: '#fff',
            borderRadius: '10px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            transition: 'background 0.2s',
          }}>
            العودة للرئيسية
          </Link>
        </div>
      </div>
    )
  }

  // جلب الفاتورة
  let invoice = await getInvoiceByOrderId(orderId)

  // إذا كان الطلب مكتملاً ولم تكن له فاتورة، نقوم بإنشائها فوراً لتلافي أي فجوة في الطلبات السابقة
  if (!invoice && order.status === 'completed') {
    // نستخدم حساب الأدمن لتوليد الفاتورة تلقائياً بدون قيود صلاحية المدير إن كان عميلاً يستعرض طلبه المكتمل
    const adminClient = createAdminClient()
    
    // حساب المجموع الفرعي ورسوم التركيب
    let subtotal = 0
    let installationFee = 0

    order.items.forEach(item => {
      const quantity = item.quantity ?? 1
      const unitPrice = item.unitPrice ?? 0
      const itemTotal = item.totalPrice ?? (unitPrice * quantity)
      
      const baseTotal = unitPrice * quantity
      const installPart = Math.max(0, itemTotal - baseTotal)

      subtotal += baseTotal
      installationFee += installPart
    })

    if (subtotal === 0 && order.totalAmount > 0) {
      subtotal = order.totalAmount
      installationFee = 0
    }

    const year = new Date().getFullYear()
    const { count } = await adminClient
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${year}-01-01T00:00:00Z`)

    const serialNum = String((count ?? 0) + 1).padStart(4, '0')
    const invoiceNumber = `INV-${year}-${serialNum}`

    const { data: newInvoice } = await adminClient
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        order_id: orderId,
        customer_id: order.customerId,
        subtotal,
        installation_fee: installationFee,
        total_amount: order.totalAmount,
        payment_type: order.paymentType,
        pdf_url: `/orders/${orderId}/invoice`
      })
      .select('*')
      .single()

    if (newInvoice) {
      invoice = {
        id: newInvoice.id,
        invoiceNumber: newInvoice.invoice_number,
        orderId: newInvoice.order_id,
        customerId: newInvoice.customer_id,
        subtotal: Number(newInvoice.subtotal),
        installationFee: Number(newInvoice.installation_fee),
        totalAmount: Number(newInvoice.total_amount),
        paymentType: newInvoice.payment_type,
        pdfUrl: newInvoice.pdf_url ?? null,
        issuedAt: newInvoice.issued_at,
        createdAt: newInvoice.created_at
      }
    }
  }

  // إذا لم تكن هناك فاتورة بعد (مثلاً الطلب ليس مكتملاً بعد)
  if (!invoice) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '2.5rem',
          maxWidth: '500px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
        }}>
          <span style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}>📄</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>لم يتم إصدار الفاتورة بعد</h2>
          <p style={{ color: 'var(--text-second)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            تُصدر الفواتير تلقائياً فور اكتمال الطلب وتأكيده من قبل الإدارة. حالة طلبك الحالية هي: 
            <strong style={{ color: 'var(--warning)', marginRight: '0.25rem' }}>{
              order.status === 'pending' ? 'قيد الانتظار' :
              order.status === 'confirmed' ? 'تم التأكيد' :
              order.status === 'assigned' ? 'تم تعيين فني' :
              order.status === 'on_the_way' ? 'الفني في الطريق' :
              order.status === 'in_progress' ? 'قيد العمل' :
              order.status === 'cancelled' ? 'ملغي' : order.status
            }</strong>
          </p>
          <Link href={isManager ? `/admin/orders/${orderId}` : `/orders/${orderId}`} style={{
            display: 'inline-block',
            padding: '0.75rem 2rem',
            backgroundColor: 'var(--blue-primary)',
            color: '#fff',
            borderRadius: '10px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            transition: 'background 0.2s',
          }}>
            العودة لتفاصيل الطلب
          </Link>
        </div>
      </div>
    )
  }

  // تنسيق الدفع بالعربية
  const paymentMethodLabels: Record<string, string> = {
    cash: 'نقداً',
    bank: 'تحويل بنكي',
    wallet: 'محفظة إلكترونية',
  }

  return (
    <div className="invoice-page-container" style={{
      minHeight: '100vh',
      backgroundColor: '#0a101d', // خلفية مخصصة داكنة على الشاشة تعطي طابعاً فخماً
      padding: '3rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* شريط الإجراءات العلوي - يُخفى عند الطباعة */}
      <div className="no-print" style={{
        width: '100%',
        maxWidth: '800px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
      }}>
        <Link href={isManager ? `/admin/orders/${orderId}` : `/orders/${orderId}`} style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--text-second)',
          textDecoration: 'none',
          fontSize: '0.9rem',
          fontWeight: 500,
        }}>
          <span>→</span>
          العودة للطلب #{order.orderNumber}
        </Link>

        <PrintInvoiceButton />
      </div>

      {/* ورقة الفاتورة الاحترافية - مجهزة للطباعة */}
      <div className="invoice-paper" style={{
        width: '100%',
        maxWidth: '800px',
        backgroundColor: '#ffffff',
        color: '#1f2937',
        borderRadius: '16px',
        padding: '3rem',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
        boxSizing: 'border-box',
        fontFamily: 'var(--font-alexandria), sans-serif',
      }}>
        {/* الترويسة العليا للفاتورة */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '2rem',
          marginBottom: '2rem',
        }}>
          {/* لوجو وبيانات المنصة */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#1576D4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '1.25rem',
                fontWeight: 900,
              }}>ت</span>
              <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em' }}>
                منصة تمّ
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
              لخدمات التكييف المتكاملة وأنظمة الطاقة الشمسية
            </p>
          </div>

          {/* معلومات الفاتورة */}
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 800, color: '#1576D4' }}>
              فاتورة مبيعات
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem', color: '#475569' }}>
              <div>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>رقم الفاتورة:</span> {invoice.invoiceNumber}
              </div>
              <div>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>تاريخ الإصدار:</span> {
                  new Date(invoice.issuedAt).toLocaleDateString('ar-SA', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })
                }
              </div>
              <div>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>رقم الطلب:</span> #{order.orderNumber}
              </div>
            </div>
          </div>
        </div>

        {/* بيانات العميل والتوصيل */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          fontSize: '0.875rem',
          color: '#334155',
        }}>
          <div>
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
              معلومات العميل
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div>
                <span style={{ color: '#64748b' }}>الاسم الكريم:</span>{' '}
                <strong style={{ color: '#0f172a' }}>
                  {order.customerProfile?.fullName || 'عميل منصة تمّ'}
                </strong>
              </div>
              {order.customerProfile?.phone && (
                <div>
                  <span style={{ color: '#64748b' }}>رقم الجوال:</span>{' '}
                  <span dir="ltr">{order.customerProfile.phone}</span>
                </div>
              )}
              {order.contactPhone && order.contactPhone !== order.customerProfile?.phone && (
                <div>
                  <span style={{ color: '#64748b' }}>جوال التواصل:</span>{' '}
                  <span dir="ltr">{order.contactPhone}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
              العنوان والخدمة
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div>
                <span style={{ color: '#64748b' }}>المدينة:</span>{' '}
                <strong style={{ color: '#0f172a' }}>{order.city || 'الرياض'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>العنوان:</span>{' '}
                <span style={{ color: '#0f172a' }}>{order.address}</span>
              </div>
              {order.notes && (
                <div>
                  <span style={{ color: '#64748b' }}>ملاحظات العميل:</span>{' '}
                  <span style={{ color: '#0f172a', fontStyle: 'italic' }}>{order.notes}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* جدول عناصر الفاتورة */}
        <div style={{ marginBottom: '2.5rem' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'right',
            fontSize: '0.875rem',
          }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#0f172a' }}>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 800 }}>البند / الخدمة</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 800, textAlign: 'center' }}>الكمية</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 800, textAlign: 'left' }}>سعر الوحدة</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 800, textAlign: 'left' }}>التركيب</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 800, textAlign: 'left' }}>الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => {
                const quantity = item.quantity ?? 1
                const unitPrice = item.unitPrice ?? 0
                const totalPrice = item.totalPrice ?? (unitPrice * quantity)
                
                const baseTotal = unitPrice * quantity
                const installTotal = Math.max(0, totalPrice - baseTotal)
                const unitInstall = installTotal > 0 ? (installTotal / quantity) : 0

                const name = item.itemType === 'product' 
                  ? (item.product?.name ?? 'منتج صيانة')
                  : (item.service?.name ?? 'خدمة فنية')

                return (
                  <tr key={item.id || idx} style={{ borderBottom: '1px solid #f1f5f9', color: '#334155' }}>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>{name}</td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>{quantity}</td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'left' }}>{unitPrice.toFixed(2)} ر.س</td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'left', color: unitInstall > 0 ? '#0f172a' : '#94a3b8' }}>
                      {unitInstall > 0 ? `${unitInstall.toFixed(2)} ر.س` : '—'}
                    </td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'left', fontWeight: 700, color: '#0f172a' }}>
                      {totalPrice.toFixed(2)} ر.س
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* ملخص الحسابات وطريقة الدفع */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '2rem',
          borderTop: '2px solid #f1f5f9',
          paddingTop: '1.5rem',
        }}>
          {/* طريقة الدفع وملاحظات */}
          <div style={{ maxWidth: '350px' }}>
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', fontWeight: 800, color: '#0f172a' }}>
              طريقة الدفع والتفاصيل
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem', color: '#475569' }}>
              <div>
                <span style={{ fontWeight: 600 }}>الوسيلة المعتمدة:</span>{' '}
                <span style={{
                  padding: '0.15rem 0.5rem',
                  backgroundColor: '#f0fdf4',
                  color: '#166534',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                }}>
                  {paymentMethodLabels[invoice.paymentType] || invoice.paymentType}
                </span>
              </div>
              {order.paymentType === 'bank' && order.paymentMethodName && (
                <>
                  <div>
                    <span style={{ fontWeight: 600 }}>البنك المحول إليه:</span> {order.paymentMethodName}
                  </div>
                  {order.paymentMethodAccountNumber && (
                    <div>
                      <span style={{ fontWeight: 600 }}>رقم الحساب:</span>{' '}
                      <code style={{ fontSize: '0.85rem' }}>{order.paymentMethodAccountNumber}</code>
                    </div>
                  )}
                </>
              )}
              <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>
                💡 <strong>التوصيل مجاني:</strong> تشمل هذه الفاتورة الشحن والتوصيل المجاني لكافة البنود المذكورة أعلاه.
              </div>
            </div>
          </div>

          {/* المجموع والنهائي */}
          <div style={{ minWidth: '240px', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', color: '#475569' }}>
              <span>إجمالي المنتجات:</span>
              <span>{invoice.subtotal.toFixed(2)} ر.س</span>
            </div>
            {invoice.installationFee > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', color: '#475569' }}>
                <span>رسوم التركيب والتثبيت:</span>
                <span>{invoice.installationFee.toFixed(2)} ر.س</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', color: '#475569' }}>
              <span>الشحن والتوصيل:</span>
              <span style={{ color: '#166534', fontWeight: 700 }}>مجاني</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.75rem 0 0',
              marginTop: '0.5rem',
              borderTop: '1px solid #e2e8f0',
              fontSize: '1.1rem',
              fontWeight: 800,
              color: '#1576D4',
            }}>
              <span>المجموع الكلي:</span>
              <span>{invoice.totalAmount.toFixed(2)} ر.س</span>
            </div>
          </div>
        </div>

        {/* تذييل الفاتورة */}
        <div style={{
          marginTop: '4rem',
          borderTop: '1px dashed #cbd5e1',
          paddingTop: '1.5rem',
          textAlign: 'center',
        }}>
          <p style={{ margin: '0 0 0.25rem', fontSize: '0.875rem', fontWeight: 700, color: '#334155' }}>
            شكراً لتعاملكم مع منصة تمّ!
          </p>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
            يسعدنا خدمتكم دائماً. لأي استفسار يرجى التواصل مع الدعم الفني عبر التطبيق أو الموقع الإلكتروني.
          </p>
        </div>
      </div>

      {/* الستايلات الخاصة بالطباعة والشاشة */}
      <style>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #1f2937 !important;
          }
          .no-print {
            display: none !important;
          }
          .invoice-page-container {
            background-color: #ffffff !important;
            padding: 0 !important;
            min-height: auto !important;
          }
          .invoice-paper {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  )
}
