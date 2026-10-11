import React, { useState, useEffect } from 'react';
import {
  Clock,
  Timer,
  CheckCircle2,
  Flame,
  Bike,
  Phone,
  MessageCircle,
  MapPin,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertCircle,
  Truck,
  RotateCw,
} from 'lucide-react';
import { OrderRecord, RESTAURANT_INFO } from '../data/menuData';

interface OrderStatusCardProps {
  order: OrderRecord;
  onUpdateStatus?: (orderId: string, newStatus: OrderRecord['status']) => void;
  buildRepeatWhatsAppHref: (order: OrderRecord) => string;
}

export const OrderStatusCard: React.FC<OrderStatusCardProps> = ({
  order,
  onUpdateStatus,
  buildRepeatWhatsAppHref,
}) => {
  const [now, setNow] = useState<number>(Date.now());
  const [isItemsExpanded, setIsItemsExpanded] = useState<boolean>(true);

  // Live real-time tick every 1000ms for active countdown and elapsed time
  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Determine creation timestamp
  const orderCreatedMs = order.createdAtMs || Date.now() - 3 * 60 * 1000;
  const estimatedTotalMinutes = order.estimatedDeliveryMinutes || 35;
  const totalTargetMs = estimatedTotalMinutes * 60 * 1000;

  const isDelivered = order.status === 'Delivered';
  const elapsedMs = Math.max(0, now - orderCreatedMs);
  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);

  const remainingMs = Math.max(0, totalTargetMs - elapsedMs);
  const remainingSeconds = Math.floor(remainingMs / 1000);
  const remainingMinutes = Math.floor(remainingSeconds / 60);
  const remainingSecsRemainder = remainingSeconds % 60;

  // Progress percentage (0 to 100%)
  const rawProgress = isDelivered
    ? 100
    : Math.min(96, Math.max(6, Math.round((elapsedMs / totalTargetMs) * 100)));

  // Format Elapsed Time string
  const formatTimeElapsed = () => {
    if (elapsedSeconds < 60) {
      return `${elapsedSeconds}s ago`;
    }
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    if (mins < 60) {
      return `${mins}m ${secs < 10 ? '0' : ''}${secs}s ago`;
    }
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}h ${remMins}m ago`;
  };

  // Determine active visual stage
  // Stages: 1 = Confirmed, 2 = Kitchen Prep, 3 = Out for Delivery, 4 = Delivered
  let activeStageIndex = 1;
  if (isDelivered) {
    activeStageIndex = 4;
  } else if (order.status === 'Out for Delivery') {
    activeStageIndex = 3;
  } else if (
    order.status === 'Preparing in Kitchen' ||
    order.status === 'Payment Verified (UPI)' ||
    order.status === 'Payment Verified (Razorpay)' ||
    order.status === 'Sent via WhatsApp' ||
    order.status === 'Confirmed After Payment'
  ) {
    // If more than 20 minutes elapsed, suggest out for delivery
    activeStageIndex = elapsedMinutes >= 20 ? 3 : 2;
  }

  // Stages definition
  const stages = [
    {
      step: 1,
      title: 'Order Confirmed',
      desc: 'Accepted by Anandpur Sahib kitchen',
      icon: CheckCircle2,
      timeTag: '0-5 min',
    },
    {
      step: 2,
      title: 'Cooking in Kitchen',
      desc: 'Clay oven tandoor & kadai preparation',
      icon: Flame,
      timeTag: '5-20 min',
    },
    {
      step: 3,
      title: 'Out for Delivery',
      desc: 'Rider dispatched in insulated thermal carrier',
      icon: Bike,
      timeTag: '20-35 min',
    },
    {
      step: 4,
      title: 'Delivered Fresh',
      desc: 'Piping hot 100% pure veg meal delivered',
      icon: CheckCircle2,
      timeTag: 'Completed',
    },
  ];

  return (
    <div className="bg-[#18191D] border border-white/[0.08] hover:border-amber-400/25 transition-colors rounded-xl overflow-hidden shadow-lg">
      {/* Top Banner: Order ID, Channel, Elapsed & Countdown Summary */}
      <div className="px-6 pt-5 pb-4 border-b border-white/[0.08] bg-gradient-to-r from-neutral-900/90 via-[#1d1f25] to-neutral-900/90">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono tabular-nums font-bold text-amber-400 text-sm">
                Order #{order.id}
              </span>
              <span className="text-neutral-600" aria-hidden="true">·</span>
              <span className="text-neutral-400 flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                {order.placedAt}
              </span>
              <span className="text-neutral-600" aria-hidden="true">·</span>
              <span className="text-neutral-300">{order.paymentMethod}</span>
              {order.paymentTransactionId ? (
                <>
                  <span className="text-neutral-600" aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/40">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Confirmed After Payment (Txn: {order.paymentTransactionId})</span>
                  </span>
                </>
              ) : (
                <>
                  <span className="text-neutral-600" aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                    <span>Confirmed Order</span>
                  </span>
                </>
              )}
              {order.orderChannel && (
                <>
                  <span className="text-neutral-600" aria-hidden="true">·</span>
                  <span className="text-amber-400 font-medium text-[11px] bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                    {order.orderChannel}
                  </span>
                </>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400 mt-1.5">
              {order.customerName && (
                <span className="text-neutral-200 font-medium flex items-center gap-1">
                  <span className="text-amber-400 font-bold">👤</span>
                  {order.customerName}
                </span>
              )}
              {order.customerPhone && (
                <span className="text-neutral-300 font-mono text-[11px] flex items-center gap-1">
                  <span className="text-emerald-400">📱</span>
                  {order.customerPhone}
                </span>
              )}
              <span className="text-neutral-300 flex items-center gap-1.5 truncate max-w-xl">
                <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                {order.deliveryAddress || order.addressSummary}
              </span>
            </div>
          </div>

          {/* Live Time Elapsed & Countdown Badges */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            {/* Time Elapsed Live Pill */}
            <div className="bg-neutral-950/80 border border-white/[0.1] rounded-lg px-3 py-2 flex items-center gap-2.5">
              <div className="relative flex items-center justify-center">
                <span className="relative flex h-2.5 w-2.5">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isDelivered ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                      isDelivered ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  ></span>
                </span>
              </div>
              <div className="text-left">
                <div className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">
                  Time Elapsed
                </div>
                <div className="text-xs font-mono font-bold text-neutral-100 flex items-center gap-1 tabular-nums">
                  <Timer className="w-3.5 h-3.5 text-amber-400" />
                  <span>{formatTimeElapsed()}</span>
                </div>
              </div>
            </div>

            {/* Visual Delivery Countdown Badge */}
            <div
              className={`rounded-lg px-3.5 py-2 border flex items-center gap-2.5 min-w-[155px] ${
                isDelivered
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                  : remainingSeconds === 0
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              }`}
            >
              <div className="p-1.5 rounded-md bg-black/40">
                {isDelivered ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : remainingSeconds === 0 ? (
                  <Truck className="w-4 h-4 text-amber-300 animate-bounce" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                )}
              </div>
              <div className="text-left">
                <div className="text-[10px] uppercase font-mono tracking-wider opacity-75">
                  {isDelivered
                    ? 'Delivered'
                    : remainingSeconds === 0
                    ? 'Arriving Now'
                    : 'Est. Delivery Window'}
                </div>
                <div className="text-xs font-mono font-bold tabular-nums">
                  {isDelivered ? (
                    <span className="text-emerald-400">Piping Hot & Delivered</span>
                  ) : remainingSeconds === 0 ? (
                    <span className="text-amber-300">Rider at your gate</span>
                  ) : (
                    <span>
                      ~{remainingMinutes}m {remainingSecsRemainder < 10 ? '0' : ''}
                      {remainingSecsRemainder}s left
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Order Price */}
            <div className="text-right sm:pl-2">
              <span className="text-xs text-neutral-400 block font-mono">Total Paid</span>
              <span className="text-xl font-mono tabular-nums font-bold text-neutral-100">
                ₹{order.total}/-
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Multi-Step Tracker & Countdown Progress Bar */}
      <div className="px-6 py-5 bg-[#141518]/60 space-y-4 border-b border-white/[0.06]">
        {/* Progress Bar with Live Fill */}
        <div>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-medium text-neutral-300 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400"></span>
              Live Delivery Journey
            </span>
            <span className="font-mono tabular-nums text-xs font-semibold text-amber-400">
              {rawProgress}% Completed · {isDelivered ? 'Delivered' : `Target ~${estimatedTotalMinutes} Mins`}
            </span>
          </div>

          {/* Visual Track */}
          <div className="relative w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 rounded-full ${
                isDelivered
                  ? 'bg-gradient-to-r from-amber-500 via-emerald-400 to-emerald-500'
                  : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300'
              }`}
              style={{ width: `${rawProgress}%` }}
            >
              {!isDelivered && (
                <div className="w-full h-full bg-white/20 animate-pulse"></div>
              )}
            </div>
          </div>
        </div>

        {/* 4 Interactive Stages */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {stages.map((stage) => {
            const isCompleted = isDelivered || activeStageIndex > stage.step;
            const isCurrent = !isDelivered && activeStageIndex === stage.step;
            const isUpcoming = !isDelivered && activeStageIndex < stage.step;
            const Icon = stage.icon;

            return (
              <div
                key={stage.step}
                className={`p-3 rounded-lg border transition-all ${
                  isCurrent
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-xs shadow-amber-500/10'
                    : isCompleted
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-neutral-900/40 border-white/[0.05] opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div
                    className={`p-1.5 rounded-md ${
                      isCurrent
                        ? 'bg-amber-400 text-neutral-950 font-bold'
                        : isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-neutral-800 text-neutral-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isCurrent
                        ? 'bg-amber-400/20 text-amber-300 font-bold'
                        : isCompleted
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-neutral-800 text-neutral-500'
                    }`}
                  >
                    {isCurrent ? 'Active Now' : stage.timeTag}
                  </span>
                </div>
                <div
                  className={`text-xs font-semibold ${
                    isCurrent
                      ? 'text-amber-300 font-bold'
                      : isCompleted
                      ? 'text-neutral-200'
                      : 'text-neutral-400'
                  }`}
                >
                  {stage.title}
                </div>
                <p className="text-[11px] text-neutral-400 leading-tight mt-0.5">
                  {stage.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Live Kitchen Context Box */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg bg-black/40 border border-white/[0.06] text-xs">
          <div className="flex items-center gap-2 text-neutral-300">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {isDelivered
                ? 'Thank you for ordering with The Turban Kitchen! We hope you enjoyed the authentic Punjabi feast.'
                : activeStageIndex === 3
                ? 'Your order is on the Sri Anandpur Sahib delivery route. Delivery partner carrying hot thermal bag.'
                : activeStageIndex === 2
                ? 'Fresh paneer and slow-cooked Dal Makhni simmering on stove. Tandoor clay oven baking butter garlic naans.'
                : 'Order received and being queued into kitchen prep line. Desi ghee and pure spices prepared.'}
            </span>
          </div>

          {/* State Simulation Actions for Testing & Verification */}
          {onUpdateStatus && (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-neutral-500 font-mono">Stage Control:</span>
              {order.status !== 'Out for Delivery' && !isDelivered && (
                <button
                  type="button"
                  onClick={() => onUpdateStatus(order.id, 'Out for Delivery')}
                  className="px-2.5 py-1 text-[11px] font-medium bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 rounded transition-colors cursor-pointer"
                >
                  Mark Out for Delivery
                </button>
              )}
              {!isDelivered && (
                <button
                  type="button"
                  onClick={() => onUpdateStatus(order.id, 'Delivered')}
                  className="px-2.5 py-1 text-[11px] font-medium bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 rounded transition-colors cursor-pointer"
                >
                  Mark as Delivered ✓
                </button>
              )}
              {isDelivered && (
                <button
                  type="button"
                  onClick={() => onUpdateStatus(order.id, 'Preparing in Kitchen')}
                  className="px-2.5 py-1 text-[11px] font-medium bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border border-white/[0.1] rounded transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RotateCw className="w-3 h-3" />
                  Restart Cooking
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Itemized Order Breakdown */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsItemsExpanded((prev) => !prev)}
            className="flex items-center gap-2 text-xs font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            <span>Dishes in this Order ({order.items.reduce((s, i) => s + i.quantity, 0)} items)</span>
            {isItemsExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-neutral-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            )}
          </button>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <a
              href={`tel:${RESTAURANT_INFO.mobile}`}
              className="inline-flex items-center gap-1 text-xs text-neutral-300 hover:text-amber-400 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Kitchen</span>
            </a>
            <a
              href={buildRepeatWhatsAppHref(order)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Send / Repeat on WhatsApp</span>
            </a>
          </div>
        </div>

        {isItemsExpanded && (
          <div className="divide-y divide-white/[0.06] bg-black/20 rounded-lg p-3 border border-white/[0.04]">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="py-2.5 flex items-center justify-between text-xs text-neutral-300 first:pt-1 last:pb-1"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono tabular-nums font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded text-[11px]">
                    {item.quantity}x
                  </span>
                  <div>
                    <span className="font-medium text-neutral-100">
                      {item.name} {item.variant ? `(${item.variant})` : ''}
                    </span>
                    <span className="text-neutral-500 ml-2">
                      · {item.spiceLevel}
                      {item.isJain ? ' · Jain (No Onion/Garlic)' : ''}
                    </span>
                  </div>
                </div>
                <span className="font-mono tabular-nums font-semibold text-neutral-100">
                  ₹{item.unitPrice * item.quantity}/-
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
