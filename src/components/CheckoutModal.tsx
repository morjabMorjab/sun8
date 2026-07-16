import React, { useState } from "react";
import { X, CreditCard, Landmark, Truck, CheckCircle, RefreshCw, BadgeAlert } from "lucide-react";
import { CartItem, User } from "../types";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  user: User | null;
  onOrderSuccess: () => void;
}

export default function CheckoutModal({ isOpen, onClose, cart, user, onOrderSuccess }: CheckoutModalProps) {
  const [shippingAddress, setShippingAddress] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [procurementContact, setProcurementContact] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderComplete, setOrderComplete] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);

  if (!isOpen) return null;

  const totalAmount = cart.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to place an order.");
      return;
    }
    if (user.role !== "buyer") {
      setError("Only registered Hospital / Clinic Buyers can checkout orders.");
      return;
    }
    if (!shippingAddress || !recipientName || !procurementContact) {
      setError("Please complete all delivery details.");
      return;
    }
    if (!cardNumber || !cardExpiry || !cardCvv) {
      setError("Please provide mock payment details for our integrated sandbox gateway.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const orderPayload = {
      shipping_address: `${recipientName}\nContact: ${procurementContact}\nAddress: ${shippingAddress}`,
      items: cart.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      })),
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("medmarket_token")}`,
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process checkout transaction.");
      }

      setCreatedOrderId(data.orderId);
      setOrderComplete(true);
    } catch (err: any) {
      setError(err.message || "An unexpected transaction error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    onOrderSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-sky-600" />
            <h2 className="font-display text-lg font-bold text-slate-900">Secure B2B Procurement Checkout</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {orderComplete ? (
            <div className="flex flex-col items-center justify-center text-center py-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-4 shadow-sm shadow-emerald-100">
                <CheckCircle className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Transaction Approved & Secured</h3>
              <p className="mt-2 text-sm text-slate-500 max-w-md">
                Order <strong className="text-slate-800">#MM-10{createdOrderId || "X"}</strong> has been logged to the ledger. Total paid: <strong className="text-slate-800">${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong>.
              </p>
              <p className="mt-1 text-xs text-slate-400 max-w-sm">
                A digitally signed invoice certificate has been sent to your dashboard. Distributors have been notified for shipment logistics.
              </p>
              <button
                onClick={handleFinish}
                className="mt-6 rounded-lg bg-sky-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-sky-500 transition-all"
              >
                Go to My Orders Panel
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Error Notice */}
              {error && (
                <div className="rounded-lg bg-rose-50 border border-rose-100 p-4 flex items-start gap-3">
                  <BadgeAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider">Transaction Warning</h4>
                    <p className="text-xs text-rose-600 mt-0.5 leading-relaxed">{error}</p>
                  </div>
                </div>
              )}

              {/* Order Summary Miniature */}
              <div className="rounded-lg bg-slate-50/70 border border-slate-200/60 p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Invoice Summary</h3>
                <div className="space-y-1.5 max-h-24 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex justify-between text-xs text-slate-600 font-medium">
                      <span className="truncate max-w-[320px]">{item.product.title} <strong className="text-slate-400">x{item.quantity}</strong></span>
                      <span className="font-mono text-slate-900">${(Number(item.product.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-200 mt-3 pt-2.5 flex justify-between items-baseline">
                  <span className="text-xs font-bold text-slate-700">Total B2B Amount (Inclusive of duties):</span>
                  <span className="text-base font-extrabold text-slate-950 font-mono">
                    ${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Section 1: Delivery Credentials */}
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3.5 flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-sky-100 text-[10px] font-bold text-sky-700">1</span>
                  <span>Hospital / Clinic Consignee Details</span>
                </h3>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Institution / Recipient Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. St. Jude Procurement Dept"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Procurement Officer Phone/Contact</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. (555) 019-2834"
                      value={procurementContact}
                      onChange={(e) => setProcurementContact(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-bold text-slate-600 mb-1">Complete Shipping Address</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="e.g. Wing B, Floor 4, Medical Logistics Hub, 1200 Clinic Way, Dallas TX 75201"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                  />
                </div>
              </div>

              {/* Section 2: Financial Wire / Credit Settlement */}
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3.5 flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-teal-100 text-[10px] font-bold text-teal-700">2</span>
                  <span>Institutional Credit / Payment Settlement Gateway</span>
                </h3>

                <div className="rounded-xl border border-teal-100 bg-teal-50/40 p-4 mb-4">
                  <div className="flex items-start gap-2.5 text-xs text-teal-800">
                    <Landmark className="h-4.5 w-4.5 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-semibold">Sandbox Payment Gateway Active</strong>
                      Our clinical network verifies transaction credits immediately. Please use any mock credit credentials for testing and review.
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Cardholder / Account Name</label>
                    <input
                      type="text"
                      required
                      placeholder="ST JUDE CLINICAL INC"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-1.5">
                      <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                        <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                        <span>Mock Corporate Card Number</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="4111 2222 3333 4444"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Expiration</label>
                      <input
                        type="text"
                        required
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">CVV / Code</label>
                      <input
                        type="password"
                        maxLength={4}
                        required
                        placeholder="***"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="border-t border-slate-100 pt-5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-sky-600 px-6 py-2 text-xs font-bold text-white shadow-sm shadow-sky-200 hover:bg-sky-500 transition-all disabled:bg-slate-400 disabled:shadow-none flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Validating Account...</span>
                    </>
                  ) : (
                    <span>Settle Payment (${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })})</span>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}
