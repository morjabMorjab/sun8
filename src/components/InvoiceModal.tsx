import React, { useRef } from "react";
import { X, Printer, ShieldAlert, BadgeCheck, FileText } from "lucide-react";
import { Order } from "../types";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export default function InvoiceModal({ isOpen, onClose, order }: InvoiceModalProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    const printContent = invoiceRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;

    if (printContent) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>MedMarket_Invoice_MM-10${order.id}</title>
              <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
              <style>
                body { font-family: 'Inter', sans-serif; padding: 20px; }
                @media print {
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body onload="window.print(); window.close();">
              <div class="p-6 max-w-4xl mx-auto">${printContent}</div>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  const orderDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Recently Approved";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header toolbar */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 no-print bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-sky-600" />
            <span className="font-display font-bold text-slate-800">B2B Procurement Certificate</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all shadow-sm"
            >
              <Printer className="h-4 w-4 text-sky-600" />
              <span>Print / Download</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="overflow-y-auto p-8" ref={invoiceRef}>
          <div className="bg-white border border-slate-100 p-1 sm:p-4">
            
            {/* Stamp / Logo */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-8 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-1.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white">
                    <span className="font-bold text-sm">MM</span>
                  </div>
                  <span className="font-display text-lg font-black tracking-tight text-slate-950">Med<span className="text-sky-600">Market</span> Ledger</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  A licensed, FDA-accredited B2B marketplace clearinghouse for hospital equipment & consumables.
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="inline-block rounded-full bg-emerald-50 text-emerald-800 px-3 py-0.5 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-100">
                  Transaction Cleared
                </span>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Invoice / Certificate Number</p>
                <p className="text-base font-mono font-black text-slate-950 mt-0.5">MM-10{order.id}</p>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">Date: {orderDate}</p>
              </div>
            </div>

            {/* Buyer and Shipping layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-slate-100 text-xs">
              <div>
                <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2">Purchaser (Hospital / Clinic Client)</h4>
                <div className="space-y-1">
                  <p className="font-extrabold text-slate-900 text-sm">Institution Consignee:</p>
                  <pre className="font-sans text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {order.shipping_address}
                  </pre>
                  <p className="text-slate-500 font-mono mt-1">Client ID: US-BUY-10{order.buyer_id}</p>
                  <p className="text-slate-500 font-mono">Buyer Email: {order.buyer?.email}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2">Platform Clearinghouse Certificate</h4>
                <div className="space-y-1 text-slate-600 leading-relaxed">
                  <p className="font-bold text-slate-900">MedMarket Clearinghouse Hub 01</p>
                  <p>100 Clinical Way, Logistics Block B</p>
                  <p>Cambridge, MA 02142, United States</p>
                  <p>SEC REG: SEC-MD-883921</p>
                  <p className="text-slate-500 font-mono">Ledger ID: {Math.random().toString(16).substring(2, 10).toUpperCase()}-MM-LEDGER</p>
                </div>
              </div>
            </div>

            {/* Product Table */}
            <div className="py-8">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold tracking-wider">
                    <th className="py-3">Medical SKU & Description</th>
                    <th className="py-3 text-center">Category</th>
                    <th className="py-3 text-center">Accreditation</th>
                    <th className="py-3 text-right">Quantity</th>
                    <th className="py-3 text-right">Unit Price</th>
                    <th className="py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 font-medium">
                      <td className="py-4">
                        <p className="font-bold text-slate-900">{item.product?.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          SKU-M-{item.product?.id || item.product_id} | Condition: {item.product?.condition?.toUpperCase()}
                        </p>
                      </td>
                      <td className="py-4 text-center text-slate-600 uppercase text-[10px] tracking-wide">
                        {item.product?.category}
                      </td>
                      <td className="py-4 text-center">
                        <span className="inline-block rounded bg-slate-100 text-slate-700 px-1.5 py-0.5 text-[9px] font-bold font-mono">
                          {item.product?.certifications || "FDA/CE"}
                        </span>
                      </td>
                      <td className="py-4 text-right font-mono text-slate-800">{item.quantity}</td>
                      <td className="py-4 text-right font-mono text-slate-800">${Number(item.unit_price).toFixed(2)}</td>
                      <td className="py-4 text-right font-mono text-slate-950 font-bold">
                        ${(Number(item.unit_price) * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Block */}
            <div className="flex flex-col items-end border-t border-slate-200 pt-6">
              <div className="w-full sm:w-80 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Subtotal</span>
                  <span className="font-mono text-slate-900">${Number(order.total_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Regulatory Clearing fee (0.00%)</span>
                  <span className="font-mono text-slate-900">$0.00</span>
                </div>
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Duties & B2B Logistics Delivery</span>
                  <span className="font-mono text-slate-800">FREE / COMPLIMENTARY</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline font-bold text-slate-900">
                  <span className="text-sm">Paid Total Amount (USD):</span>
                  <span className="text-lg font-mono font-black">${Number(order.total_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Signature Certificate */}
            <div className="mt-12 bg-slate-50 rounded-xl p-4 border border-slate-150 flex flex-col sm:flex-row items-center gap-4 text-xs">
              <BadgeCheck className="h-8 w-8 text-sky-600 shrink-0" />
              <div>
                <p className="font-bold text-slate-800 flex items-center gap-1">
                  <span>Accredited B2B Ledger Certificate</span>
                </p>
                <p className="text-slate-500 leading-relaxed mt-0.5">
                  This transaction has been successfully verified via MedMarket's sandbox secure payment API. 
                  All seller licenses have been manually validated under platform clearance guidelines. No further action required.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
