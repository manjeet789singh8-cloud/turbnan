import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Heart,
  Check,
  Sliders,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  X,
  MessageCircle,
  ShieldCheck,
  LogIn,
  LogOut,
  User as UserIcon,
  Calendar,
  Truck,
  Edit3,
} from 'lucide-react';
import {
  MENU_CATEGORIES,
  MENU_ITEMS,
  MenuItem,
  MenuCategoryId,
  RESTAURANT_INFO,
  INITIAL_USER_PROFILE,
  INITIAL_ORDERS,
  INITIAL_BOOKINGS,
  UserProfileSettings,
  OrderRecord,
  BookingRecord,
} from './data/menuData';
import { MenuPamphletView } from './components/MenuPamphletView';
import { ProfilePreferencesTab } from './components/ProfilePreferencesTab';
import { WhatsAppOrderModal } from './components/WhatsAppOrderModal';
import { OrderConfirmedWhatsAppModal } from './components/OrderConfirmedWhatsAppModal';
import { UPIPaymentModal, UPIPaymentSuccessData } from './components/UPIPaymentModal';
import { AuthModal } from './components/AuthModal';
import { OrderStatusCard } from './components/OrderStatusCard';
import { TableBookingView } from './components/TableBookingView';
import {
  auth,
  db,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  onSnapshot,
  handleFirestoreError,
  OperationType,
  User,
} from './firebase';

import heroFeastImg from './assets/images/hero_punjabi_feast_1790853326522.jpg';
import tandooriPlatterImg from './assets/images/dish_tandoori_platter_1790853340259.jpg';
import chineseMomosImg from './assets/images/dish_chinese_momos_1790853352952.jpg';

type DashboardTab = 'menu' | 'pamphlet' | 'booking' | 'orders' | 'profile_preferences';

interface CartItem {
  cartKey: string;
  item: MenuItem;
  variant: 'Half' | 'Full';
  unitPrice: number;
  quantity: number;
  spiceLevel: 'Mild' | 'Medium' | 'Punjabi Spicy';
  isJain: boolean;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('menu');
  const [profile, setProfile] = useState<UserProfileSettings>(INITIAL_USER_PROFILE);
  const [orders, setOrders] = useState<OrderRecord[]>(INITIAL_ORDERS);
  const [bookings, setBookings] = useState<BookingRecord[]>(INITIAL_BOOKINGS);
  const [bookingDraft, setBookingDraft] = useState<Omit<BookingRecord, 'id' | 'paymentTransactionId' | 'paymentUpiVpa' | 'status' | 'createdAtMs' | 'placedAt'> | null>(null);
  const [paymentPurpose, setPaymentPurpose] = useState<'order' | 'booking'>('order');

