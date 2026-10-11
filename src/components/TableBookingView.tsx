import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Users,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Phone,
  MessageCircle,
  Sparkles,
  ChevronRight,
  Info,
  CalendarCheck,
  Award,
  Share2,
} from 'lucide-react';
import { BookingRecord, RESTAURANT_INFO, UserProfileSettings } from '../data/menuData';

interface TableBookingViewProps {
  profile: UserProfileSettings;
  bookings: BookingRecord[];
  onInitiateBookingPayment: (bookingDraft: Omit<BookingRecord, 'id' | 'paymentTransactionId' | 'paymentUpiVpa' | 'status' | 'createdAtMs' | 'placedAt'>) => void;
  onCancelBooking?: (bookingId: string) => void;
}

const SEATING_SECTIONS = [
  {
    id: 'AC Family Dining',
    name: 'AC Family Dining',
    desc: 'Air-conditioned hall with comfortable booths for families & elders',
    tag: 'Popular',
  },
  {
    id: 'Traditional Baithak',
    name: 'Traditional Baithak',
    desc: 'Authentic Punjabi cultural ambiance with low seating & handcrafted wood',
    tag: 'Cultural Experience',
  },
  {
    id: 'Garden Courtyard',
    name: 'Garden Courtyard',
    desc: 'Fresh open-air evening seating under festive lights',
    tag: 'Evening Favorite',
  },
  {
    id: 'VIP Anandpur Hall',
    name: 'VIP Anandpur Hall',
    desc: 'Exclusive private section for celebrations & Yatra pilgrim groups',
    tag: 'Private & Quiet',
  },
] as const;

const TIME_SLOTS = [
  { label: 'Lunch 12:30 PM', time: '12:30 PM' },
  { label: 'Lunch 01:15 PM', time: '01:15 PM' },
  { label: 'Lunch 02:00 PM', time: '02:00 PM' },
  { label: 'Lunch 02:45 PM', time: '02:45 PM' },
  { label: 'Dinner 07:30 PM', time: '07:30 PM' },
  { label: 'Dinner 08:15 PM', time: '08:15 PM' },
  { label: 'Dinner 09:00 PM', time: '09:00 PM' },
  { label: 'Dinner 09:45 PM', time: '09:45 PM' },
];

