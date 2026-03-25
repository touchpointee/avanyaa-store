import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Settings from '@/models/Settings';
import { notFound, redirect } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import PrintButton from '@/components/PrintButton';

export const metadata = {
  title: 'Invoice',
};

export default async function InvoicePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  await connectDB();
  const [order, settingsDoc] = await Promise.all([
    Order.findById(params.id).lean() as any,
    Settings.findOne({ key: 'global' }).lean() as any
  ]);

  if (!order) {
    notFound();
  }

  const u = session.user as any;
  const userId = u.id;
  const role = u.role;
  const userEmail = u.email;

  // Authorization: Only the order owner or an admin can access this invoice
  const isOwner = order.userId?.toString() === userId || 
                 (order.address?.email && userEmail && order.address.email.toLowerCase() === userEmail.toLowerCase());

  if (role !== 'admin' && !isOwner) {
    redirect('/');
  }

  // Create Date
  const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const storeName = settingsDoc?.invoiceStoreName || 'Avanyaa';
  const subText = settingsDoc?.invoiceSubText || 'Premium Fashion Avenue';
  const email = settingsDoc?.invoiceEmail || 'support@avanyaa.com';
  const phone = settingsDoc?.invoicePhone || '';
  const address = settingsDoc?.invoiceAddress || '';
  const taxId = settingsDoc?.invoiceTaxId || '';
  const footerNote = settingsDoc?.invoiceFooterNote || 'Thank you for shopping with us!';

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-10 print:py-0 print:bg-white text-gray-900">
      
      <PrintButton />

      {/* A4 Paper Document Setup */}
      <div className="w-full max-w-4xl bg-white shadow-lg print:shadow-none p-4 sm:p-8 md:p-14 mb-10 mx-0 sm:mx-4 border print:border-none print:m-0 print:p-0 overflow-hidden">
        
        {/* Header Region */}
        <div className="flex flex-col sm:flex-row print:flex-row justify-between items-start gap-4 sm:gap-0 border-b pb-6 sm:pb-8 mb-6 sm:mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 font-heading">INVOICE</h1>
            <p className="mt-2 text-sm text-gray-500 font-medium">Order ID: {order.orderId}</p>
            <p className="text-sm text-gray-500 font-medium">Date: {date}</p>
          </div>
          <div className="text-left sm:text-right print:text-right flex flex-col items-start sm:items-end print:items-end w-full sm:w-auto border-t sm:border-0 pt-4 sm:pt-0">
            <h2 className="text-2xl font-bold text-primary font-heading tracking-tight">{storeName}</h2>
            {subText && <p className="mt-1 text-sm text-gray-500 font-medium">{subText}</p>}
            
            {address && (
              <p className="mt-3 text-sm text-gray-600 whitespace-pre-line text-left sm:text-right print:text-right max-w-xs leading-relaxed">
                {address}
              </p>
            )}
            
            {(email || phone) && (
              <div className="mt-3 text-sm text-gray-500">
                {email && <span>{email}</span>}
                {email && phone && <span className="mx-2">•</span>}
                {phone && <span>{phone}</span>}
              </div>
            )}
            
            {taxId && <p className="mt-1 text-xs font-mono font-bold text-gray-400">{taxId}</p>}
          </div>
        </div>

        {/* Addresses Region */}
        <div className="flex flex-col sm:flex-row print:flex-row gap-6 sm:gap-20 print:gap-20 mb-8 sm:mb-10">
          <div className="flex-1">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Billed To</h3>
            <p className="font-semibold text-gray-900">{order.address.fullName}</p>
            <p className="text-sm text-gray-600 mt-1">{order.address.email}</p>
            <p className="text-sm text-gray-600">{order.address.phone}</p>
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Shipped To</h3>
            <p className="font-semibold text-gray-900">{order.address.fullName}</p>
            <p className="text-sm text-gray-600 mt-1">{order.address.street}</p>
            <p className="text-sm text-gray-600">{order.address.city}, {order.address.state} - {order.address.zipCode}</p>
          </div>
        </div>

        {/* Payment Meta */}
        <div className="mb-8 sm:mb-10 p-4 sm:p-5 bg-gray-50 rounded-xl border">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 print:grid-cols-4 gap-4 sm:gap-6">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Payment Method</p>
              <p className="font-semibold text-gray-900 mt-1 capitalize">{order.paymentMethod}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</p>
              <p className="font-semibold text-gray-900 mt-1">
                {order.isPaid ? 'Paid in Full' : 'Pending'}
              </p>
            </div>
            {order.razorpayPaymentId && (
              <div className="md:col-span-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Transaction ID</p>
                <p className="font-mono text-sm text-gray-700 mt-1">{order.razorpayPaymentId}</p>
              </div>
            )}
          </div>
        </div>

        {/* Itemized Table */}
        <div className="overflow-x-auto print:overflow-visible mb-8 sm:mb-10">
          <table className="w-full text-left min-w-[500px] print:min-w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Item Description</th>
              <th className="py-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Size / Color</th>
              <th className="py-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Price</th>
              <th className="py-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Qty</th>
              <th className="py-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {order.items.map((item: any, i: number) => (
              <tr key={i}>
                <td className="py-4 pr-4">
                  <p className="font-semibold text-gray-900">{item.productName}</p>
                </td>
                <td className="py-4 px-2 text-center text-sm text-gray-600">
                  {item.size || '-'} / {item.color || '-'}
                </td>
                <td className="py-4 px-2 text-right text-sm text-gray-600 font-mono">
                  {formatPrice(item.price)}
                </td>
                <td className="py-4 px-2 text-center text-sm font-semibold text-gray-900">
                  {item.quantity}
                </td>
                <td className="py-4 pl-4 text-right font-bold text-gray-900 font-mono">
                  {formatPrice(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {/* Totals Setup */}
        <div className="flex justify-end">
          <div className="w-full sm:w-1/2 md:w-1/3">
            <div className="space-y-3 pb-4 border-b">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium font-mono text-gray-900">{formatPrice(order.totalAmount - (order.shippingFee || 0))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="font-medium font-mono text-gray-900">
                  {order.shippingFee ? formatPrice(order.shippingFee) : 'Free'}
                </span>
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <span className="text-lg font-bold text-gray-900">Gross Total</span>
              <span className="text-xl font-extrabold text-primary font-mono">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 pt-8 border-t text-center space-y-2">
          <p className="text-sm font-medium text-gray-800">{footerNote}</p>
          <p className="text-xs text-gray-400">If you have any questions concerning this invoice, contact our support team at {email} {phone ? `or ${phone}` : ''}.</p>
        </div>

      </div>
    </div>
  );
}
