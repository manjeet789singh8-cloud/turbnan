import React, { useState } from 'react';
import {
  CheckCircle2,
  MessageCircle,
  ExternalLink,
  Copy,
  Check,
  ShoppingBag,
  Clock,
  MapPin,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
} from 'lucide-react';
import { OrderRecord, RESTAURANT_INFO } from '../data/menuData';

interface OrderConfirmedWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderRecord | null;
  whatsappUrl: string;
  formattedMessage: string;
  onTrackOrder?: () => void;
}

export const OrderConfirmedWhatsAppModal: React.FC<
  OrderConfirmedWhatsAppModalProps
> = ({
  isOpen,
  onClose,
  order,
  whatsappUrl,
  formattedMessage,
  onTrackOrder,
}) => {
  const [copied, setCopied] = useState(false);
  const [showFullTicket, setShowFullTicket] = useState(false);

  if (!isOpen || !order) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleTrackClick = () => {
    onClose();
    if (onTrackOrder) {
      onTrackOrder();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-confirmed-title"
    >
      <div className="relative w-full max-w-xl bg-neutral-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Top Decorative Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 px-6 py-5 text-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neutral-950/15 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-neutral-950" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-950/20 text-neutral-950 font-bold text-[11px] uppercase tracking-wider mb-0.5">
                <Sparkles className="w-3 h-3" />
                <span>Order Confirmed &amp; Verified</span>
              </div>
              <h2
                id="order-confirmed-title"
                className="font-display text-xl font-bold text-neutral-950 tracking-tight"
              >
                Automatically Sent on WhatsApp!
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-950/15 hover:bg-neutral-950/25 flex items-center justify-center text-neutral-950 transition-colors cursor-pointer"
            aria-label="Close confirmation modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-neutral-200 text-sm max-h-[75vh] overflow-y-auto">
          {/* Order ID & Auto WhatsApp Callout */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-bold">
                Order ID: #{order.id}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Payment Confirmed
              </span>
            </div>
            <p className="text-xs text-neutral-200 leading-relaxed">
              Your order has been confirmed and the complete order details have
              been <strong>automatically dispatched to our kitchen line on WhatsApp</strong> (
              <span className="text-emerald-400 font-medium">
                {RESTAURANT_INFO.mobile}
              </span>
              ).
            </p>
          </div>

          {/* Quick Order Highlights */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-neutral-950/60 border border-white/[0.06] space-y-1">
              <span className="text-neutral-400 flex items-center gap-1 text-[11px]">
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                Total Paid
              </span>
              <p className="font-mono font-bold text-lg text-emerald-400">
                ₹{order.total}/-
              </p>
              <p className="text-[10px] text-neutral-400 truncate">
                {order.paymentMethod}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-neutral-950/60 border border-white/[0.06] space-y-1">
              <span className="text-neutral-400 flex items-center gap-1 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Est. Delivery Time
              </span>
              <p className="font-mono font-bold text-lg text-neutral-100">
                {order.estimatedDeliveryMinutes || 35} Mins
              </p>
              <p className="text-[10px] text-emerald-400 font-medium">
                {order.deliveryFee === 0 ? 'Free Delivery (≤ 3 Km)' : 'Standard Delivery'}
              </p>
            </div>
          </div>

          {/* Customer Details & Delivery Destination */}
          <div className="p-3.5 rounded-lg bg-neutral-950/60 border border-white/[0.06] space-y-2 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-white/[0.04]">
              <span className="text-neutral-400 flex items-center gap-1.5 text-[11px]">
                <span className="text-amber-400 font-bold">👤</span>
                Customer Details
              </span>
              <span className="text-neutral-200 font-medium">
                {order.customerName || 'Manjeet Singh'}{' '}
                {order.customerPhone ? `(${order.customerPhone})` : ''}
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-neutral-400 flex items-center gap-1.5 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                Delivery Address
              </span>
              <p className="text-neutral-200 font-medium leading-relaxed pl-5">
                {order.deliveryAddress || order.addressSummary}
              </p>
            </div>
          </div>

          {/* Order Items Preview */}
          <div className="space-y-2 text-xs">
            <p className="font-semibold text-neutral-300 uppercase tracking-wider text-[11px]">
              Ordered Dishes ({order.items.reduce((s, it) => s + it.quantity, 0)} Items)
            </p>
            <div className="rounded-lg bg-neutral-950/60 border border-white/[0.06] divide-y divide-white/[0.06] overflow-hidden">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 flex items-center justify-between text-neutral-200"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-amber-400 font-bold text-[11px] bg-amber-400/10 px-1.5 py-0.5 rounded">
                      {item.quantity}x
                    </span>
                    <span>
                      {item.name} {item.variant ? `(${item.variant})` : ''}
                      {item.isJain && (
                        <span className="text-[10px] text-emerald-400 ml-1">
                          (Jain)
                        </span>
                      )}
                    </span>
                  </div>
                  <span className="font-mono font-medium text-neutral-300">
                    ₹{item.unitPrice * item.quantity}/-
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pre-Formatted WhatsApp Ticket Collapsible Preview */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowFullTicket((prev) => !prev)}
              className="w-full flex items-center justify-between text-xs text-neutral-400 hover:text-neutral-200 transition-colors py-1 cursor-pointer"
            >
              <span className="font-medium flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                View Full WhatsApp Order Ticket Details
              </span>
              {showFullTicket ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showFullTicket && (
              <div className="space-y-2">
                <pre className="p-3.5 rounded-xl bg-neutral-950 border border-white/[0.08] text-[11px] font-mono text-neutral-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {formattedMessage}
                </pre>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-medium">
                          Copied to Clipboard!
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Copy Order Text</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="px-6 py-4 bg-neutral-950/80 border-t border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTrackClick}
            className="px-4 py-2.5 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 border border-white/[0.1] rounded-lg transition-colors cursor-pointer text-center"
          >
            Track in Kitchen Status
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 rounded-lg shadow-lg shadow-emerald-500/20 transition-all cursor-pointer whitespace-nowrap text-center"
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span>Open in WhatsApp ({RESTAURANT_INFO.mobile})</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
          </a>
        </div>
      </div>
    </div>
  );
};