export const TableBookingView: React.FC<TableBookingViewProps> = ({
  profile,
  bookings,
  onInitiateBookingPayment,
  onCancelBooking,
}) => {
  // Booking Form State
  const [guests, setGuests] = useState<number>(4);
  const [customGuests, setCustomGuests] = useState<string>('');
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState<string>('08:15 PM');
  const [seatingSection, setSeatingSection] = useState<BookingRecord['seatingSection']>('AC Family Dining');
  const [occasion, setOccasion] = useState<BookingRecord['occasion']>('Family Dining');
  const [customerName, setCustomerName] = useState<string>(profile.fullName || 'Gurpreet Singh');
  const [phone, setPhone] = useState<string>(profile.phone || '+91 98140-78901');
  const [email, setEmail] = useState<string>(profile.email || 'guest@turbankitchen.in');
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [isJainPreference, setIsJainPreference] = useState<boolean>(profile.preferences.jainPreparationDefault || false);

  const finalGuests = guests === -1 ? Math.max(1, parseInt(customGuests || '8', 10)) : guests;
  const advanceAmount = 199; // Advance token 100% redeemable against food bill

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim()) {
      return;
    }

    const tablePrefix = seatingSection.startsWith('VIP')
      ? 'VIP'
      : seatingSection.startsWith('Traditional')
      ? 'B'
      : seatingSection.startsWith('Garden')
      ? 'G'
      : 'T';
    const randomTableNum = `${tablePrefix}-${Math.floor(1 + Math.random() * 16)}`;

    onInitiateBookingPayment({
      customerName: customerName.trim(),
      phone: phone.trim(),
      email: email.trim() || 'guest@turbankitchen.in',
      guests: finalGuests,
      date,
      timeSlot,
      seatingSection,
      occasion,
      specialRequests: specialRequests.trim() || undefined,
      isJainPreference,
      tableNumber: randomTableNum,
      advanceAmount,
    });
  };

  const handleShareWhatsApp = (booking: BookingRecord) => {
    const text = encodeURIComponent(
      `🙏 *The Turban Kitchen — Confirmed Table Reservation*\n` +
      `📍 *Location:* Near Bus Stand, Sri Anandpur Sahib\n` +
      `🔖 *Booking ID:* ${booking.id}\n` +
      `👤 *Guest Name:* ${booking.customerName}\n` +
      `👥 *Party Size:* ${booking.guests} Guests\n` +
      `📅 *Date & Time:* ${booking.date} at ${booking.timeSlot}\n` +
      `🪑 *Assigned Table:* ${booking.tableNumber} (${booking.seatingSection})\n` +
      `💳 *Advance Paid:* ₹${booking.advanceAmount}/- (Txn: ${booking.paymentTransactionId})\n` +
      `⚡ *Status:* Confirmed After Payment (UPI - 9877932787@fam)\n` +
      `🍽️ *100% Pure Vegetarian Family Restaurant*`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-10">
      {/* Header Banner */}
      <div className="pb-6 border-b border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>Sri Anandpur Sahib Family Table Reservations</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-neutral-100">
            Reserve a Table at The Turban Kitchen
          </h2>
          <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
            Experience our 100% pure vegetarian Punjabi hospitality. Reserve your table in advance with instant payment confirmation.
          </p>
        </div>

        {/* Golden Rule Badge */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 text-left md:text-right max-w-xs shrink-0">
          <div className="flex items-center md:justify-end gap-1.5 text-xs font-bold text-amber-400">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Booking Confirmed After Payment</span>
          </div>
          <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">
            ₹199 advance reservation token is <strong>100% redeemable against your final food bill</strong>.
          </p>
        </div>
      </div>

      {/* Main Grid: Reservation Form + Live Policy & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Booking Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form
            onSubmit={handleSubmit}
            className="bg-[#18191D] border border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-xl space-y-6"
          >
            {/* Strict Notice Box */}
            <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                  Important Reservation Policy
                </h4>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  <strong>Booking will be confirmed after payment.</strong> To prevent fake reservations and hold your table during busy Gurpurab and weekend rush hours, a nominal ₹199 advance is verified via UPI (9877932787@fam).
                </p>
              </div>
            </div>

            {/* 1. Guests Count */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-neutral-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  Select Party Size / Guests
                </span>
                <span className="text-[11px] text-neutral-500">
                  {finalGuests} Guests Selected
                </span>
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {[2, 4, 6, 8].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => {
                      setGuests(count);
                      setCustomGuests('');
                    }}
                    className={`py-2.5 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all border ${
                      guests === count
                        ? 'bg-amber-400 text-neutral-950 border-amber-400 shadow-md shadow-amber-400/20'
                        : 'bg-neutral-900 border-white/[0.08] text-neutral-300 hover:border-white/[0.2]'
                    }`}
                  >
                    {count} Guests
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setGuests(-1)}
                  className={`py-2.5 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all border ${
                    guests === -1
                      ? 'bg-amber-400 text-neutral-950 border-amber-400 shadow-md shadow-amber-400/20'
                      : 'bg-neutral-900 border-white/[0.08] text-neutral-300 hover:border-white/[0.2]'
                  }`}
                >
                  10+ Large
                </button>
              </div>

              {guests === -1 && (
                <div className="pt-2">
                  <input
                    type="number"
                    min="9"
                    max="60"
                    placeholder="Enter guest count (e.g. 15 for Yatra Group)"
                    value={customGuests}
                    onChange={(e) => setCustomGuests(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-neutral-900 border border-amber-400/40 rounded-lg text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                  <p className="text-[11px] text-amber-300/80 mt-1">
                    Groups over 10 are allocated dedicated seating in the VIP Anandpur Hall.
                  </p>
                </div>
              )}
            </div>

            {/* 2. Date & Time Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  Reservation Date
                </label>
                <input
                  type="date"
                  value={date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-neutral-900 border border-white/[0.12] rounded-lg text-neutral-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Preferred Time Slot
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-neutral-900 border border-white/[0.12] rounded-lg text-neutral-100 focus:outline-none focus:border-amber-400"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot.time} value={slot.time}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. Seating Section */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-neutral-300">
                Seating Atmosphere &amp; Section
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SEATING_SECTIONS.map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setSeatingSection(sec.id)}
                    className={`p-3 rounded-xl text-left transition-all border cursor-pointer ${
                      seatingSection === sec.id
                        ? 'bg-amber-500/10 border-amber-400/80 shadow-sm'
                        : 'bg-neutral-900/60 border-white/[0.08] hover:border-white/[0.15]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-neutral-100">
                        {sec.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-amber-400 font-mono">
                        {sec.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                      {sec.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Occasion */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">
                Special Occasion (Optional)
              </label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value as BookingRecord['occasion'])}
                className="w-full px-3.5 py-2.5 text-xs bg-neutral-900 border border-white/[0.12] rounded-lg text-neutral-100 focus:outline-none focus:border-amber-400"
              >
                <option value="Family Dining">Family Dining</option>
                <option value="Birthday Celebration">Birthday Celebration (Complimentary table dessert setup)</option>
                <option value="Anniversary">Anniversary</option>
                <option value="Anandpur Sahib Darshan Yatra">Sri Anandpur Sahib Darshan / Yatra Pilgrimage</option>
                <option value="Casual Gathering">Casual Friends Gathering</option>
              </select>
            </div>

            {/* 5. Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300">
                  Guest Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Manjeet Singh"
                  className="w-full px-3.5 py-2.5 text-xs bg-neutral-900 border border-white/[0.12] rounded-lg text-neutral-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300">
                  Contact Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98140 12345"
                  className="w-full px-3.5 py-2.5 text-xs bg-neutral-900 border border-white/[0.12] rounded-lg text-neutral-100 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Dietary Preferences & Requests */}
            <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-white/[0.06] space-y-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-200">
                <input
                  type="checkbox"
                  checked={isJainPreference}
                  onChange={(e) => setIsJainPreference(e.target.checked)}
                  className="rounded border-white/20 bg-neutral-800 text-amber-500 focus:ring-0 w-4 h-4"
                />
                <span className="font-medium text-emerald-400">
                  100% Jain Dietary Preparation
                </span>
                <span className="text-[11px] text-neutral-400">
                  (No root vegetables, onion, or garlic)
                </span>
              </label>

              <input
                type="text"
                placeholder="Special notes: e.g. Baby chair needed, peaceful corner table, flower vase"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-neutral-950 border border-white/[0.08] rounded-lg text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Submit & Payment Trigger Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2.5"
              >
                <ShieldCheck className="w-5 h-5 text-neutral-950" />
                <span>
                  Pay ₹{advanceAmount}/- &amp; Confirm Booking (9877932787@fam)
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <p className="text-center text-[11px] text-neutral-400 mt-2">
                ⚡ <strong>Booking will be confirmed after payment.</strong> ₹{advanceAmount}/- is 100% deducted from your final restaurant bill.
              </p>
            </div>
          </form>
        </div>

        {/* Right Column: Policies & Quick Help (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Reservation Card Preview */}
          <div className="bg-[#18191D] border border-amber-400/30 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
                <CalendarCheck className="w-4 h-4 text-amber-400" />
                <span>Reservation Summary</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/30 font-semibold">
                Pending Payment
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span className="text-neutral-400">Restaurant:</span>
                <span className="text-neutral-100 font-medium">The Turban Kitchen</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span className="text-neutral-400">Date &amp; Time:</span>
                <span className="text-amber-300 font-semibold">{date} · {timeSlot}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span className="text-neutral-400">Party Size:</span>
                <span className="text-neutral-100 font-medium">{finalGuests} Guests</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span className="text-neutral-400">Seating:</span>
                <span className="text-neutral-100 font-medium">{seatingSection}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span className="text-neutral-400">Occasion:</span>
                <span className="text-neutral-100">{occasion}</span>
              </div>
              <div className="flex justify-between py-1.5 pt-2 text-neutral-100 font-semibold">
                <span>Advance Token Required:</span>
                <span className="font-mono text-amber-400 text-sm">₹{advanceAmount}/-</span>
              </div>
            </div>

            <div className="p-3 bg-neutral-900/80 rounded-xl border border-white/[0.06] text-[11px] text-neutral-400 leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>100% Bill Credit:</strong> Your ₹{advanceAmount}/- advance will be subtracted directly from your final dine-in bill. Free cancellation up to 1 hour before scheduled time.
              </span>
            </div>
          </div>

          {/* Restaurant Amenities */}
          <div className="p-5 rounded-2xl bg-[#14161B] border border-white/[0.08] space-y-3">
            <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
              Dining Hospitality Features
            </h4>
            <ul className="text-xs text-neutral-300 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>100% Pure Vegetarian Kitchen &amp; Jain-special menu</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Ample parking available near Sri Anandpur Sahib Bus Stand</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Gurpurab &amp; Virasat-e-Khalsa pilgrim groups welcomed</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Complimentary Wi-Fi &amp; high-chair seating for toddlers</span>
              </li>
            </ul>

            <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs">
              <a
                href={`tel:${RESTAURANT_INFO.landlines[0]}`}
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Desk: {RESTAURANT_INFO.landlines[0]}</span>
              </a>
              <a
                href={`https://wa.me/${RESTAURANT_INFO.whatsappNumberClean}`}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmed Bookings Section */}
      <div className="pt-8 border-t border-white/[0.08] space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-xl font-semibold text-neutral-100 flex items-center gap-2">
              <span>My Table Reservations</span>
              <span className="text-xs font-mono font-normal px-2 py-0.5 bg-neutral-900 border border-white/[0.1] rounded-full text-neutral-300">
                {bookings.length} {bookings.length === 1 ? 'Booking' : 'Bookings'}
              </span>
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Confirmed table reservations with payment verification receipt.
            </p>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="py-12 px-6 rounded-2xl bg-neutral-900/40 border border-white/[0.06] text-center max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-neutral-200">
              No Table Reservations Yet
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Fill out the form above and complete the advance token to reserve your table. <strong>Booking will be confirmed after payment.</strong>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="bg-[#18191D] border border-emerald-500/30 rounded-2xl p-5 shadow-lg space-y-4 hover:border-emerald-500/50 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/[0.08]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-amber-400">
                        #{b.id}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Confirmed After Payment</span>
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 font-medium mt-1">
                      {b.customerName} ({b.phone})
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-mono text-neutral-400 block">
                      Assigned Table
                    </span>
                    <span className="text-sm font-bold font-mono text-amber-300">
                      {b.tableNumber}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-white/[0.04]">
                    <span className="text-[10px] text-neutral-400 uppercase font-mono block">
                      Date &amp; Slot
                    </span>
                    <span className="text-neutral-100 font-medium">
                      {b.date} · {b.timeSlot}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-white/[0.04]">
                    <span className="text-[10px] text-neutral-400 uppercase font-mono block">
                      Party &amp; Seating
                    </span>
                    <span className="text-neutral-100 font-medium">
                      {b.guests} Guests · {b.seatingSection}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-white/[0.04] col-span-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase font-mono block">
                          Payment Txn (UPI - 9877932787@fam)
                        </span>
                        <span className="font-mono text-[11px] text-blue-400">
                          {b.paymentTransactionId} ({b.paymentUpiVpa})
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        ₹{b.advanceAmount}/- Paid
                      </span>
                    </div>
                  </div>
                </div>

                {b.specialRequests && (
                  <p className="text-[11px] text-neutral-400 bg-neutral-950/60 px-3 py-1.5 rounded-lg border border-white/[0.04]">
                    <strong>Note:</strong> {b.specialRequests}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.08] text-xs">
                  <button
                    type="button"
                    onClick={() => handleShareWhatsApp(b)}
                    className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp Pass</span>
                  </button>

                  <a
                    href="https://maps.google.com/?q=Near+Bus+Stand+Sri+Anandpur+Sahib"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-neutral-300 hover:text-amber-400 cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>Directions</span>
                  </a>

                  {onCancelBooking && (
                    <button
                      type="button"
                      onClick={() => onCancelBooking(b.id)}
                      className="text-neutral-400 hover:text-red-400 cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
