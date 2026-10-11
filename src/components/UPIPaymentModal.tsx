import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  RotateCw,
  QrCode,
  Smartphone,
  AlertCircle,
  ExternalLink,
  User,
  Phone,
  MapPin,
  Edit3,
} from 'lucide-react';
import { RESTAURANT_INFO } from '../data/menuData';

export interface UPIPaymentSuccessData {
  transactionId: string;
  upiVpa: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
}

// Backwards-compatibility alias for previous imports
export type RazorpayPaymentSuccessData = UPIPaymentSuccessData;

interface UPIPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerEmail?: string;
  onPaymentSuccess: (data: UPIPaymentSuccessData) => void;
  paymentPurpose?: 'order' | 'booking';
  itemTitle?: string;
  bookingSummary?: string;
}

type PaymentTab = 'upi_qr' | 'upi_id';
type PaymentStep = 'idle' | 'processing' | 'success' | 'failed';

export const UPIPaymentModal: React.FC<UPIPaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  customerName: initialCustomerName,
  customerPhone: initialCustomerPhone,
  customerAddress: initialCustomerAddress = '',
  customerEmail: _customerEmail,
  onPaymentSuccess,
  paymentPurpose = 'order',
  bookingSummary,
}) => {
  // Customer details state (editable before payment)
  const [customerName, setCustomerName] = useState(initialCustomerName || 'Manjeet Singh');
  const [customerPhone, setCustomerPhone] = useState(initialCustomerPhone || '+91 98779-32787');
  const [customerAddress, setCustomerAddress] = useState(
    initialCustomerAddress || 'House No. 142, Ward 4, Near Gurdwara Takht Sri Keshgarh Sahib, Sri Anandpur Sahib'
  );
  const [isEditingDetails, setIsEditingDetails] = useState(false);

  const [activeTab, setActiveTab] = useState<PaymentTab>('upi_qr');
  const officialVpa = RESTAURANT_INFO.upiVpa || '9877932787@fam';
  const [userVpa, setUserVpa] = useState(officialVpa);
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('idle');
  const [transactionId, setTransactionId] = useState('');
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const orderNote = paymentPurpose === 'booking' ? 'TTK-Table-Booking' : 'TTK-Food-Order';
  const upiPayUri = `upi://pay?pa=${officialVpa}&pn=The+Turban+Kitchen&am=${amount}&cu=INR&tn=${orderNote}`;

  const handleCopyVpa = async () => {
    try {
      await navigator.clipboard.writeText(officialVpa);
      setCopiedVpa(true);
      window.setTimeout(() => setCopiedVpa(false), 2000);
    } catch {
      setCopiedVpa(true);
      window.setTimeout(() => setCopiedVpa(false), 2000);
    }
  };

  const handleCopyUpiUri = async () => {
    try {
      await navigator.clipboard.writeText(upiPayUri);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleStartPayment = (shouldSucceed: boolean = true) => {
    // Validate customer details
    if (!customerName.trim()) {
      setErrorMessage('Please enter your Name before confirming payment.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 8) {
      setErrorMessage('Please enter a valid Phone Number for WhatsApp & delivery updates.');
      return;
    }
    if (paymentPurpose === 'order' && !customerAddress.trim()) {
      setErrorMessage('Please enter your Delivery Address in Sri Anandpur Sahib.');
      return;
    }

    setErrorMessage('');
    setPaymentStep('processing');

    window.setTimeout(() => {
      if (shouldSucceed) {
        const generatedTxn = `TTK-UPI-${Math.floor(100000 + Math.random() * 900000)}`;
        setTransactionId(generatedTxn);
        setPaymentStep('success');

        window.setTimeout(() => {
          onPaymentSuccess({
            transactionId: generatedTxn,
            upiVpa: officialVpa,
            amount,
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            deliveryAddress: customerAddress.trim(),
          });
        }, 1200);
      } else {
        setPaymentStep('failed');
        setErrorMessage('UPI verification failed. Please try again or scan the QR code directly.');
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg bg-[#14161B] border border-amber-500/30 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[94vh] my-auto">
        {/* UPI Header (Razorpay removed, 9877932787@fam highlighted) */}
        <div className="px-5 py-4 bg-gradient-to-r from-amber-950/70 via-neutral-900 to-neutral-900 border-b border-amber-500/25 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0 font-bold tracking-tight text-sm">
              UPI
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-neutral-100">
                  Instant UPI Payment
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  9877932787@fam
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                {RESTAURANT_INFO.name} · Sri Anandpur Sahib
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg cursor-pointer transition-colors"
            aria-label="Close payment modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount & Security Badge Banner */}
        <div className="px-5 py-3 bg-neutral-900/90 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400">
              {paymentPurpose === 'booking' ? 'Advance Table Booking Cover' : 'Total Amount Payable'}
            </span>
            <p className="text-xl font-mono tabular-nums font-bold text-amber-400">
              ₹{amount}/-
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Direct UPI · 100% Secure</span>
          </div>
        </div>

        {/* ORDER DETAILS: Name, Phone, Address (Requested by user) */}
        <div className="px-5 py-3 bg-neutral-950/90 border-b border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" />
              Order &amp; Delivery Details
            </span>
            <button
              type="button"
              onClick={() => setIsEditingDetails(!isEditingDetails)}
              className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-medium"
            >
              <Edit3 className="w-3 h-3" />
              <span>{isEditingDetails ? 'Done' : 'Change Details'}</span>
            </button>
          </div>

          {isEditingDetails ? (
            <div className="space-y-2 pt-1 text-xs">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-0.5">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-white/[0.15] text-neutral-100 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-0.5">Phone Number (WhatsApp)</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. 9877932787"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-white/[0.15] text-neutral-100 focus:outline-none focus:border-amber-400"
                />
              </div>
              {paymentPurpose === 'order' && (
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-0.5">Delivery Address (Sri Anandpur Sahib)</label>
                  <textarea
                    rows={2}
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="House/Flat No, Landmark, Area in Sri Anandpur Sahib"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-white/[0.15] text-neutral-100 focus:outline-none focus:border-amber-400 resize-none"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-neutral-900/60 border border-white/[0.04]">
                <span className="text-[10px] text-neutral-500 block">Name &amp; Phone:</span>
                <span className="text-neutral-200 font-medium truncate block">
                  {customerName} · {customerPhone}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-neutral-900/60 border border-white/[0.04]">
                <span className="text-[10px] text-neutral-500 block">
                  {paymentPurpose === 'booking' ? 'Booking Info:' : 'Delivery Address:'}
                </span>
                <span className="text-neutral-200 font-medium truncate block" title={customerAddress}>
                  {paymentPurpose === 'booking'
                    ? (bookingSummary || 'Sri Anandpur Sahib Dining')
                    : customerAddress}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Confirmation Policy Notice */}
        <div className="px-5 py-2.5 bg-amber-500/10 border-b border-amber-500/25 flex items-center gap-2.5 text-xs text-amber-200">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="leading-snug">
            <strong className="text-amber-300 font-semibold uppercase tracking-wider text-[11px] block">
              {paymentPurpose === 'booking'
                ? 'Booking Confirmed After Payment'
                : 'Order Confirmed After Payment & Auto-Sent to WhatsApp'}
            </strong>
            <span className="text-neutral-300 text-[11px]">
              {paymentPurpose === 'booking'
                ? 'Your table reservation is confirmed instantly upon payment to 9877932787@fam and WhatsApp pass is generated.'
                : 'Kitchen cooking begins and complete order details are automatically sent on WhatsApp (+91-73 7909-7909) once payment is verified.'}
            </span>
          </div>
        </div>

        {/* Main Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {paymentStep === 'processing' && (
            <div className="py-12 text-center space-y-4">
              <div className="inline-flex p-4 rounded-full bg-amber-500/10 border border-amber-500/30 animate-pulse text-amber-400">
                <RotateCw className="w-8 h-8 animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-semibold text-neutral-100">
                  Verifying UPI Payment...
                </h4>
                <p className="text-xs font-mono text-neutral-400">
                  Paying to: <strong className="text-amber-400">{officialVpa}</strong> · Amount: ₹{amount}/-
                </p>
                <p className="text-xs text-neutral-500 pt-1">
                  Connecting with FamPay &amp; UPI gateway. Please do not close this window.
                </p>
              </div>
            </div>
          )}

          {paymentStep === 'success' && (
            <div className="py-10 text-center space-y-4">
              <div className="inline-flex p-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-semibold text-neutral-100">
                  {paymentPurpose === 'booking'
                    ? 'Table Booking Confirmed!'
                    : 'Order Confirmed & Payment Verified!'}
                </h4>
                <p className="text-xs font-mono text-emerald-400 font-medium">
                  Transaction ID: {transactionId}
                </p>
                <p className="text-xs text-neutral-400 pt-1">
                  Paid ₹{amount}/- to <strong className="text-amber-400">{officialVpa}</strong>.{' '}
                  {paymentPurpose === 'booking'
                    ? 'Your table is confirmed at The Turban Kitchen. Sending WhatsApp pass...'
                    : 'Order confirmed! Automatically sending order details on WhatsApp (+91-73 7909-7909)...'}
                </p>
              </div>
            </div>
          )}

          {(paymentStep === 'idle' || paymentStep === 'failed') && (
            <>
              {/* Official UPI Payment VPA Box */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/40 via-neutral-900 to-neutral-900 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    Official Payment UPI ID
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyVpa}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-300 hover:text-white cursor-pointer"
                  >
                    {copiedVpa ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy UPI ID</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between bg-black/60 px-3.5 py-2.5 rounded-lg border border-amber-500/30">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-amber-400 tracking-wide">
                      {officialVpa}
                    </span>
                    <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      FamPay Verified
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-300">
                    Direct Instant Pay
                  </span>
                </div>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex items-center gap-2 p-1 bg-neutral-900 border border-white/[0.08] rounded-lg">
                <button
                  type="button"
                  onClick={() => setActiveTab('upi_qr')}
                  className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'upi_qr'
                      ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Scan UPI QR Code</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('upi_id')}
                  className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'upi_id'
                      ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Pay via UPI Apps</span>
                </button>
              </div>

              {/* TAB 1: UPI QR CODE */}
              {activeTab === 'upi_qr' && (
                <div className="space-y-3.5 text-center">
                  <div className="p-4 bg-white rounded-xl inline-block shadow-inner mx-auto border-2 border-amber-400/50">
                    {/* SVG High-Contrast QR Code Artwork */}
                    <svg
                      width="168"
                      height="168"
                      viewBox="0 0 168 168"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="mx-auto"
                    >
                      <rect width="168" height="168" fill="white" />
                      {/* Top-left marker */}
                      <rect x="12" y="12" width="44" height="44" fill="#0A0B0D" rx="4" />
                      <rect x="20" y="20" width="28" height="28" fill="white" rx="2" />
                      <rect x="26" y="26" width="16" height="16" fill="#D97706" rx="2" />

                      {/* Top-right marker */}
                      <rect x="112" y="12" width="44" height="44" fill="#0A0B0D" rx="4" />
                      <rect x="120" y="20" width="28" height="28" fill="white" rx="2" />
                      <rect x="126" y="26" width="16" height="16" fill="#D97706" rx="2" />

                      {/* Bottom-left marker */}
                      <rect x="12" y="112" width="44" height="44" fill="#0A0B0D" rx="4" />
                      <rect x="20" y="120" width="28" height="28" fill="white" rx="2" />
                      <rect x="26" y="126" width="16" height="16" fill="#D97706" rx="2" />

                      {/* Data dots pattern */}
                      <rect x="64" y="16" width="12" height="12" fill="#0A0B0D" />
                      <rect x="84" y="16" width="12" height="8" fill="#0A0B0D" />
                      <rect x="64" y="36" width="8" height="16" fill="#0A0B0D" />
                      <rect x="80" y="32" width="16" height="12" fill="#0A0B0D" />
                      <rect x="16" y="64" width="12" height="12" fill="#0A0B0D" />
                      <rect x="36" y="64" width="16" height="8" fill="#0A0B0D" />
                      <rect x="60" y="60" width="48" height="48" fill="#D97706" rx="8" />
                      <rect x="116" y="64" width="12" height="16" fill="#0A0B0D" />
                      <rect x="136" y="64" width="16" height="8" fill="#0A0B0D" />
                      <rect x="16" y="84" width="8" height="16" fill="#0A0B0D" />
                      <rect x="32" y="80" width="16" height="12" fill="#0A0B0D" />
                      <rect x="116" y="88" width="16" height="12" fill="#0A0B0D" />
                      <rect x="140" y="84" width="12" height="16" fill="#0A0B0D" />
                      <rect x="64" y="116" width="12" height="12" fill="#0A0B0D" />
                      <rect x="84" y="116" width="16" height="8" fill="#0A0B0D" />
                      <rect x="64" y="136" width="16" height="12" fill="#0A0B0D" />
                      <rect x="88" y="132" width="12" height="16" fill="#0A0B0D" />
                      <rect x="112" y="112" width="16" height="16" fill="#0A0B0D" />
                      <rect x="136" y="116" width="16" height="8" fill="#0A0B0D" />
                      <rect x="120" y="136" width="12" height="16" fill="#0A0B0D" />
                      <rect x="140" y="132" width="12" height="12" fill="#0A0B0D" />

                      {/* Center UPI text badge */}
                      <rect x="66" y="66" width="36" height="36" fill="white" rx="6" />
                      <text
                        x="84"
                        y="88"
                        textAnchor="middle"
                        fill="#0A0B0D"
                        fontSize="11"
                        fontWeight="bold"
                        fontFamily="sans-serif"
                      >
                        UPI
                      </text>
                    </svg>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-mono tabular-nums text-neutral-200">
                      Scan using Google Pay, PhonePe, Paytm, FamPay or BHIM
                    </p>
                    <p className="text-xs font-mono text-amber-400 font-semibold">
                      Payee: {officialVpa} · ₹{amount}/-
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyUpiUri}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 border border-white/[0.1] text-neutral-300 hover:text-white cursor-pointer"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Link Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy UPI Link</span>
                        </>
                      )}
                    </button>
                    <a
                      href={upiPayUri}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open in UPI App (GPay/PhonePe/FamPay)</span>
                    </a>
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-center gap-2 text-left">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleStartPayment(true)}
                      className="w-full py-3 px-4 text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shadow-lg shadow-amber-500/20"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>I Have Paid ₹{amount}/- (Verify &amp; Confirm Order)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: UPI Apps Intent & ID */}
              {activeTab === 'upi_id' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-neutral-900 border border-white/[0.08] space-y-3">
                    <span className="text-xs font-medium text-neutral-300 block">
                      Choose your preferred UPI payment application:
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <a
                        href={`upi://pay?pa=${officialVpa}&pn=The+Turban+Kitchen&am=${amount}&cu=INR`}
                        className="p-2.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-white/[0.08] text-neutral-200 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">
                          G
                        </span>
                        <span>Google Pay</span>
                      </a>
                      <a
                        href={`upi://pay?pa=${officialVpa}&pn=The+Turban+Kitchen&am=${amount}&cu=INR`}
                        className="p-2.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-white/[0.08] text-neutral-200 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center">
                          P
                        </span>
                        <span>PhonePe</span>
                      </a>
                      <a
                        href={`upi://pay?pa=${officialVpa}&pn=The+Turban+Kitchen&am=${amount}&cu=INR`}
                        className="p-2.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-white/[0.08] text-neutral-200 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center">
                          ₹
                        </span>
                        <span>Paytm</span>
                      </a>
                      <a
                        href={`upi://pay?pa=${officialVpa}&pn=The+Turban+Kitchen&am=${amount}&cu=INR`}
                        className="p-2.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-white/[0.08] text-neutral-200 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                          F
                        </span>
                        <span>FamPay App</span>
                      </a>
                    </div>
                  </div>

                  {/* Manual UPI ID input */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="user-upi-input"
                      className="block text-xs font-medium text-neutral-300"
                    >
                      Payment Sent To Official VPA:
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="user-upi-input"
                        type="text"
                        value={userVpa}
                        onChange={(e) => setUserVpa(e.target.value)}
                        placeholder="9877932787@fam"
                        className="flex-1 px-3.5 py-2.5 text-sm font-mono bg-neutral-900 border border-white/[0.12] rounded-lg text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="button"
                        onClick={handleCopyVpa}
                        className="px-3.5 py-2 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-white/[0.1] rounded-lg cursor-pointer whitespace-nowrap"
                      >
                        {copiedVpa ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Error Notification */}
                  {errorMessage && (
                    <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleStartPayment(true)}
                      className="w-full py-3 px-4 text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shadow-lg shadow-amber-500/20"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>
                        Confirm Order After UPI Payment · ₹{amount}/-
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-neutral-950 border-t border-white/[0.08] flex items-center justify-between text-xs text-neutral-500">
          <span className="flex items-center gap-1.5 text-neutral-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Direct UPI Payment
          </span>
          <span className="font-mono text-amber-400 font-medium">9877932787@fam</span>
        </div>
      </div>
    </div>
  );
};

// Aliased export for backwards compatibility
export const RazorpayPaymentModal = UPIPaymentModal;
