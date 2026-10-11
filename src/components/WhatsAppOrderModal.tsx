import React, { useState, useMemo } from 'react';
import { MessageCircle, Copy, Check, X, MapPin, Phone, Send } from 'lucide-react';
import {
  MenuItem,
  UserProfileSettings,
  DeliveryAddress,
  RESTAURANT_INFO,
} from '../data/menuData';

export interface WhatsAppCartEntry {
  cartKey: string;
  item: MenuItem;
  variant: 'Half' | 'Full';
  unitPrice: number;
  quantity: number;
  spiceLevel: 'Mild' | 'Medium' | 'Punjabi Spicy';
  isJain: boolean;
}

interface WhatsAppOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: WhatsAppCartEntry[];
  profile: UserProfileSettings;
  activeAddress?: DeliveryAddress;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  onConfirmWhatsAppOrder: (customNote: string) => void;
}

export const WhatsAppOrderModal: React.FC<WhatsAppOrderModalProps> = ({
  isOpen,
  onClose,
  cart,
  profile,
  activeAddress,
  customerName: propCustomerName,
  customerPhone: propCustomerPhone,
  customerAddress: propCustomerAddress,
  subtotal,
  deliveryFee,
  total,
  onConfirmWhatsAppOrder,
}) => {
  const [customNote, setCustomNote] = useState('');
  const [copied, setCopied] = useState(false);

  const customerName = propCustomerName || profile.fullName;
  const customerPhone = propCustomerPhone || profile.phone;
  const deliveryAddress =
    propCustomerAddress ||
    (activeAddress
      ? `${activeAddress.label} — ${activeAddress.streetLine}`
      : RESTAURANT_INFO.address);

  const formattedMessage = useMemo(() => {
    const lines: string[] = [
      `*NEW ORDER — THE TURBAN KITCHEN*`,
      `_${RESTAURANT_INFO.address}_`,
      `--------------------------------`,
      `*Customer:* ${customerName}`,
      `*Phone:* ${customerPhone}`,
      profile.alternatePhone ? `*Alt Phone:* ${profile.alternatePhone}` : '',
      `--------------------------------`,
      `*ORDER ITEMS:*`,
      ...cart.map(
        (entry, idx) =>
          `${idx + 1}. *${entry.item.name}*${
            entry.item.halfPrice ? ` (${entry.variant})` : ''
          } x ${entry.quantity} — Rs.${entry.unitPrice * entry.quantity}/-\n   _Prep: ${
            entry.spiceLevel
          }${entry.isJain ? ', Jain (No Onion/Garlic)' : ''}_`
      ),
      `--------------------------------`,
      `*KITCHEN PREFERENCES:*`,
      `• Dietary: ${
        profile.preferences.jainPreparationDefault
          ? 'Jain (No Onion/Garlic)'
          : '100% Pure Vegetarian'
      }`,
      profile.preferences.lowOilButterDefault
        ? '• Light Tadka: Low Oil / Less Butter'
        : '',
      profile.preferences.avoidNutsCashewGravy
        ? '• ALLERGEN ALERT: Avoid Cashew / Tree-Nut Gravy'
        : '',
      `• Cutlery & Napkins: ${
        profile.preferences.includeCutleryAndNapkins ? 'Yes, please include' : 'Not needed'
      }`,
      customNote.trim() ? `• *Special Note:* ${customNote.trim()}` : '',
      `--------------------------------`,
      `*DELIVERY ADDRESS:*`,
      deliveryAddress,
      activeAddress?.landmark ? `Landmark: ${activeAddress.landmark}` : '',
      activeAddress?.distanceKm !== undefined
        ? `Distance: ${activeAddress.distanceKm} Km from Bus Stand`
        : '',
      `--------------------------------`,
      `*BILL SUMMARY:*`,
      `Subtotal: Rs.${subtotal}/-`,
      `Delivery Fee: ${
        deliveryFee === 0 ? 'FREE (Within 3 Km Free Delivery)' : `Rs.${deliveryFee}/-`
      }`,
      `*TOTAL PAYABLE: Rs.${total}/-*`,
      `*Payment Mode:* ${profile.preferences.defaultPaymentMethod}`,
      `*UPI VPA for Payment:* ${RESTAURANT_INFO.upiVpa || '9877932787@fam'} (Google Pay / PhonePe / Paytm / FamPay)`,
      `*NOTE:* Order will be confirmed after payment verification (UPI: ${RESTAURANT_INFO.upiVpa || '9877932787@fam'}).`,
    ].filter(Boolean);

    return lines.join('\n');
  }, [
    cart,
    customerName,
    customerPhone,
    deliveryAddress,
    profile,
    activeAddress,
    subtotal,
    deliveryFee,
    total,
    customNote,
  ]);

  if (!isOpen) return null;

  const whatsappHref = `https://wa.me/${
    RESTAURANT_INFO.whatsappNumberClean
  }?text=${encodeURIComponent(formattedMessage)}`;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(formattedMessage);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-[#18191D] border border-white/[0.12] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-emerald-950/50 border-b border-emerald-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold text-neutral-100">
                Direct WhatsApp Order — {RESTAURANT_INFO.name}
              </h3>
              <p className="text-xs font-mono tabular-nums text-emerald-300">
                Kitchen WhatsApp Line: {RESTAURANT_INFO.mobile} · {RESTAURANT_INFO.hours}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg cursor-pointer"
            aria-label="Close WhatsApp modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Recipient & Delivery Quick Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-neutral-900 border border-white/[0.08] text-xs">
            <div className="space-y-1">
              <p className="text-neutral-400 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Customer & Payment</span>
              </p>
              <p className="font-semibold text-neutral-100">
                {customerName} ({customerPhone})
              </p>
              <p className="text-amber-400">
                {profile.preferences.defaultPaymentMethod} · Total: ₹{total}/-
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-neutral-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sri Anandpur Sahib Delivery</span>
              </p>
              <p className="font-semibold text-neutral-100 truncate">
                {deliveryAddress}
              </p>
              <p className="text-neutral-300 truncate">
                {activeAddress?.landmark ? `Landmark: ${activeAddress.landmark} · ` : ''}
                {activeAddress?.distanceKm !== undefined ? `${activeAddress.distanceKm} Km` : ''}
              </p>
            </div>
          </div>

          {/* Custom Kitchen / Rider Note Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="whatsapp-custom-note"
              className="block text-xs font-medium text-neutral-300"
            >
              Optional Kitchen or Delivery Note (Added to WhatsApp Message)
            </label>
            <input
              id="whatsapp-custom-note"
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Make Dal Makhni extra creamy, send green chilies & vinegar onions..."
              className="w-full px-3.5 py-2 text-sm bg-neutral-900 border border-white/[0.1] rounded-lg text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-emerald-400"
            />
          </div>

          {/* Formatted WhatsApp Ticket Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-400">
                Pre-Formatted WhatsApp Order Ticket Preview
              </span>
              <button
                type="button"
                onClick={handleCopyText}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied to Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Copy Order Text</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-neutral-950 border border-white/[0.08] text-xs font-mono text-neutral-200 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
              {formattedMessage}
            </pre>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-neutral-900/90 border-t border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onConfirmWhatsAppOrder(customNote)}
            className="px-4 py-2.5 text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 border border-white/[0.1] rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Confirm Order &amp; Auto-Send</span>
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onConfirmWhatsAppOrder(customNote)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold bg-emerald-500 text-neutral-950 hover:bg-emerald-400 rounded-lg transition-colors whitespace-nowrap shadow-md shadow-emerald-500/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                Confirm &amp; Open WhatsApp ({RESTAURANT_INFO.mobile}) · ₹{total}/-
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