  // Menu Filtering State
  const [selectedCategory, setSelectedCategory] = useState<'all' | MenuCategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyJainFilter, setOnlyJainFilter] = useState(false);
  const [onlyFavoritesFilter, setOnlyFavoritesFilter] = useState(false);

  // Image error states for Zero-Broken-Image Policy
  const [heroImgError, setHeroImgError] = useState(false);
  const [tandooriImgError, setTandooriImgError] = useState(false);
  const [chineseImgError, setChineseImgError] = useState(false);

  // Cart State starts at 0 items (₹0/-)
  const [cart, setCart] = useState<CartItem[]>([]);

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [orderCustomerName, setOrderCustomerName] = useState(profile.fullName || 'Manjeet Singh');
  const [orderCustomerPhone, setOrderCustomerPhone] = useState(profile.phone || '+91 98779-32787');
  const [orderCustomerAddress, setOrderCustomerAddress] = useState(
    'House No. 142, Ward 4, Near Gurdwara Takht Sri Keshgarh Sahib, Sri Anandpur Sahib'
  );
  const [isEditingOrderDetails, setIsEditingOrderDetails] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [toastNotification, setToastNotification] = useState<string | null>(null);
  const [confirmedOrderForWhatsApp, setConfirmedOrderForWhatsApp] = useState<{
    order: OrderRecord;
    whatsappUrl: string;
    formattedMessage: string;
  } | null>(null);

  // Real-time Firebase Authentication & Firestore Listener
  const unsubOrdersRef = useRef<(() => void) | null>(null);
  const unsubBookingsRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      // 1. Immediately unsubscribe any existing orders and bookings listener
      if (unsubOrdersRef.current) {
        unsubOrdersRef.current();
        unsubOrdersRef.current = null;
      }
      if (unsubBookingsRef.current) {
        unsubBookingsRef.current();
        unsubBookingsRef.current = null;
      }

      setCurrentUser(user);

      if (!user) {
        // User is not signed in; do not attach authenticated Firestore queries
        return;
      }

      // 2. User is authenticated: load or initialize profile document
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const data = userSnap.data() as Partial<UserProfileSettings>;
          setProfile((prev) => ({
            ...prev,
            ...data,
            fullName: user.displayName || data.fullName || prev.fullName,
            email: user.email || data.email || prev.email,
          }));
        } else {
          const initialDoc = {
            ...INITIAL_USER_PROFILE,
            uid: user.uid,
            fullName: user.displayName || user.email?.split('@')[0] || 'Manjeet Singh',
            email: user.email || 'manjeet789singh8@gmail.com',
            createdAt: new Date().toISOString(),
          };
          await setDoc(userDocRef, initialDoc, { merge: true });
          setProfile((prev) => ({ ...prev, ...initialDoc }));
        }
      } catch (err) {
        console.warn('Could not sync user profile from Firestore:', err);
      }

      // 3. Attach real-time listener for user orders from Firestore while authenticated
      try {
        const ordersQuery = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid)
        );
        const unsub = onSnapshot(
          ordersQuery,
          (snapshot) => {
            const remoteOrders: OrderRecord[] = [];
            snapshot.forEach((snapDoc) => {
              const data = snapDoc.data() as Omit<OrderRecord, 'id'> & { createdAt?: string; createdAtMs?: number; estimatedDeliveryMinutes?: number };
              remoteOrders.push({
                id: snapDoc.id,
                ...data,
                createdAtMs: data.createdAtMs || (data.createdAt ? new Date(data.createdAt).getTime() : Date.now()),
                estimatedDeliveryMinutes: data.estimatedDeliveryMinutes || 35,
              });
            });
            if (remoteOrders.length > 0) {
              setOrders(remoteOrders);
            }
          },
          (err) => {
            // Only report permission errors if the user is actively logged in
            if (auth.currentUser) {
              handleFirestoreError(err, OperationType.LIST, 'orders');
            }
          }
        );
        unsubOrdersRef.current = unsub;
      } catch (err) {
        console.warn('Orders listener init error:', err);
      }

      // 4. Attach real-time listener for user bookings from Firestore while authenticated
      try {
        const bookingsQuery = query(
          collection(db, 'bookings'),
          where('userId', '==', user.uid)
        );
        const unsubB = onSnapshot(
          bookingsQuery,
          (snapshot) => {
            const remoteBookings: BookingRecord[] = [];
            snapshot.forEach((snapDoc) => {
              const data = snapDoc.data() as Omit<BookingRecord, 'id'> & { createdAt?: string; createdAtMs?: number };
              remoteBookings.push({
                id: snapDoc.id,
                ...data,
                createdAtMs: data.createdAtMs || (data.createdAt ? new Date(data.createdAt).getTime() : Date.now()),
              });
            });
            if (remoteBookings.length > 0) {
              setBookings(remoteBookings);
            }
          },
          (err) => {
            if (auth.currentUser) {
              handleFirestoreError(err, OperationType.LIST, 'bookings');
            }
          }
        );
        unsubBookingsRef.current = unsubB;
      } catch (err) {
        console.warn('Bookings listener init error:', err);
      }
    });

    return () => {
      unsubAuth();
      if (unsubOrdersRef.current) {
        unsubOrdersRef.current();
        unsubOrdersRef.current = null;
      }
      if (unsubBookingsRef.current) {
        unsubBookingsRef.current();
        unsubBookingsRef.current = null;
      }
    };
  }, []);

  const handleSignOut = async () => {
    try {
      if (unsubOrdersRef.current) {
        unsubOrdersRef.current();
        unsubOrdersRef.current = null;
      }
      if (unsubBookingsRef.current) {
        unsubBookingsRef.current();
        unsubBookingsRef.current = null;
      }
      await signOut(auth);
      setCurrentUser(null);
      showToast('Signed out of Firebase account.');
    } catch (err) {
      console.error('Sign Out Error:', err);
    }
  };

  const handleUpdateProfile = async (updated: UserProfileSettings) => {
    setProfile(updated);
    if (currentUser) {
      try {
        await setDoc(
          doc(db, 'users', currentUser.uid),
          { ...updated, uid: currentUser.uid, updatedAt: new Date().toISOString() },
          { merge: true }
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}`);
      }
    }
  };

  const showToast = (msg: string) => {
    setToastNotification(msg);
    window.setTimeout(() => {
      setToastNotification((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  // Add item to cart using user's configured Account Preferences
  const handleAddToCart = (
    item: MenuItem,
    explicitVariant?: 'Half' | 'Full'
  ) => {
    const variant: 'Half' | 'Full' = item.halfPrice
      ? explicitVariant || profile.preferences.defaultPortionSize
      : 'Full';
    const unitPrice =
      variant === 'Half' && item.halfPrice ? item.halfPrice : item.price;
    const spiceLevel = profile.preferences.defaultSpiceLevel;
    const isJain =
      profile.preferences.jainPreparationDefault && item.isJainAvailable;

    const cartKey = `${item.id}-${variant}-${spiceLevel}-${isJain}`;

    setCart((prev) => {
      const existingIndex = prev.findIndex((c) => c.cartKey === cartKey);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }
      return [
        ...prev,
        {
          cartKey,
          item,
          variant,
          unitPrice,
          quantity: 1,
          spiceLevel,
          isJain,
        },
      ];
    });

    showToast(
      `Added ${item.name}${item.halfPrice ? ` (${variant})` : ''} · ${spiceLevel}${
        isJain ? ' · Jain' : ''
      }`
    );
  };

  const handleUpdateCartQuantity = (cartKey: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((entry) =>
          entry.cartKey === cartKey
            ? { ...entry, quantity: entry.quantity + delta }
            : entry
        )
        .filter((entry) => entry.quantity > 0)
    );
  };

  const handleToggleFavorite = (itemId: string) => {
    const exists = profile.favoriteItemIds.includes(itemId);
    const updatedFavs = exists
      ? profile.favoriteItemIds.filter((id) => id !== itemId)
      : [...profile.favoriteItemIds, itemId];
    setProfile({
      ...profile,
      favoriteItemIds: updatedFavs,
    });
  };

  const activeAddress = useMemo(
    () =>
      profile.addresses.find((a) => a.isDefault) || profile.addresses[0],
    [profile.addresses]
  );

  const cartItemCount = useMemo(
    () => cart.reduce((sum, entry) => sum + entry.quantity, 0),
    [cart]
  );

  const cartSubtotal = useMemo(
    () => cart.reduce((sum, entry) => sum + entry.unitPrice * entry.quantity, 0),
    [cart]
  );

  const isWithin3Km =
    activeAddress && activeAddress.distanceKm <= RESTAURANT_INFO.deliveryRadiusKm;
  const qualifiesForFreeDelivery = Boolean(isWithin3Km);
  const deliveryFee =
    cartSubtotal === 0
      ? 0
      : qualifiesForFreeDelivery
      ? 0
      : RESTAURANT_INFO.standardDeliveryFee;
  const cartTotal = cartSubtotal + deliveryFee;
  const amountNeededForFreeDelivery = 0;

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    // Strict Policy: Order will be confirmed after payment
    setPaymentPurpose('order');
    setIsPaymentModalOpen(true);
    showToast('Confirming order via UPI (9877932787@fam)...');
  };

  const handleInitiateBookingPayment = (
    draft: Omit<
      BookingRecord,
      'id' | 'paymentTransactionId' | 'paymentUpiVpa' | 'status' | 'createdAtMs' | 'placedAt'
    >
  ) => {
    // Strict Policy: Booking will be confirmed after payment
    setBookingDraft(draft);
    setPaymentPurpose('booking');
    setIsPaymentModalOpen(true);
    showToast('Booking will be confirmed after payment. Complete ₹199 advance via UPI (9877932787@fam).');
  };

  const handleCancelBooking = async (bookingId: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    showToast(`Table booking #${bookingId} cancelled.`);
  };

  const handlePaymentSuccess = (paymentData: UPIPaymentSuccessData) => {
    // Sync customer details from payment modal
    if (paymentData.customerName) setOrderCustomerName(paymentData.customerName);
    if (paymentData.customerPhone) setOrderCustomerPhone(paymentData.customerPhone);
    if (paymentData.deliveryAddress) setOrderCustomerAddress(paymentData.deliveryAddress);

    // Case 1: Table & Dining Booking Confirmation
    if (paymentPurpose === 'booking') {
      if (!bookingDraft) return;
      const newBooking: BookingRecord = {
        id: `TTK-BK-${Math.floor(1000 + Math.random() * 8999)}`,
        placedAt: 'Just now (UPI Paid)',
        createdAtMs: Date.now(),
        status: 'Confirmed (Payment Verified)',
        paymentTransactionId: paymentData.transactionId,
        paymentUpiVpa: paymentData.upiVpa,
        ...bookingDraft,
      };

      setBookings((prev) => [newBooking, ...prev]);
      setBookingDraft(null);
      setIsPaymentModalOpen(false);
      setActiveTab('booking');
      showToast(
        `Table Booking #${newBooking.id} Confirmed After Payment! Table ${newBooking.tableNumber} reserved.`
      );

      // Automatically dispatch WhatsApp reservation pass
      const bookingText = encodeURIComponent(
        `🙏 *The Turban Kitchen — Confirmed Table Reservation*\n` +
          `📍 *Location:* Near Bus Stand, Sri Anandpur Sahib\n` +
          `🔖 *Booking ID:* ${newBooking.id}\n` +
          `👤 *Guest Name:* ${newBooking.customerName}\n` +
          `👥 *Party Size:* ${newBooking.guests} Guests\n` +
          `📅 *Date & Time:* ${newBooking.date} at ${newBooking.timeSlot}\n` +
          `🪑 *Assigned Table:* ${newBooking.tableNumber} (${newBooking.seatingSection})\n` +
          `💳 *Advance Paid:* ₹${newBooking.advanceAmount}/- (Txn: ${newBooking.paymentTransactionId})\n` +
          `⚡ *Status:* Confirmed After Payment (UPI - 9877932787@fam)\n` +
          `🍽️ *100% Pure Vegetarian Family Restaurant*`
      );
      try {
        window.open(
          `https://wa.me/${RESTAURANT_INFO.whatsappNumberClean}?text=${bookingText}`,
          '_blank'
        );
      } catch (err) {
        console.warn('Auto booking WhatsApp dispatch error:', err);
      }

      // Persist to Firestore if user is authenticated
      if (currentUser) {
        try {
          setDoc(doc(db, 'bookings', newBooking.id), {
            ...newBooking,
            userId: currentUser.uid,
            createdAt: new Date().toISOString(),
          }).catch((err) => {
            handleFirestoreError(err, OperationType.CREATE, `bookings/${newBooking.id}`);
          });
        } catch (err) {
          console.warn('Firestore booking save error:', err);
        }
      }
      return;
    }

    // Case 2: Food Order Confirmation (Order confirmed after payment)
    if (cart.length === 0) return;
    const finalCustName = paymentData.customerName || orderCustomerName || profile.fullName;
    const finalCustPhone = paymentData.customerPhone || orderCustomerPhone || profile.phone;
    const finalCustAddress =
      paymentData.deliveryAddress ||
      orderCustomerAddress ||
      (activeAddress
        ? `${activeAddress.label} — ${activeAddress.streetLine}`
        : RESTAURANT_INFO.address);

    const newOrder: OrderRecord = {
      id: `TTK-UPI-${Math.floor(1000 + Math.random() * 8999)}`,
      placedAt: 'Just now (UPI Paid)',
      createdAtMs: Date.now(),
      estimatedDeliveryMinutes: 35,
      status: 'Payment Verified (UPI)',
      orderChannel: 'Direct UPI (9877932787@fam)',
      customerName: finalCustName,
      customerPhone: finalCustPhone,
      deliveryAddress: finalCustAddress,
      paymentTransactionId: paymentData.transactionId,
      paymentUpiVpa: paymentData.upiVpa,
      items: cart.map((c) => ({
        name: c.item.name,
        variant: c.item.halfPrice ? c.variant : undefined,
        quantity: c.quantity,
        unitPrice: c.unitPrice,
        spiceLevel: c.spiceLevel,
        isJain: c.isJain,
      })),
      subtotal: cartSubtotal,
      deliveryFee,
      total: cartTotal,
      addressSummary: `${finalCustName} (${finalCustPhone}) · ${finalCustAddress}`,
      paymentMethod: `Direct UPI (${paymentData.upiVpa})`,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setIsPaymentModalOpen(false);
    setIsCartDrawerOpen(false);
    setActiveTab('orders');
    showToast(
      `Order #${newOrder.id} Confirmed! Automatically sending details on WhatsApp...`
    );

    // Automatically send order details on WhatsApp
    automaticallySendOrderOnWhatsApp(newOrder);

    // Persist to Firestore if user is authenticated
    if (currentUser) {
      try {
        setDoc(doc(db, 'orders', newOrder.id), {
          ...newOrder,
          userId: currentUser.uid,
          createdAt: new Date().toISOString(),
        }).catch((err) => {
          handleFirestoreError(err, OperationType.CREATE, `orders/${newOrder.id}`);
        });
      } catch (err) {
        console.warn('Firestore order save error:', err);
      }
    }
  };

  const handleConfirmWhatsAppOrder = (customNote: string) => {
    if (cart.length === 0) return;
    const finalCustName = orderCustomerName || profile.fullName;
    const finalCustPhone = orderCustomerPhone || profile.phone;
    const finalCustAddress =
      orderCustomerAddress ||
      (activeAddress
        ? `${activeAddress.label} — ${activeAddress.streetLine}`
        : RESTAURANT_INFO.address);

    const newOrder: OrderRecord = {
      id: `TTK-WA-${Math.floor(1000 + Math.random() * 8999)}`,
      placedAt: 'Just now via WhatsApp',
      createdAtMs: Date.now(),
      estimatedDeliveryMinutes: 35,
      status: 'Sent via WhatsApp',
      orderChannel: 'WhatsApp Direct (+91-73 7909-7909)',
      customerName: finalCustName,
      customerPhone: finalCustPhone,
      deliveryAddress: finalCustAddress,
      items: cart.map((c) => ({
        name: c.item.name,
        variant: c.item.halfPrice ? c.variant : undefined,
        quantity: c.quantity,
        unitPrice: c.unitPrice,
        spiceLevel: c.spiceLevel,
        isJain: c.isJain,
      })),
      subtotal: cartSubtotal,
      deliveryFee,
      total: cartTotal,
      addressSummary: `${finalCustName} (${finalCustPhone}) · ${finalCustAddress}${
        customNote.trim() ? ` · Note: "${customNote.trim()}"` : ''
      }`,
      paymentMethod: profile.preferences.defaultPaymentMethod,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setIsWhatsAppModalOpen(false);
    setIsCartDrawerOpen(false);
    setActiveTab('orders');
    showToast(
      `Order #${newOrder.id} Confirmed! Automatically sending details on WhatsApp...`
    );

    // Automatically send order details on WhatsApp
    automaticallySendOrderOnWhatsApp(newOrder, customNote);

    // Persist to Firestore if user is authenticated
    if (currentUser) {
      try {
        setDoc(doc(db, 'orders', newOrder.id), {
          ...newOrder,
          userId: currentUser.uid,
          createdAt: new Date().toISOString(),
        }).catch((err) => {
          handleFirestoreError(err, OperationType.CREATE, `orders/${newOrder.id}`);
        });
      } catch (err) {
        console.warn('Firestore order save error:', err);
      }
    }
  };

  const buildOrderWhatsAppText = (order: OrderRecord, customNote: string = '') => {
    const isFreeDelivery = order.deliveryFee === 0;
    const lines = [
      `*🙏 THE TURBAN KITCHEN — ORDER CONFIRMED*`,
      `📍 Near Bus Stand, Sri Anandpur Sahib`,
      `📞 Kitchen WhatsApp Line: ${RESTAURANT_INFO.mobile}`,
      `--------------------------------`,
      `*✅ ORDER ID:* #${order.id}`,
      `*⚡ STATUS:* Confirmed After Payment (UPI Verified)`,
      order.paymentTransactionId ? `*💳 TXN ID:* ${order.paymentTransactionId}` : '',
      `*🏦 UPI VPA:* ${order.paymentUpiVpa || '9877932787@fam'}`,
      `--------------------------------`,
      `*👤 CUSTOMER:* ${order.customerName || profile.fullName}`,
      `*📱 PHONE:* ${order.customerPhone || profile.phone}`,
      profile.alternatePhone ? `*📞 ALT PHONE:* ${profile.alternatePhone}` : '',
      `--------------------------------`,
      `*📋 ORDER DISHES:*`,
      ...order.items.map(
        (item, idx) =>
          `${idx + 1}. *${item.name}*${item.variant ? ` (${item.variant})` : ''} x ${
            item.quantity
          } — Rs.${item.unitPrice * item.quantity}/-\n   _Prep: ${item.spiceLevel}${
            item.isJain ? ', Jain (No Onion/Garlic)' : ''
          }_`
      ),
      `--------------------------------`,
      `*🍲 KITCHEN PREFERENCES:*`,
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
      `• Cutlery: ${
        profile.preferences.includeCutleryAndNapkins
          ? 'Yes, please include'
          : 'Not needed'
      }`,
      customNote.trim() ? `• *Special Note:* ${customNote.trim()}` : '',
      `--------------------------------`,
      `*📍 DELIVERY ADDRESS:*`,
      order.deliveryAddress || order.addressSummary,
      isFreeDelivery
        ? `*🚚 Delivery Zone:* FREE HOME DELIVERY (Within 3 Km Radius)`
        : `*🚚 Delivery Zone:* Standard Delivery Zone (> 3 Km)`,
      `--------------------------------`,
      `*💰 BILL BREAKDOWN:*`,
      `• Dishes Subtotal: Rs.${order.subtotal}/-`,
      `• Delivery Fee: ${
        order.deliveryFee === 0
          ? 'FREE (Within 3 Km Free Delivery)'
          : `Rs.${order.deliveryFee}/-`
      }`,
      `*• GRAND TOTAL: Rs.${order.total}/-* (Confirmed & Paid)`,
      `• Payment Mode: ${order.paymentMethod}`,
      `--------------------------------`,
      `*⏱️ Estimated Delivery:* ${order.estimatedDeliveryMinutes || 35} Minutes`,
      `Thank you for ordering with The Turban Kitchen!`,
    ].filter(Boolean);

    return lines.join('\n');
  };

  const automaticallySendOrderOnWhatsApp = (
    order: OrderRecord,
    customNote: string = ''
  ) => {
    const formattedMessage = buildOrderWhatsAppText(order, customNote);
    const whatsappUrl = `https://wa.me/${
      RESTAURANT_INFO.whatsappNumberClean
    }?text=${encodeURIComponent(formattedMessage)}`;

    // Programmatically open WhatsApp in new tab / app
    try {
      const win = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      if (!win) {
        const link = document.createElement('a');
        link.href = whatsappUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e) {
      console.warn('Auto-open WhatsApp failed:', e);
    }

    // Open confirmation and dispatch modal with live ticket and direct WhatsApp button
    setConfirmedOrderForWhatsApp({
      order,
      whatsappUrl,
      formattedMessage,
    });
  };

  const buildOrderRepeatWhatsAppHref = (order: OrderRecord) => {
    const lines = [
      `*REPEAT ORDER (${order.id}) — THE TURBAN KITCHEN*`,
      `*Customer:* ${profile.fullName} (${profile.phone})`,
      `--------------------------------`,
      ...order.items.map(
        (item, i) =>
          `${i + 1}. *${item.name}*${
            item.variant ? ` (${item.variant})` : ''
          } x ${item.quantity} — Rs.${item.unitPrice * item.quantity}/- (${
            item.spiceLevel
          }${item.isJain ? ', Jain' : ''})`
      ),
      `--------------------------------`,
      `*Delivery Address:* ${order.addressSummary}`,
      `*Total Payable:* Rs.${order.total}/- (${order.paymentMethod})`,
    ];
    return `https://wa.me/${
      RESTAURANT_INFO.whatsappNumberClean
    }?text=${encodeURIComponent(lines.join('\n'))}`;
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: OrderRecord['status']
  ) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    showToast(`Order #${orderId} status updated to: ${newStatus}`);
    if (currentUser) {
      try {
        await setDoc(
          doc(db, 'orders', orderId),
          { status: newStatus, updatedAt: new Date().toISOString() },
          { merge: true }
        );
      } catch (err) {
        console.warn('Could not sync status update to Firestore:', err);
      }
    }
  };

  const filteredMenuItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (onlyJainFilter && !item.isJainAvailable) {
        return false;
      }
      if (onlyFavoritesFilter && !profile.favoriteItemIds.includes(item.id)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.replace('_', ' ').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [
    selectedCategory,
    onlyJainFilter,
    onlyFavoritesFilter,
    searchQuery,
    profile.favoriteItemIds,
  ]);

  return (
    <div className="min-h-screen bg-[#111215] text-neutral-100 flex flex-col">
      {/* STRICT 3-ZONE TOP BAR CONTRACT */}
      <header className="sticky top-0 z-30 bg-[#111215]/95 backdrop-blur border-b border-white/[0.08]">
        <div className="max-w-[1360px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('menu');
            }}
            className="font-display text-2xl font-bold tracking-tight text-amber-400 whitespace-nowrap shrink-0"
          >
            The Turban Kitchen
          </a>

          {/* Zone 2: 4 clean single-line text navigation links */}
          <nav
            aria-label="Dashboard Navigation"
            className="flex items-center gap-5 sm:gap-8 text-sm font-medium overflow-x-auto"
          >
            <button
              type="button"
              onClick={() => setActiveTab('menu')}
              className={`py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2 ${
                activeTab === 'menu'
                  ? 'text-amber-400 border-amber-400 font-semibold'
                  : 'text-neutral-400 border-transparent hover:text-neutral-100'
              }`}
            >
              Menu & Order
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pamphlet')}
              className={`py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2 ${
                activeTab === 'pamphlet'
                  ? 'text-amber-400 border-amber-400 font-semibold'
                  : 'text-neutral-400 border-transparent hover:text-neutral-100'
              }`}
            >
              Menu Pamphlet
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('booking')}
              className={`py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
                activeTab === 'booking'
                  ? 'text-amber-400 border-amber-400 font-semibold'
                  : 'text-neutral-400 border-transparent hover:text-neutral-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Table {bookings.length > 0 ? `(${bookings.length})` : ''}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2 ${
                activeTab === 'orders'
                  ? 'text-amber-400 border-amber-400 font-semibold'
                  : 'text-neutral-400 border-transparent hover:text-neutral-100'
              }`}
            >
              My Orders ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('profile_preferences')}
              className={`py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2 ${
                activeTab === 'profile_preferences'
                  ? 'text-amber-400 border-amber-400 font-semibold'
                  : 'text-neutral-400 border-transparent hover:text-neutral-100'
              }`}
            >
              Profile & Preferences
            </button>
          </nav>

          {/* Zone 3: Primary Actions (Auth + Cart Button) */}
          <div className="flex items-center gap-3 shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('profile_preferences')}
                  className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-900 border border-emerald-500/30 rounded-lg hover:border-emerald-400 transition-colors cursor-pointer"
                  title="Signed in to Firebase"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="truncate max-w-[110px]">
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer px-1 py-1"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-neutral-900 border border-amber-400/50 text-amber-400 rounded-lg hover:bg-amber-400 hover:text-neutral-950 transition-colors whitespace-nowrap cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Sign Up</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsCartDrawerOpen(true)}
              className="inline-flex items-center gap-2.5 px-4 py-2 text-xs font-semibold bg-amber-400 text-neutral-950 rounded-lg hover:bg-amber-300 transition-colors cursor-pointer whitespace-nowrap"
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span className="font-mono tabular-nums">
                {cartItemCount} {cartItemCount === 1 ? 'Item' : 'Items'} · ₹{cartSubtotal}/-
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Live Toast Feedback */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-neutral-900 border border-amber-400/50 text-neutral-100 text-xs font-medium shadow-xl">
          <Check className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastNotification}</span>
        </div>
      )}

      {/* MAIN VIEWPORT CONTAINER */}
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-6 py-8 space-y-10">
        {/* ==================== TAB 1: MENU & ORDER ==================== */}
        {activeTab === 'menu' && (
          <>
            {/* HERO SECTION */}
            <section className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#18191D]">
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Left Editorial Column */}
                <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    {/* Clean unboxed metadata with typographic separators */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-amber-400">
                      <span>{RESTAURANT_INFO.dietaryBadge}</span>
                      <span aria-hidden="true">·</span>
                      <span>{RESTAURANT_INFO.address}</span>
                      <span aria-hidden="true">·</span>
                      <span>{RESTAURANT_INFO.hours}</span>
                    </div>

                    <h1 className="font-display text-3xl sm:text-5xl font-bold text-neutral-100 tracking-tight leading-[1.12]">
                      {RESTAURANT_INFO.hindiMotto} — Authentic Punjabi Flavours
                    </h1>

                    <p className="text-sm sm:text-base text-neutral-300 max-w-2xl leading-relaxed">
                      Explore all 114 vegetarian delicacies across 12 classic categories — from overnight slow-simmered Dal Makhni, Tandoori Khazana chaaps, and Makke Di Roti Te Sarso Da Saag to crispy Indo-Chinese and steaming Momos.
                    </p>
                  </div>

                  {/* Active Profile Preferences Strip & Quick CTAs */}
                  <div className="pt-4 border-t border-white/[0.08] space-y-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                      <span>Ordering as <strong className="text-neutral-200">{profile.fullName}</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>Default Spice: <strong className="text-amber-400">{profile.preferences.defaultSpiceLevel}</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Dietary:{' '}
                        <strong className="text-emerald-400">
                          {profile.preferences.jainPreparationDefault
                            ? 'Jain (No Onion/Garlic)'
                            : 'Standard Pure Veg'}
                        </strong>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Free Home Delivery within {RESTAURANT_INFO.deliveryRadiusKm} Km
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <a
                        href="#menu-catalog"
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-amber-400 text-neutral-950 rounded-lg hover:bg-amber-300 transition-colors whitespace-nowrap"
                      >
                        <span>Browse Full Menu (114 Dishes)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => setActiveTab('booking')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 rounded-lg hover:from-amber-400 hover:to-amber-500 transition-colors cursor-pointer whitespace-nowrap shadow-sm shadow-amber-500/20"
                      >
                        <Calendar className="w-3.5 h-3.5 text-neutral-950" />
                        <span>Book a Table (Confirmed After Payment)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsWhatsAppModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-emerald-500 text-neutral-950 rounded-lg hover:bg-emerald-400 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Order on WhatsApp ({RESTAURANT_INFO.mobile})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('profile_preferences')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium bg-neutral-900 text-neutral-200 border border-white/[0.12] rounded-lg hover:border-amber-400 hover:text-amber-400 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Sliders className="w-3.5 h-3.5 text-amber-400" />
                        <span>Manage Profile & Account Preferences</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Hero Imagery with Scrim */}
                <div className="lg:col-span-5 relative min-h-[280px] lg:min-h-full bg-neutral-900 overflow-hidden">
                  {!heroImgError ? (
                    <img
                      src={heroFeastImg}
                      alt="Authentic Punjabi Vegetarian Feast with Dal Makhni, Shahi Paneer, and Garlic Naan"
                      referrerPolicy="no-referrer"
                      onError={() => setHeroImgError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-8 text-center bg-gradient-to-br from-amber-950/40 to-neutral-950">
                      <p className="font-display text-2xl text-amber-400">
                        The Turban Kitchen · Authentic Punjabi Thali
                      </p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6">
                    <p className="text-xs text-amber-400 font-medium">
                      Chef&apos;s Signature Pairing
                    </p>
                    <p className="font-display text-xl font-semibold text-white mt-0.5">
                      Dal Makhni · Shahi Paneer · Amritsari & Garlic Naan
                    </p>
                    <p className="text-xs font-mono tabular-nums text-neutral-300 mt-1">
                      Direct Kitchen Line: {RESTAURANT_INFO.mobile} · {RESTAURANT_INFO.landlines[0]}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* CULINARY SPOTLIGHT CARDS (2-Column Showcase) */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative rounded-xl overflow-hidden border border-white/[0.08] bg-[#18191D] flex flex-col sm:flex-row">
                <div className="sm:w-2/5 h-48 sm:h-auto bg-neutral-900 shrink-0">
                  {!tandooriImgError ? (
                    <img
                      src={tandooriPlatterImg}
                      alt="Tandoori Khazana Platter with Paneer Tikka and Malai Soya Chaap"
                      referrerPolicy="no-referrer"
                      onError={() => setTandooriImgError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-900 flex items-center justify-center p-4 text-xs text-amber-400">
                      Tandoori Khazana
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="text-xs text-neutral-400">
                      Tandoori Khazana · 9 Clay-Oven Specialties
                    </div>
                    <h2 className="font-display text-2xl font-semibold text-neutral-100 mt-1">
                      Smoky Paneer Tikka & Stuffed Soya Chaap
                    </h2>
                    <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                      Marinated in hung curd, cashew cream, or tangy Punjabi pickling spices and roasted over live charcoal.
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                    <span className="text-xs font-mono tabular-nums text-amber-400">
                      ₹120/- to ₹290/-
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('tandoori_khazana')}
                      className="text-xs font-semibold text-neutral-100 hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      Filter Tandoori Khazana &rarr;
                    </button>
                  </div>
                </div>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-white/[0.08] bg-[#18191D] flex flex-col sm:flex-row">
                <div className="sm:w-2/5 h-48 sm:h-auto bg-neutral-900 shrink-0">
                  {!chineseImgError ? (
                    <img
                      src={chineseMomosImg}
                      alt="Indo-Chinese Hakka Noodles, Honey Chilly Potato, and Tandoori Momos"
                      referrerPolicy="no-referrer"
                      onError={() => setChineseImgError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-900 flex items-center justify-center p-4 text-xs text-amber-400">
                      Chinese & Momos
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="text-xs text-neutral-400">
                      Wok Chinese & Momos · Authentic Flavours
                    </div>
                    <h2 className="font-display text-2xl font-semibold text-neutral-100 mt-1">
                      Hakka Noodles, Honey Chilly Potato & Gravy Momos
                    </h2>
                    <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                      High-flame street-style Chinese starters paired with Steam, Tandoori, and Paneer Gravy Momos.
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                    <span className="text-xs font-mono tabular-nums text-amber-400">
                      Momos from ₹110/-
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('chinese')}
                      className="text-xs font-semibold text-neutral-100 hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      Filter Chinese & Momos &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* COMPLETE MENU CATALOG & STICKY CART WORKSPACE */}
            <section id="menu-catalog" className="space-y-6">
              {/* Search & Dietary Filter Bar */}
              <div className="bg-[#18191D] border border-white/[0.08] rounded-xl p-4 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Search Input */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search 114 dishes (e.g. Dal Makhni, Paneer, Naan, Momos, Lassi)..."
                      className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-900 border border-white/[0.1] rounded-lg text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Interactive Filter Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setOnlyJainFilter((prev) => !prev)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                        onlyJainFilter
                          ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                          : 'bg-neutral-900 border-white/[0.08] text-neutral-300 hover:text-white'
                      }`}
                    >
                      {onlyJainFilter ? '✓ Jain Eligible Only' : 'Jain Eligible Only'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setOnlyFavoritesFilter((prev) => !prev)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                        onlyFavoritesFilter
                          ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                          : 'bg-neutral-900 border-white/[0.08] text-neutral-300 hover:text-white'
                      }`}
                    >
                      Saved Favorites ({profile.favoriteItemIds.length})
                    </button>

                    {(selectedCategory !== 'all' ||
                      searchQuery ||
                      onlyJainFilter ||
                      onlyFavoritesFilter) && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory('all');
                          setSearchQuery('');
                          setOnlyJainFilter(false);
                          setOnlyFavoritesFilter(false);
                        }}
                        className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white underline cursor-pointer whitespace-nowrap"
                      >
                        Reset Filters
                      </button>
                    )}
                  </div>
                </div>

                {/* 12 Category Interactive Segmented Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      selectedCategory === 'all'
                        ? 'bg-amber-400 text-neutral-950 font-semibold'
                        : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    All Categories ({MENU_ITEMS.length})
                  </button>
                  {MENU_CATEGORIES.map((cat) => {
                    const count = MENU_ITEMS.filter(
                      (i) => i.category === cat.id
                    ).length;
                    const active = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                          active
                            ? 'bg-amber-400 text-neutral-950 font-semibold'
                            : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
                        }`}
                      >
                        {cat.title} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main 2-Column Layout: Left Dish Catalog (8 cols) + Right Sticky Order Module (4 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Menu Categories & Dish Cards */}
                <div className="lg:col-span-8 space-y-8">
                  {filteredMenuItems.length === 0 ? (
                    <div className="bg-[#18191D] border border-white/[0.08] rounded-xl p-10 text-center space-y-3">
                      <p className="font-display text-2xl text-neutral-200">
                        No dishes match your active filters
                      </p>
                      <p className="text-xs text-neutral-400">
                        Try clearing your search query or switching to All Categories.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory('all');
                          setSearchQuery('');
                          setOnlyJainFilter(false);
                          setOnlyFavoritesFilter(false);
                        }}
                        className="px-4 py-2 text-xs font-semibold bg-amber-400 text-neutral-950 rounded-lg cursor-pointer"
                      >
                        Show All 114 Dishes
                      </button>
                    </div>
                  ) : (
                    MENU_CATEGORIES.map((category) => {
                      const itemsInCat = filteredMenuItems.filter(
                        (i) => i.category === category.id
                      );
                      if (itemsInCat.length === 0) return null;

                      return (
                        <div key={category.id} className="space-y-4">
                          <div className="flex items-baseline justify-between border-b border-white/[0.08] pb-2.5">
                            <div>
                              <h3 className="font-display text-2xl font-semibold text-neutral-100">
                                {category.title}
                              </h3>
                              <p className="text-xs text-neutral-400 mt-0.5">
                                {category.subtitle}
                              </p>
                            </div>
                            <span className="text-xs font-mono tabular-nums text-neutral-400">
                              {itemsInCat.length}{' '}
                              {itemsInCat.length === 1 ? 'dish' : 'dishes'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {itemsInCat.map((item) => {
                              const isFav = profile.favoriteItemIds.includes(
                                item.id
                              );
                              const showJainNote =
                                item.isJainAvailable &&
                                (profile.preferences.autoHighlightJainItems ||
                                  profile.preferences.jainPreparationDefault ||
                                  onlyJainFilter);

                              return (
                                <div
                                  key={item.id}
                                  className="bg-[#18191D] border border-white/[0.08] hover:border-white/[0.16] rounded-xl p-4 flex flex-col justify-between gap-4 transition-colors"
                                >
                                  <div className="space-y-1.5">
                                    {/* Quiet 1-line unboxed metadata */}
                                    <div className="flex items-center justify-between gap-2 text-xs text-neutral-400">
                                      <div className="flex items-center gap-1.5 truncate">
                                        <span>Pure Veg</span>
                                        {item.isSignature && (
                                          <>
                                            <span aria-hidden="true">·</span>
                                            <span className="text-amber-400 font-medium">
                                              House Specialty
                                            </span>
                                          </>
                                        )}
                                        {showJainNote && (
                                          <>
                                            <span aria-hidden="true">·</span>
                                            <span className="text-emerald-400">
                                              Jain Eligible
                                            </span>
                                          </>
                                        )}
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleToggleFavorite(item.id)
                                        }
                                        title={
                                          isFav
                                            ? 'Remove from Favorites'
                                            : 'Save to Favorites'
                                        }
                                        className="text-neutral-400 hover:text-amber-400 transition-colors cursor-pointer shrink-0"
                                      >
                                        <Heart
                                          className={`w-4 h-4 ${
                                            isFav
                                              ? 'fill-amber-400 text-amber-400'
                                              : ''
                                          }`}
                                        />
                                      </button>
                                    </div>

                                    <h4 className="text-base font-semibold text-neutral-100">
                                      {item.name}
                                    </h4>

                                    <p className="text-xs text-neutral-400 leading-relaxed">
                                      {item.description}
                                    </p>
                                  </div>

                                  {/* Price & Add Action Row */}
                                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                                    <span className="text-base font-mono tabular-nums font-semibold text-neutral-100">
                                      {item.priceLabel || `₹${item.price}/-`}
                                    </span>

                                    <button
                                      type="button"
                                      onClick={() => handleAddToCart(item)}
                                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-amber-400 text-neutral-950 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>Add</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Right Column: Contiguous Sticky Order & Delivery Summary */}
                <aside className="lg:col-span-4 lg:sticky lg:top-24 bg-[#18191D] border border-white/[0.08] rounded-xl p-5 space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                    <div>
                      <h3 className="font-display text-xl font-semibold text-neutral-100">
                        Your Table & Delivery Tray
                      </h3>
                      <p className="text-xs text-neutral-400">
                        Synced with your Profile & Account Preferences
                      </p>
                    </div>
                    <span className="font-mono tabular-nums text-xs text-amber-400 font-semibold">
                      {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  {/* 3 Km Free Delivery Status Banner */}
                  {profile.preferences.freeDeliveryThresholdReminder && (
                    <div className="p-3.5 rounded-lg bg-neutral-900 border border-white/[0.08] space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-300 font-medium flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-amber-400" />
                          <span>3 Km Free Home Delivery</span>
                        </span>
                        <span
                          className={`font-mono tabular-nums text-xs font-semibold px-2 py-0.5 rounded ${
                            isWithin3Km
                              ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
                              : 'text-amber-400 bg-amber-500/10 border border-amber-500/30'
                          }`}
                        >
                          {isWithin3Km ? 'FREE (0-3 KM)' : `+₹${RESTAURANT_INFO.standardDeliveryFee}/- (>3 KM)`}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400">
                        {isWithin3Km
                          ? `Your address (${activeAddress?.label || 'Selected Location'}, ${activeAddress?.distanceKm ?? 0} Km) qualifies for 100% Free Home Delivery!`
                          : `Your address (${activeAddress?.label || 'Selected Location'}, ${activeAddress?.distanceKm ?? 0} Km) is beyond 3 Km; standard ₹${RESTAURANT_INFO.standardDeliveryFee} delivery applies.`}
                      </p>
                    </div>
                  )}

                  {/* Cart Item List */}
                  {cart.length === 0 ? (
                    <div className="py-8 text-center space-y-2">
                      <p className="text-sm text-neutral-300">
                        Your tray is currently empty
                      </p>
                      <p className="text-xs text-neutral-500">
                        Click &ldquo;+ Add&rdquo; on any dish from the menu to start your order.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/[0.08] max-h-80 overflow-y-auto pr-1">
                      {cart.map((entry) => (
                        <div
                          key={entry.cartKey}
                          className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-neutral-100 truncate">
                              {entry.item.name}{' '}
                              {entry.item.halfPrice ? `(${entry.variant})` : ''}
                            </p>
                            <p className="text-[11px] text-neutral-400">
                              Spice: {entry.spiceLevel}
                              {entry.isJain ? ' · Jain (No Onion/Garlic)' : ''}
                            </p>
                            <p className="text-xs font-mono tabular-nums text-amber-400 mt-0.5">
                              ₹{entry.unitPrice * entry.quantity}/-
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 bg-neutral-900 border border-white/[0.1] rounded-lg px-1.5 py-1">
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateCartQuantity(entry.cartKey, -1)
                              }
                              className="p-1 text-neutral-400 hover:text-white cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-mono tabular-nums text-xs font-semibold px-1.5 text-neutral-100">
                              {entry.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateCartQuantity(entry.cartKey, 1)
                              }
                              className="p-1 text-neutral-400 hover:text-white cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Customer & Delivery Details (Name, Phone, Address) */}
                  <div className="pt-3 border-t border-white/[0.08] space-y-2 text-xs">
                    <div className="flex items-center justify-between pb-1 border-b border-white/[0.04]">
                      <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                        <span>Customer Delivery Details</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsEditingOrderDetails(!isEditingOrderDetails)}
                        className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{isEditingOrderDetails ? 'Done' : 'Edit'}</span>
                      </button>
                    </div>

                    {isEditingOrderDetails ? (
                      <div className="space-y-2 pt-1 text-xs">
                        <div>
                          <label className="text-[10px] text-neutral-400 block mb-0.5">Your Name</label>
                          <input
                            type="text"
                            value={orderCustomerName}
                            onChange={(e) => setOrderCustomerName(e.target.value)}
                            placeholder="Enter Name"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-white/[0.12] text-neutral-100 text-xs focus:outline-none focus:border-amber-400"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-neutral-400 block mb-0.5">Phone Number (WhatsApp)</label>
                          <input
                            type="tel"
                            value={orderCustomerPhone}
                            onChange={(e) => setOrderCustomerPhone(e.target.value)}
                            placeholder="e.g. +91 98779-32787"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-white/[0.12] text-neutral-100 text-xs focus:outline-none focus:border-amber-400"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-neutral-400 block mb-0.5">Delivery Address (Sri Anandpur Sahib)</label>
                          <textarea
                            rows={2}
                            value={orderCustomerAddress}
                            onChange={(e) => setOrderCustomerAddress(e.target.value)}
                            placeholder="House No., Street, Landmark"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-white/[0.12] text-neutral-100 text-xs focus:outline-none focus:border-amber-400 resize-none"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5 text-neutral-300">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-neutral-400">Name:</span>
                          <span className="font-medium text-neutral-100 truncate ml-2">{orderCustomerName}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-neutral-400">Phone:</span>
                          <span className="font-mono text-emerald-400 font-medium">{orderCustomerPhone}</span>
                        </div>
                        <div className="text-[11px] pt-1 border-t border-white/[0.04]">
                          <span className="text-neutral-400 block text-[10px] flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-400" />
                            Delivery Address:
                          </span>
                          <span className="text-neutral-200 line-clamp-2 leading-relaxed mt-0.5">
                            {orderCustomerAddress}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Active Delivery & Preferences Summary */}
                  <div className="pt-3 border-t border-white/[0.08] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Payment Mode:</span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('profile_preferences')}
                        className="text-neutral-200 hover:text-amber-400 underline cursor-pointer"
                      >
                        {profile.preferences.defaultPaymentMethod}
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Subtotal:</span>
                      <span className="font-mono tabular-nums text-neutral-200">
                        ₹{cartSubtotal}/-
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">
                        Delivery Fee (≤3 Km Free):
                      </span>
                      <span className="font-mono tabular-nums text-emerald-400">
                        {deliveryFee === 0 ? 'FREE (₹0/-)' : `₹${deliveryFee}/-`}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-sm font-semibold text-neutral-100">
                      <span>Total Payable</span>
                      <span className="font-mono tabular-nums text-base text-amber-400">
                        ₹{cartTotal}/-
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {/* Strict Policy Callout */}
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-amber-300 font-semibold block text-[11px] uppercase tracking-wide">
                          Order Confirmed After Payment &amp; Auto-Sent on WhatsApp
                        </strong>
                        <span className="text-neutral-300 text-[11px] leading-snug block">
                          Kitchen cooking begins immediately and full order details are automatically sent on WhatsApp ({RESTAURANT_INFO.mobile}) once payment is verified via UPI (9877932787@fam).
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={cart.length === 0}
                      onClick={() => {
                        setPaymentPurpose('order');
                        setIsPaymentModalOpen(true);
                      }}
                      className="w-full py-3 px-4 text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 rounded-lg disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shadow-md shadow-amber-500/20"
                    >
                      <ShieldCheck className="w-4 h-4 shrink-0 text-neutral-950" />
                      <span>Pay &amp; Confirm Order (9877932787@fam) · ₹{cartTotal}/-</span>
                    </button>

                    <button
                      type="button"
                      disabled={cart.length === 0}
                      onClick={() => setIsWhatsAppModalOpen(true)}
                      className="w-full py-2.5 px-4 text-xs font-semibold bg-emerald-500 text-neutral-950 rounded-lg hover:bg-emerald-400 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <MessageCircle className="w-4 h-4 shrink-0" />
                      <span>Order via WhatsApp ({RESTAURANT_INFO.mobile})</span>
                    </button>

                    <button
                      type="button"
                      disabled={cart.length === 0}
                      onClick={handlePlaceOrder}
                      className="w-full py-2 px-4 text-xs font-medium bg-neutral-900 border border-white/[0.12] hover:border-amber-400 text-neutral-300 hover:text-amber-400 rounded-lg disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer whitespace-nowrap text-center"
                    >
                      Pay on Delivery (Verify via UPI · ₹{cartTotal}/-)
                    </button>
                  </div>
                </aside>
              </div>
            </section>
          </>
        )}

        {/* ==================== TAB 2: INTERACTIVE MENU PAMPHLET ==================== */}
        {activeTab === 'pamphlet' && (
          <MenuPamphletView
            onAddToCart={handleAddToCart}
            jainHighlightEnabled={profile.preferences.autoHighlightJainItems}
          />
        )}

        {/* ==================== TAB: TABLE BOOKINGS (Confirmed After Payment) ==================== */}
        {activeTab === 'booking' && (
          <TableBookingView
            profile={profile}
            bookings={bookings}
            onInitiateBookingPayment={handleInitiateBookingPayment}
            onCancelBooking={handleCancelBooking}
          />
        )}

        {/* ==================== TAB 3: MY ORDERS & LIVE TRACKER ==================== */}
        {activeTab === 'orders' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-neutral-100">
                  My Orders & Live Sri Anandpur Sahib Delivery Tracker
                </h2>
                <p className="text-sm text-neutral-400 mt-1">
                  Track active kitchen orders or reorder past family meals in one click.
                </p>
              </div>
              <div className="flex items-center gap-3 self-start">
                {orders.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setOrders([]);
                      showToast('All orders cleared to zero.');
                    }}
                    className="px-3.5 py-2 text-xs font-medium text-neutral-300 hover:text-red-400 bg-neutral-900 border border-white/[0.1] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Clear All Orders (0)
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveTab('menu')}
                  className="px-4 py-2 text-xs font-semibold bg-amber-400 text-neutral-950 rounded-lg hover:bg-amber-300 transition-colors cursor-pointer whitespace-nowrap"
                >
                  + Start New Order
                </button>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="bg-[#18191D] border border-white/[0.08] rounded-xl p-12 text-center space-y-4">
                <p className="font-display text-2xl font-semibold text-neutral-100">
                  No Active or Past Orders (0 Orders)
                </p>
                <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                  Your order history and cart are currently at zero. Browse our 114 pure vegetarian dishes and place a fresh order via WhatsApp or direct checkout.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('menu')}
                  className="px-5 py-2.5 text-xs font-semibold bg-amber-400 text-neutral-950 rounded-lg hover:bg-amber-300 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Browse Menu & Add Dishes
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <OrderStatusCard
                    key={order.id}
                    order={order}
                    onUpdateStatus={handleUpdateOrderStatus}
                    buildRepeatWhatsAppHref={buildOrderRepeatWhatsAppHref}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ==================== TAB 4: DEDICATED PROFILE & PREFERENCES TAB ==================== */}
        {activeTab === 'profile_preferences' && (
          <ProfilePreferencesTab
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onResetProfile={() => setProfile(INITIAL_USER_PROFILE)}
            onAddToCart={(item) => handleAddToCart(item)}
            currentUser={currentUser}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onSignOut={handleSignOut}
          />
        )}
      </main>

      {/* SLIDE-OVER CART DRAWER */}
      {isCartDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#18191D] border-l border-white/[0.1] h-full flex flex-col justify-between p-6">
            <div className="space-y-4 overflow-y-auto pr-1">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div>
                  <h3 className="font-display text-2xl font-semibold text-neutral-100">
                    Your Order Tray
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {RESTAURANT_INFO.name} · {RESTAURANT_INFO.address}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="p-2 text-neutral-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <p className="text-sm text-neutral-300">Your cart is empty.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCartDrawerOpen(false);
                      setActiveTab('menu');
                    }}
                    className="px-4 py-2 text-xs font-semibold bg-amber-400 text-neutral-950 rounded-lg cursor-pointer"
                  >
                    Browse 114 Menu Items
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.08]">
                  {cart.map((entry) => (
                    <div
                      key={entry.cartKey}
                      className="py-3.5 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-100 truncate">
                          {entry.item.name}{' '}
                          {entry.item.halfPrice ? `(${entry.variant})` : ''}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {entry.spiceLevel}
                          {entry.isJain ? ' · Jain' : ''} · ₹{entry.unitPrice}/- each
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateCartQuantity(entry.cartKey, -1)
                          }
                          className="p-1 bg-neutral-900 border border-white/[0.1] rounded text-neutral-300 hover:text-white cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono tabular-nums text-xs w-5 text-center">
                          {entry.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateCartQuantity(entry.cartKey, 1)
                          }
                          className="p-1 bg-neutral-900 border border-white/[0.1] rounded text-neutral-300 hover:text-white cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="pt-4 border-t border-white/[0.08] space-y-4">
                {/* Customer & Delivery Details in Drawer */}
                <div className="p-3 rounded-xl bg-neutral-900/90 border border-white/[0.08] space-y-2 text-xs">
                  <div className="flex items-center justify-between pb-1 border-b border-white/[0.04]">
                    <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                      <span>Delivery Details</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingOrderDetails(!isEditingOrderDetails)}
                      className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{isEditingOrderDetails ? 'Done' : 'Edit'}</span>
                    </button>
                  </div>

                  {isEditingOrderDetails ? (
                    <div className="space-y-2 pt-1 text-xs">
                      <div>
                        <label className="text-[10px] text-neutral-400 block mb-0.5">Your Name</label>
                        <input
                          type="text"
                          value={orderCustomerName}
                          onChange={(e) => setOrderCustomerName(e.target.value)}
                          placeholder="Enter Name"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-white/[0.12] text-neutral-100 text-xs focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-neutral-400 block mb-0.5">Phone Number (WhatsApp)</label>
                        <input
                          type="tel"
                          value={orderCustomerPhone}
                          onChange={(e) => setOrderCustomerPhone(e.target.value)}
                          placeholder="e.g. +91 98779-32787"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-white/[0.12] text-neutral-100 text-xs focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-neutral-400 block mb-0.5">Delivery Address</label>
                        <textarea
                          rows={2}
                          value={orderCustomerAddress}
                          onChange={(e) => setOrderCustomerAddress(e.target.value)}
                          placeholder="House No., Street, Landmark"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-white/[0.12] text-neutral-100 text-xs focus:outline-none focus:border-amber-400 resize-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 text-neutral-300">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-neutral-400">Name:</span>
                        <span className="font-medium text-neutral-100 truncate ml-2">{orderCustomerName}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-neutral-400">Phone:</span>
                        <span className="font-mono text-emerald-400 font-medium">{orderCustomerPhone}</span>
                      </div>
                      <div className="text-[11px] pt-1 border-t border-white/[0.04]">
                        <span className="text-neutral-400 block text-[10px] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-400" />
                          Delivery Address:
                        </span>
                        <span className="text-neutral-200 line-clamp-2 leading-relaxed mt-0.5">
                          {orderCustomerAddress}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-neutral-400">
                    <span>Subtotal</span>
                    <span className="font-mono tabular-nums text-neutral-200">
                      ₹{cartSubtotal}/-
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Delivery ({activeAddress?.distanceKm} Km)</span>
                    <span className="font-mono tabular-nums text-emerald-400">
                      {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}/-`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-neutral-100 pt-2 border-t border-white/[0.08]">
                    <span>Total Amount</span>
                    <span className="font-mono tabular-nums text-amber-400">
                      ₹{cartTotal}/-
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-200 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-300 font-semibold block uppercase tracking-wide">
                        Order Confirmed After Payment &amp; Auto-Sent on WhatsApp
                      </strong>
                      <span className="text-neutral-300 text-[10px]">
                        Dishes are cooked fresh and details are automatically sent to WhatsApp ({RESTAURANT_INFO.mobile}) upon payment verification.
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentPurpose('order');
                      setIsCartDrawerOpen(false);
                      setIsPaymentModalOpen(true);
                    }}
                    className="w-full py-2.5 px-4 text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shadow-md shadow-amber-500/20"
                  >
                    <ShieldCheck className="w-4 h-4 shrink-0 text-neutral-950" />
                    <span>Pay &amp; Confirm Order (9877932787@fam) · ₹{cartTotal}/-</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCartDrawerOpen(false);
                      setIsWhatsAppModalOpen(true);
                    }}
                    className="w-full py-2.5 px-4 text-xs font-semibold bg-emerald-500 text-neutral-950 rounded-lg hover:bg-emerald-400 transition-colors cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <MessageCircle className="w-4 h-4 shrink-0" />
                    <span>Order on WhatsApp ({RESTAURANT_INFO.mobile})</span>
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCart([])}
                      className="px-3 py-2.5 text-xs text-neutral-400 hover:text-red-400 border border-white/[0.1] rounded-lg cursor-pointer"
                      title="Clear Tray"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handlePlaceOrder}
                      className="flex-1 py-2.5 px-4 text-xs font-semibold bg-neutral-900 border border-white/[0.12] hover:border-amber-400 text-neutral-300 hover:text-amber-400 rounded-lg transition-colors cursor-pointer whitespace-nowrap text-center"
                    >
                      Pay on Delivery (Verify via UPI)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ORDER CONFIRMED & AUTOMATIC WHATSAPP DISPATCH MODAL */}
      <OrderConfirmedWhatsAppModal
        isOpen={Boolean(confirmedOrderForWhatsApp)}
        onClose={() => setConfirmedOrderForWhatsApp(null)}
        order={confirmedOrderForWhatsApp?.order || null}
        whatsappUrl={confirmedOrderForWhatsApp?.whatsappUrl || ''}
        formattedMessage={confirmedOrderForWhatsApp?.formattedMessage || ''}
        onTrackOrder={() => {
          setConfirmedOrderForWhatsApp(null);
          setActiveTab('orders');
        }}
      />

      {/* WHATSAPP ORDER PREVIEW & DISPATCH MODAL */}
      <WhatsAppOrderModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        cart={cart}
        profile={profile}
        activeAddress={activeAddress}
        customerName={orderCustomerName}
        customerPhone={orderCustomerPhone}
        customerAddress={orderCustomerAddress}
        subtotal={cartSubtotal}
        deliveryFee={deliveryFee}
        total={cartTotal}
        onConfirmWhatsAppOrder={handleConfirmWhatsAppOrder}
      />

      {/* DIRECT UPI 9877932787@fam PAYMENT MODAL */}
      <UPIPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setBookingDraft(null);
        }}
        amount={
          paymentPurpose === 'booking'
            ? bookingDraft?.advanceAmount || 199
            : cartTotal
        }
        customerName={
          paymentPurpose === 'booking'
            ? bookingDraft?.customerName || orderCustomerName
            : orderCustomerName
        }
        customerPhone={
          paymentPurpose === 'booking'
            ? bookingDraft?.phone || orderCustomerPhone
            : orderCustomerPhone
        }
        customerAddress={orderCustomerAddress}
        customerEmail={
          paymentPurpose === 'booking'
            ? bookingDraft?.email || profile.email
            : profile.email
        }
        paymentPurpose={paymentPurpose}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* FIREBASE AUTHENTICATION (SIGN IN & SIGN UP) MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(name) => {
          showToast(`Signed in successfully${name ? `, ${name}` : ''}!`);
        }}
      />

      {/* QUIET EDITORIAL FOOTER */}
      <footer className="border-t border-white/[0.08] bg-[#0D0E11] mt-16">
        <div className="max-w-[1360px] mx-auto px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-neutral-400">
          <div className="space-y-1">
            <p className="text-neutral-200 font-semibold">
              {RESTAURANT_INFO.name} — {RESTAURANT_INFO.dietaryBadge}
            </p>
            <p className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                {RESTAURANT_INFO.address}
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                {RESTAURANT_INFO.mobile}, {RESTAURANT_INFO.landlines.join(', ')}
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {RESTAURANT_INFO.hours}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('pamphlet')}
              className="hover:text-neutral-200 transition-colors cursor-pointer"
            >
              Menu Pamphlet
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setActiveTab('profile_preferences')}
              className="hover:text-neutral-200 transition-colors cursor-pointer"
            >
              Profile Settings & Manual
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
