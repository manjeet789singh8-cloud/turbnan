import React, { useState } from 'react';
import {
  User as UserIcon,
  MapPin,
  Sliders,
  Bell,
  BookOpen,
  Plus,
  Trash2,
  Check,
  Download,
  RotateCcw,
  Heart,
  ShieldCheck,
  LogIn,
  LogOut,
} from 'lucide-react';
import {
  UserProfileSettings,
  DeliveryAddress,
  MENU_ITEMS,
  MenuItem,
  RESTAURANT_INFO,
} from '../data/menuData';
import customerAvatarImg from '../assets/images/avatar_customer_profile_1790853364176.jpg';
import { UPIPaymentModal } from './UPIPaymentModal';
import { User } from '../firebase';

interface ProfilePreferencesTabProps {
  profile: UserProfileSettings;
  onUpdateProfile: (updated: UserProfileSettings) => void;
  onResetProfile: () => void;
  onAddToCart: (item: MenuItem) => void;
  currentUser?: User | null;
  onOpenAuthModal?: () => void;
  onSignOut?: () => void;
}

type SettingsSectionId =
  | 'profile'
  | 'addresses'
  | 'dietary'
  | 'notifications_billing'
  | 'manual';

export const ProfilePreferencesTab: React.FC<ProfilePreferencesTabProps> = ({
  profile,
  onUpdateProfile,
  onResetProfile,
  onAddToCart,
  currentUser,
  onOpenAuthModal,
  onSignOut,
}) => {
  const [activeSection, setActiveSection] = useState<SettingsSectionId>('profile');
  const [saveBanner, setSaveBanner] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);

  // Local form state for Personal Profile
  const [fullName, setFullName] = useState(profile.fullName);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [alternatePhone, setAlternatePhone] = useState(profile.alternatePhone);
  const [preferredLanguage, setPreferredLanguage] = useState(profile.preferredLanguage);
  const [birthdayMonth, setBirthdayMonth] = useState(profile.birthdayMonth);
  const [gstNumber, setGstNumber] = useState(profile.gstNumber);

  // New Address Form State
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddressLabel, setNewAddressLabel] = useState('');
  const [newAddressStreet, setNewAddressStreet] = useState('');
  const [newAddressLandmark, setNewAddressLandmark] = useState('');
  const [newAddressDistance, setNewAddressDistance] = useState('1.2');
  const [newAddressInstructions, setNewAddressInstructions] = useState('');

  // UPI test modal state
  const [isTestUpiOpen, setIsTestUpiOpen] = useState(false);

  // Manual search / filter state
  const [manualSearchQuery, setManualSearchQuery] = useState('');

  const triggerSaveFeedback = (message: string) => {
    setSaveBanner(message);
    window.setTimeout(() => {
      setSaveBanner((prev) => (prev === message ? null : prev));
    }, 3200);
  };

  const handleSavePersonalProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      fullName: fullName.trim() || profile.fullName,
      email: email.trim() || profile.email,
      phone: phone.trim() || profile.phone,
      alternatePhone: alternatePhone.trim(),
      preferredLanguage,
      birthdayMonth,
      gstNumber: gstNumber.trim().toUpperCase(),
    });
    triggerSaveFeedback('Personal profile details saved and synced across your dashboard.');
  };

  const handleSetDefaultAddress = (addressId: string) => {
    const updatedAddresses = profile.addresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === addressId,
    }));
    onUpdateProfile({
      ...profile,
      addresses: updatedAddresses,
    });
    triggerSaveFeedback('Default Sri Anandpur Sahib delivery address updated.');
  };

  const handleDeleteAddress = (addressId: string) => {
    if (profile.addresses.length <= 1) {
      triggerSaveFeedback('At least one delivery address must remain on your account.');
      return;
    }
    const filtered = profile.addresses.filter((a) => a.id !== addressId);
    if (!filtered.some((a) => a.isDefault) && filtered.length > 0) {
      filtered[0].isDefault = true;
    }
    onUpdateProfile({
      ...profile,
      addresses: filtered,
    });
    triggerSaveFeedback('Delivery address removed from your account.');
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressLabel.trim() || !newAddressStreet.trim()) return;

    const parsedDistance = Math.max(0.1, Math.min(10, parseFloat(newAddressDistance) || 1.5));
    const newAddr: DeliveryAddress = {
      id: `addr-${Date.now()}`,
      label: newAddressLabel.trim(),
      recipientName: profile.fullName,
      phone: profile.phone,
      streetLine: newAddressStreet.trim(),
      landmark: newAddressLandmark.trim() || 'Near Bus Stand, Sri Anandpur Sahib',
      city: 'Sri Anandpur Sahib, Punjab',
      postalCode: '140118',
      distanceKm: Number(parsedDistance.toFixed(1)),
      isDefault: false,
      deliveryInstructions: newAddressInstructions.trim() || 'Call upon arrival.',
    };

    onUpdateProfile({
      ...profile,
      addresses: [...profile.addresses, newAddr],
    });
    setNewAddressLabel('');
    setNewAddressStreet('');
    setNewAddressLandmark('');
    setNewAddressDistance('1.2');
    setNewAddressInstructions('');
    setShowNewAddressForm(false);
    triggerSaveFeedback(`Added "${newAddr.label}" (${newAddr.distanceKm} Km from Bus Stand outlet).`);
  };

  const updatePreference = <K extends keyof UserProfileSettings['preferences']>(
    key: K,
    value: UserProfileSettings['preferences'][K]
  ) => {
    onUpdateProfile({
      ...profile,
      preferences: {
        ...profile.preferences,
        [key]: value,
      },
    });
    triggerSaveFeedback('Account dining and order preference updated.');
  };

  const updateNotification = (
    key: keyof UserProfileSettings['preferences']['notifications'],
    value: boolean
  ) => {
    onUpdateProfile({
      ...profile,
      preferences: {
        ...profile.preferences,
        notifications: {
          ...profile.preferences.notifications,
          [key]: value,
        },
      },
    });
    triggerSaveFeedback('Notification channel preference updated.');
  };

  const toggleFavoriteDish = (itemId: string) => {
    const exists = profile.favoriteItemIds.includes(itemId);
    const updatedFavs = exists
      ? profile.favoriteItemIds.filter((id) => id !== itemId)
      : [...profile.favoriteItemIds, itemId];
    onUpdateProfile({
      ...profile,
      favoriteItemIds: updatedFavs,
    });
    triggerSaveFeedback(
      exists ? 'Dish removed from saved favorites.' : 'Dish added to saved favorites.'
    );
  };

  const handleExportProfileJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'turban-kitchen-profile-preferences.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerSaveFeedback('Exported profile settings and account preferences as JSON.');
  };

  const favoriteItems = MENU_ITEMS.filter((item) =>
    profile.favoriteItemIds.includes(item.id)
  );

  const manualTopics = [
    {
      step: '01. Managing Personal Profile & Contact Info',
      category: 'Profile Settings',
      summary:
        'How to update your primary mobile number, recipient name, language preference, and GST billing details.',
      instructions: [
        'Navigate to Profile & Preferences -> Personal Profile in the left sidebar.',
        'Update your Full Name and Primary Mobile Number (+91). Our Sri Anandpur Sahib kitchen uses this number for rider coordination and order verification.',
        'Select your Preferred Language (English, Punjabi Gurmukhi, or Hindi) and optional GSTIN if you require business tax invoices.',
        'Click "Save Profile Changes" to immediately apply your contact details to all future orders.',
      ],
    },
    {
      step: '02. Configuring 3 Km Free Home Delivery Addresses',
      category: 'Delivery & Locations',
      summary:
        'Understanding the 3 Km Free Home Delivery radius from Near Bus Stand, Sri Anandpur Sahib.',
      instructions: [
        'Open the "Delivery Addresses (3 Km Zone)" section to view all saved locations in Sri Anandpur Sahib.',
        'Addresses within 3.0 Km of our Bus Stand outlet automatically qualify for 100% Free Home Delivery on all orders.',
        'Click "Set as Default" on any saved address to make it your active delivery destination in the checkout drawer.',
        'Add specific rider instructions (such as landmark gates near Keshgarh Sahib or Virasat-e-Khalsa) so deliveries arrive hot between 7:30 AM and 11:30 PM.',
      ],
    },
    {
      step: '03. Dietary Defaults: Jain Preparation & Spice Levels',
      category: 'Dietary & Taste',
      summary:
        'Automatically pre-selecting Mild, Medium, or Punjabi Spicy heat levels and strict no-onion/no-garlic Jain preparation.',
      instructions: [
        'Go to "Dietary & Taste Defaults" to set your kitchen preparation rules once instead of re-entering them on every order.',
        'Choose between Mild, Medium, or Authentic Punjabi Spicy. Every dish added to your cart inherits this default spice level automatically.',
        'Enable "Default to Jain Preparation (No Onion / No Garlic)" and "Highlight Jain-Friendly Dishes on Menu" to visually mark eligible items across all 12 categories.',
        'Toggle "Low Oil / Less White Butter" or "Avoid Cashew / Nut Gravies" if you have specific nutritional or allergen requirements.',
      ],
    },
    {
      step: '04. Direct UPI (9877932787@fam), Payment Defaults & Quick Reorders',
      category: 'Account Preferences',
      summary:
        'Controlling instant direct UPI payments (9877932787@fam), WhatsApp/SMS kitchen updates, and 1-click favorite dishes.',
      instructions: [
        'Under "Notifications & Billing", choose your default payment mode: "UPI (9877932787@fam)" for instant online payment, or Cash/UPI on Delivery.',
        'When paying via UPI, the official payment handle is "9877932787@fam". You can scan the QR code or pay directly from Google Pay, PhonePe, Paytm, or FamPay.',
        'Use the "Launch UPI Payment Tester" tool in settings to preview the full UPI QR scan and instant confirmation flow.',
        'Toggle live WhatsApp, SMS, or Email receipts for kitchen preparation and rider dispatch updates.',
        'Curate your Favorite Dishes list so you can reorder staples like Dal Makhni, Shahi Paneer, or Garlic Naan in a single click.',
      ],
    },
  ];

  const filteredManualTopics = manualTopics.filter(
    (topic) =>
      topic.step.toLowerCase().includes(manualSearchQuery.toLowerCase()) ||
      topic.summary.toLowerCase().includes(manualSearchQuery.toLowerCase()) ||
      topic.instructions.some((inst) =>
        inst.toLowerCase().includes(manualSearchQuery.toLowerCase())
      )
  );

  const defaultAddress =
    profile.addresses.find((a) => a.isDefault) || profile.addresses[0];

  return (
    <div className="space-y-8">
      {/* Top Profile Summary Bar */}
      <div className="bg-[#18191D] border border-white/[0.08] rounded-xl p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border border-amber-400/40 bg-neutral-800 shrink-0 flex items-center justify-center">
            {!avatarError ? (
              <img
                src={customerAvatarImg}
                alt={`${profile.fullName} profile avatar`}
                referrerPolicy="no-referrer"
                onError={() => setAvatarError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-display text-2xl font-bold text-amber-400">
                {profile.fullName.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-neutral-100">
              {profile.fullName}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 mt-1">
              <span className="font-mono tabular-nums">{profile.phone}</span>
              <span aria-hidden="true">·</span>
              <span>{profile.email}</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-400">
                Default Spice: {profile.preferences.defaultSpiceLevel}
              </span>
              {profile.preferences.jainPreparationDefault && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-400">Jain Preparation Active</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2 bg-neutral-900 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-neutral-300 truncate max-w-[150px]">
                {currentUser.displayName || currentUser.email}
              </span>
              <button
                type="button"
                onClick={onSignOut}
                className="ml-1 text-neutral-400 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
                title="Sign Out of Firebase"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-amber-400 text-neutral-950 rounded-lg hover:bg-amber-300 transition-colors cursor-pointer whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Sign Up with Firebase</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportProfileJson}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-neutral-200 bg-neutral-900 border border-white/[0.1] rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export JSON</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onResetProfile();
              setFullName('Manjeet Singh');
              setEmail('manjeet789singh8@gmail.com');
              setPhone('+91 98765-43210');
              setAlternatePhone('+91 73790-97909');
              setPreferredLanguage('English');
              setBirthdayMonth('October');
              setGstNumber('');
              triggerSaveFeedback('Profile settings & account preferences restored to defaults.');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-neutral-300 bg-neutral-900 border border-white/[0.1] rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Live Confirmation Toast Banner */}
      {saveBanner && (
        <div
          role="status"
          className="flex items-center justify-between px-4 py-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-sm"
        >
          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveBanner(null)}
            className="text-xs text-emerald-300 hover:text-white underline cursor-pointer ml-4 whitespace-nowrap"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main 2-Column Workspace: Left Sub-Nav (260px) + Right Content Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3 bg-[#18191D] border border-white/[0.08] rounded-xl p-3 space-y-1">
          <button
            type="button"
            onClick={() => setActiveSection('profile')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left cursor-pointer whitespace-nowrap ${
              activeSection === 'profile'
                ? 'bg-amber-400 text-neutral-950 font-semibold'
                : 'text-neutral-300 hover:bg-white/[0.04] hover:text-white'
            }`}
          >
            <UserIcon className="w-4 h-4 shrink-0" />
            <span className="truncate">Personal Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('addresses')}
            className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left cursor-pointer whitespace-nowrap ${
              activeSection === 'addresses'
                ? 'bg-amber-400 text-neutral-950 font-semibold'
                : 'text-neutral-300 hover:bg-white/[0.04] hover:text-white'
            }`}
          >
            <span className="flex items-center gap-3 truncate">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="truncate">Delivery Addresses</span>
            </span>
            <span className="font-mono tabular-nums text-xs opacity-80">
              {profile.addresses.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('dietary')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left cursor-pointer whitespace-nowrap ${
              activeSection === 'dietary'
                ? 'bg-amber-400 text-neutral-950 font-semibold'
                : 'text-neutral-300 hover:bg-white/[0.04] hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4 shrink-0" />
            <span className="truncate">Dietary & Taste Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('notifications_billing')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left cursor-pointer whitespace-nowrap ${
              activeSection === 'notifications_billing'
                ? 'bg-amber-400 text-neutral-950 font-semibold'
                : 'text-neutral-300 hover:bg-white/[0.04] hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4 shrink-0" />
            <span className="truncate">Notifications & Billing</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('manual')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left cursor-pointer whitespace-nowrap ${
              activeSection === 'manual'
                ? 'bg-amber-400 text-neutral-950 font-semibold'
                : 'text-neutral-300 hover:bg-white/[0.04] hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span className="truncate">Settings User Manual</span>
          </button>

          {/* Active Delivery Status Summary in Sidebar */}
          <div className="pt-4 mt-4 border-t border-white/[0.08] px-3.5 pb-2 space-y-2">
            <p className="text-xs font-medium text-neutral-400">
              Active Delivery Destination
            </p>
            {defaultAddress && (
              <div className="text-xs text-neutral-300 space-y-1">
                <p className="font-semibold text-neutral-100">{defaultAddress.label}</p>
                <p className="text-neutral-400 leading-relaxed">
                  {defaultAddress.streetLine}
                </p>
                <p className="font-mono tabular-nums text-emerald-400 pt-1">
                  {defaultAddress.distanceKm} Km ·{' '}
                  {defaultAddress.distanceKm <= RESTAURANT_INFO.deliveryRadiusKm
                    ? 'Within 3 Km Free Zone'
                    : 'Outside 3 Km Zone'}
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* Right Content Area */}
        <div className="lg:col-span-9 bg-[#18191D] border border-white/[0.08] rounded-xl p-6 sm:p-8">
          {/* SECTION 1: PERSONAL PROFILE */}
          {activeSection === 'profile' && (
            <form onSubmit={handleSavePersonalProfile} className="space-y-8">
              <div className="pb-5 border-b border-white/[0.08]">
                <h3 className="font-display text-2xl font-semibold text-neutral-100">
                  Personal Profile & Contact Details
                </h3>
                <p className="text-sm text-neutral-400 mt-1">
                  Manage your primary identity, contact numbers for Sri Anandpur Sahib delivery coordination, and regional language settings.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    htmlFor="profile-fullname"
                    className="block text-xs font-medium text-neutral-300"
                  >
                    Full Name
                  </label>
                  <input
                    id="profile-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-sm bg-neutral-900 border border-white/[0.1] rounded-lg text-neutral-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="profile-email"
                    className="block text-xs font-medium text-neutral-300"
                  >
                    Email Address (For Digital Receipts)
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-sm bg-neutral-900 border border-white/[0.1] rounded-lg text-neutral-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="profile-phone"
                    className="block text-xs font-medium text-neutral-300"
                  >
                    Primary Mobile Number (WhatsApp & Rider Calls)
                  </label>
                  <input
                    id="profile-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums bg-neutral-900 border border-white/[0.1] rounded-lg text-neutral-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="profile-alt-phone"
                    className="block text-xs font-medium text-neutral-300"
                  >
                    Alternate / Landline Number
                  </label>
                  <input
                    id="profile-alt-phone"
                    type="tel"
                    value={alternatePhone}
                    onChange={(e) => setAlternatePhone(e.target.value)}
                    placeholder="e.g. 01887-260810"
                    className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums bg-neutral-900 border border-white/[0.1] rounded-lg text-neutral-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="profile-language"
                    className="block text-xs font-medium text-neutral-300"
                  >
                    Preferred Communication Language
                  </label>
                  <select
                    id="profile-language"
                    value={preferredLanguage}
                    onChange={(e) =>
                      setPreferredLanguage(
                        e.target.value as UserProfileSettings['preferredLanguage']
                      )
                    }
                    className="w-full px-3.5 py-2.5 text-sm bg-neutral-900 border border-white/[0.1] rounded-lg text-neutral-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="English">English</option>
                    <option value="Punjabi (Gurmukhi)">Punjabi (Gurmukhi)</option>
                    <option value="Hindi">Hindi (हिन्दी)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="profile-birthday"
                    className="block text-xs font-medium text-neutral-300"
                  >
                    Family Celebration / Birthday Month (Complimentary Dessert Offer)
                  </label>
                  <select
                    id="profile-birthday"
                    value={birthdayMonth}
                    onChange={(e) => setBirthdayMonth(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-neutral-900 border border-white/[0.1] rounded-lg text-neutral-100 focus:outline-none focus:border-amber-400"
                  >
                    {[
                      'January',
                      'February',
                      'March',
                      'April',
                      'May',
                      'June',
                      'July',
                      'August',
                      'September',
                      'October',
                      'November',
                      'December',
                    ].map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label
                    htmlFor="profile-gst"
                    className="block text-xs font-medium text-neutral-300"
                  >
                    Optional Business GSTIN (For Corporate / Event Catering Invoices)
                  </label>
                  <input
                    id="profile-gst"
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder="e.g. 03AABCT1234D1Z5"
                    className="w-full px-3.5 py-2.5 text-sm font-mono uppercase bg-neutral-900 border border-white/[0.1] rounded-lg text-neutral-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                <p className="text-xs text-neutral-400">
                  Changes apply immediately to active carts and future home deliveries.
                </p>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold bg-amber-400 text-neutral-950 rounded-lg hover:bg-amber-300 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          )}

          {/* SECTION 2: DELIVERY ADDRESSES (3 KM ZONE) */}
          {activeSection === 'addresses' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-white/[0.08]">
                <div>
                  <h3 className="font-display text-2xl font-semibold text-neutral-100">
                    Saved Delivery Addresses (Sri Anandpur Sahib)
                  </h3>
                  <p className="text-sm text-neutral-400 mt-1">
                    Free Home Delivery on all orders within 3.0 Km of Near Bus Stand outlet.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewAddressForm((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-amber-400 text-neutral-950 rounded-lg hover:bg-amber-300 transition-colors cursor-pointer whitespace-nowrap self-start"
                >
                  <Plus className="w-4 h-4" />
                  <span>{showNewAddressForm ? 'Cancel New Address' : 'Add New Address'}</span>
                </button>
              </div>

              {showNewAddressForm && (
                <form
                  onSubmit={handleAddAddress}
                  className="p-5 bg-neutral-900/90 border border-amber-400/30 rounded-xl space-y-4"
                >
                  <h4 className="text-sm font-semibold text-amber-400">
                    Add New Sri Anandpur Sahib Delivery Location
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs text-neutral-300">
                        Address Label (e.g. Home, Shop, Guest House)
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddressLabel}
                        onChange={(e) => setNewAddressLabel(e.target.value)}
                        placeholder="e.g. Shop — Main Bazaar"
                        className="w-full px-3 py-2 text-sm bg-neutral-950 border border-white/[0.1] rounded-lg text-neutral-100"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs text-neutral-300">
                        Estimated Distance from Bus Stand Outlet (Km)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="10"
                        required
                        value={newAddressDistance}
                        onChange={(e) => setNewAddressDistance(e.target.value)}
                        className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-neutral-950 border border-white/[0.1] rounded-lg text-neutral-100"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="block text-xs text-neutral-300">
                        Complete Street Address / House or SCO Number
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddressStreet}
                        onChange={(e) => setNewAddressStreet(e.target.value)}
                        placeholder="House/SCO No., Street, Locality, Sri Anandpur Sahib"
                        className="w-full px-3 py-2 text-sm bg-neutral-950 border border-white/[0.1] rounded-lg text-neutral-100"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs text-neutral-300">
                        Nearby Landmark
                      </label>
                      <input
                        type="text"
                        value={newAddressLandmark}
                        onChange={(e) => setNewAddressLandmark(e.target.value)}
                        placeholder="e.g. Near Civil Hospital / Bus Stand"
                        className="w-full px-3 py-2 text-sm bg-neutral-950 border border-white/[0.1] rounded-lg text-neutral-100"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs text-neutral-300">
                        Delivery Rider Instructions
                      </label>
                      <input
                        type="text"
                        value={newAddressInstructions}
                        onChange={(e) => setNewAddressInstructions(e.target.value)}
                        placeholder="e.g. Call when reaching gate"
                        className="w-full px-3 py-2 text-sm bg-neutral-950 border border-white/[0.1] rounded-lg text-neutral-100"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-semibold bg-amber-400 text-neutral-950 rounded-lg hover:bg-amber-300 transition-colors cursor-pointer"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              )}

              <div className="divide-y divide-white/[0.08]">
                {profile.addresses.map((addr) => {
                  const eligibleForFreeDelivery =
                    addr.distanceKm <= RESTAURANT_INFO.deliveryRadiusKm;
                  return (
                    <div
                      key={addr.id}
                      className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-semibold text-neutral-100">
                            {addr.label}
                          </span>
                          {addr.isDefault && (
                            <span className="text-xs font-medium text-amber-400">
                              · Default Destination
                            </span>
                          )}
                          <span className="text-xs text-neutral-500">·</span>
                          <span
                            className={`text-xs font-mono tabular-nums ${
                              eligibleForFreeDelivery
                                ? 'text-emerald-400'
                                : 'text-amber-300'
                            }`}
                          >
                            {addr.distanceKm} Km from Bus Stand Outlet (
                            {eligibleForFreeDelivery
                              ? 'Free Delivery Zone (≤ 3 Km)'
                              : 'Standard Delivery Zone (> 3 Km)'}
                            )
                          </span>
                        </div>
                        <p className="text-sm text-neutral-300">{addr.streetLine}</p>
                        <p className="text-xs text-neutral-400">
                          Landmark: {addr.landmark} · {addr.city} ({addr.postalCode})
                        </p>
                        <p className="text-xs text-neutral-400 italic">
                          Rider Note: &ldquo;{addr.deliveryInstructions}&rdquo;
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!addr.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="px-3 py-1.5 text-xs font-medium bg-neutral-900 border border-white/[0.1] text-neutral-200 rounded-lg hover:border-amber-400 hover:text-amber-400 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            Set as Default
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr.id)}
                          title="Delete address"
                          className="p-2 text-neutral-400 hover:text-red-400 bg-neutral-900 border border-white/[0.08] rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 3: DIETARY & TASTE DEFAULTS */}
          {activeSection === 'dietary' && (
            <div className="space-y-8">
              <div className="pb-5 border-b border-white/[0.08]">
                <h3 className="font-display text-2xl font-semibold text-neutral-100">
                  Dietary & Taste Preferences (100% Pure Vegetarian Kitchen)
                </h3>
                <p className="text-sm text-neutral-400 mt-1">
                  Configure how our chefs prepare your meals by default. These preferences automatically apply when you add items to your cart.
                </p>
              </div>

              {/* Default Spice Level Selector */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-neutral-100">
                  Default Spice & Masala Level
                </label>
                <p className="text-xs text-neutral-400">
                  Applied automatically to all Main Course, Tandoori Khazana, Chinese, and Momos dishes.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {(['Mild', 'Medium', 'Punjabi Spicy'] as const).map((level) => {
                    const isSelected =
                      profile.preferences.defaultSpiceLevel === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => updatePreference('defaultSpiceLevel', level)}
                        className={`p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-amber-400/15 border-amber-400 text-neutral-100'
                            : 'bg-neutral-900 border-white/[0.08] text-neutral-300 hover:border-white/[0.2]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">{level}</span>
                          {isSelected && (
                            <Check className="w-4 h-4 text-amber-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-neutral-400 mt-1">
                          {level === 'Mild' &&
                            'Gentle seasoning, kids & senior friendly, low green chili.'}
                          {level === 'Medium' &&
                            'Balanced homestyle Punjabi tadka with aromatic spices.'}
                          {level === 'Punjabi Spicy' &&
                            'Bold dhaba-style heat with roasted chilies and black pepper.'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Toggle Switches for Kitchen Customizations */}
              <div className="pt-6 border-t border-white/[0.08] divide-y divide-white/[0.08]">
                {[
                  {
                    key: 'jainPreparationDefault' as const,
                    title: 'Default to Jain Preparation (No Onion, No Garlic)',
                    desc: 'Automatically request strict no-onion, no-garlic preparation on all eligible dishes.',
                  },
                  {
                    key: 'autoHighlightJainItems' as const,
                    title: 'Highlight Jain-Eligible Dishes Across Menu & Pamphlet',
                    desc: 'Display a clear Jain Option indicator next to compatible dishes while browsing.',
                  },
                  {
                    key: 'lowOilButterDefault' as const,
                    title: 'Light Tadka (Low Oil / Less Butter & Cream)',
                    desc: 'Instruct the kitchen to prepare curries and parathas with light butter brushing.',
                  },
                  {
                    key: 'avoidNutsCashewGravy' as const,
                    title: 'Allergen Alert: Avoid Cashew & Tree-Nut Gravies',
                    desc: 'Flag orders for nut-free preparation in kitchen tickets.',
                  },
                  {
                    key: 'includeCutleryAndNapkins' as const,
                    title: 'Include Biodegradable Cutlery, Napkins & Oregano/Chili Sachets',
                    desc: 'Pack spoons, forks, tissues, and accompaniments with home delivery orders.',
                  },
                ].map((setting) => {
                  const enabled = profile.preferences[setting.key];
                  return (
                    <div
                      key={setting.key}
                      className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-6"
                    >
                      <div>
                        <p className="text-sm font-medium text-neutral-100">
                          {setting.title}
                        </p>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {setting.desc}
                        </p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={enabled}
                        onClick={() => updatePreference(setting.key, !enabled)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ${
                          enabled ? 'bg-amber-400' : 'bg-neutral-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-neutral-950 shadow transition duration-150 ${
                            enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Saved Favorite Dishes for 1-Click Reorder */}
              <div className="pt-6 border-t border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-amber-400" />
                      <span>Saved Favorite Dishes ({favoriteItems.length})</span>
                    </h4>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Quickly add your regular family favorites to your order or manage your saved list.
                    </p>
                  </div>
                </div>

                {favoriteItems.length === 0 ? (
                  <p className="text-xs text-neutral-400 py-4">
                    No favorite dishes saved yet. Click the heart icon on any dish in the Menu tab to save it here.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {favoriteItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-neutral-900 border border-white/[0.08]"
                      >
                        <div className="min-w-0 pr-3">
                          <p className="text-sm font-medium text-neutral-100 truncate">
                            {item.name}
                          </p>
                          <p className="text-xs font-mono tabular-nums text-amber-400">
                            ₹{item.price}/-
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => onAddToCart(item)}
                            className="px-2.5 py-1 text-xs font-semibold bg-amber-400 text-neutral-950 rounded hover:bg-amber-300 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            + Add
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleFavoriteDish(item.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                            title="Remove from favorites"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 4: NOTIFICATIONS & BILLING */}
          {activeSection === 'notifications_billing' && (
            <div className="space-y-8">
              <div className="pb-5 border-b border-white/[0.08]">
                <h3 className="font-display text-2xl font-semibold text-neutral-100">
                  Notifications, Payment & Free Delivery Alerts
                </h3>
                <p className="text-sm text-neutral-400 mt-1">
                  Control how The Turban Kitchen sends order updates and pre-select your preferred checkout payment mode.
                </p>
              </div>

              {/* Default Payment Method */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="block text-sm font-semibold text-neutral-100">
                    Default Payment Mode on Checkout
                  </label>
                  <span className="text-xs font-mono text-amber-400">
                    Official Restaurant UPI: 9877932787@fam
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(
                    [
                      'UPI (9877932787@fam)',
                      'UPI / QR on Delivery',
                      'Cash on Delivery',
                      'Card on Delivery',
                    ] as const
                  ).map((method) => {
                    const active =
                      profile.preferences.defaultPaymentMethod === method;
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() =>
                          updatePreference('defaultPaymentMethod', method)
                        }
                        className={`p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                          active
                            ? method.includes('9877932787@fam')
                              ? 'bg-amber-500/15 border-amber-400 text-neutral-100 ring-1 ring-amber-400/50'
                              : 'bg-emerald-500/15 border-emerald-400 text-neutral-100'
                            : 'bg-neutral-900 border-white/[0.08] text-neutral-300 hover:border-white/[0.2]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold truncate pr-1">{method}</span>
                          {active && (
                            <Check className={`w-4 h-4 shrink-0 ${method.includes('9877932787@fam') ? 'text-amber-400' : 'text-emerald-400'}`} />
                          )}
                        </div>
                        <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                          {method === 'UPI (9877932787@fam)' &&
                            'Direct instant UPI payment to 9877932787@fam via Google Pay, PhonePe, Paytm, or FamPay.'}
                          {method === 'UPI / QR on Delivery' &&
                            'Scan rider GPay / PhonePe / Paytm QR at your doorstep.'}
                          {method === 'Cash on Delivery' &&
                            'Pay in cash upon receiving your hot meal at home.'}
                          {method === 'Card on Delivery' &&
                            'Request a portable wireless POS swipe machine with rider.'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Direct UPI 9877932787@fam Management Card */}
              <div className="p-5 rounded-xl bg-gradient-to-r from-amber-950/40 via-neutral-900 to-neutral-900 border border-amber-500/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0 font-bold text-sm">
                      UPI
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                        <span>Direct UPI Payment Integration</span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Active VPA: 9877932787@fam
                        </span>
                      </h4>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Accepting instant payments to 9877932787@fam via FamPay, GPay, PhonePe &amp; BHIM.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsTestUpiOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap self-start"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Launch UPI Payment Tester</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs border-t border-white/[0.08]">
                  <div className="space-y-0.5">
                    <span className="text-neutral-500">Official UPI VPA</span>
                    <p className="font-mono font-bold text-amber-400">9877932787@fam</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-neutral-500">Merchant Name</span>
                    <p className="font-medium text-neutral-200">{RESTAURANT_INFO.name}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-neutral-500">Supported Apps</span>
                    <p className="text-emerald-400 font-medium">GPay, PhonePe, Paytm, FamPay</p>
                  </div>
                </div>
              </div>

              {/* Free Delivery Zone Reminder Toggle */}
              <div className="pt-6 border-t border-white/[0.08] flex items-center justify-between gap-6">
                <div>
                  <p className="text-sm font-semibold text-neutral-100">
                    3 Km Free Delivery Status Indicator
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Show a live indicator in your cart confirming 100% Free Home Delivery eligibility for addresses within 3 Km.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={profile.preferences.freeDeliveryThresholdReminder}
                  onClick={() =>
                    updatePreference(
                      'freeDeliveryThresholdReminder',
                      !profile.preferences.freeDeliveryThresholdReminder
                    )
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ${
                    profile.preferences.freeDeliveryThresholdReminder
                      ? 'bg-amber-400'
                      : 'bg-neutral-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-neutral-950 shadow transition duration-150 ${
                      profile.preferences.freeDeliveryThresholdReminder
                        ? 'translate-x-5'
                        : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Notification Channels */}
              <div className="pt-6 border-t border-white/[0.08] space-y-4">
                <h4 className="text-sm font-semibold text-neutral-100">
                  Communication & Order Status Channels
                </h4>
                <div className="divide-y divide-white/[0.08]">
                  {[
                    {
                      key: 'whatsappUpdates' as const,
                      title: 'WhatsApp Live Kitchen & Rider Status',
                      desc: `Receive instant WhatsApp confirmation from ${RESTAURANT_INFO.mobile} when your food enters the tandoor and when the rider departs.`,
                    },
                    {
                      key: 'smsOrderTracking' as const,
                      title: 'SMS Delivery Alerts',
                      desc: 'Standard text message alerts with order number and rider contact number.',
                    },
                    {
                      key: 'emailReceipts' as const,
                      title: 'Itemized Email Bills & GST Invoices',
                      desc: `Send digital receipts to ${profile.email} upon order completion.`,
                    },
                    {
                      key: 'festiveSpecials' as const,
                      title: 'Hola Mohalla, Gurpurab & Seasonal Menu Announcements',
                      desc: 'Occasional updates on winter Makke Di Roti Te Sarso Da Saag specials and family combo offers.',
                    },
                  ].map((item) => {
                    const isOn = profile.preferences.notifications[item.key];
                    return (
                      <div
                        key={item.key}
                        className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-6"
                      >
                        <div>
                          <p className="text-sm font-medium text-neutral-100">
                            {item.title}
                          </p>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isOn}
                          onClick={() => updateNotification(item.key, !isOn)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ${
                            isOn ? 'bg-amber-400' : 'bg-neutral-700'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-neutral-950 shadow transition duration-150 ${
                              isOn ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: INTERACTIVE USER MANUAL FOR PROFILE & PREFERENCES */}
          {activeSection === 'manual' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-white/[0.08]">
                <div>
                  <h3 className="font-display text-2xl font-semibold text-neutral-100">
                    User Manual: Profile Settings & Account Preferences
                  </h3>
                  <p className="text-sm text-neutral-400 mt-1">
                    Step-by-step reference manual for managing your account, 3 Km free delivery eligibility, and dietary customizations.
                  </p>
                </div>
                <div className="w-full sm:w-64">
                  <input
                    type="search"
                    value={manualSearchQuery}
                    onChange={(e) => setManualSearchQuery(e.target.value)}
                    placeholder="Search manual topics..."
                    className="w-full px-3.5 py-2 text-xs bg-neutral-900 border border-white/[0.1] rounded-lg text-neutral-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-6">
                {filteredManualTopics.map((topic, index) => (
                  <div
                    key={topic.step}
                    className="p-5 rounded-xl bg-neutral-900/70 border border-white/[0.08] space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-base font-semibold text-neutral-100">
                        {topic.step}
                      </h4>
                      <span className="text-xs text-amber-400">
                        {topic.category}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {topic.summary}
                    </p>
                    <ol className="space-y-2 pt-2 border-t border-white/[0.06] text-xs text-neutral-300 list-decimal list-inside">
                      {topic.instructions.map((line, i) => (
                        <li key={i} className="leading-relaxed">
                          {line}
                        </li>
                      ))}
                    </ol>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (index === 0) setActiveSection('profile');
                          if (index === 1) setActiveSection('addresses');
                          if (index === 2) setActiveSection('dietary');
                          if (index === 3) setActiveSection('notifications_billing');
                        }}
                        className="text-xs font-semibold text-amber-400 hover:underline cursor-pointer"
                      >
                        Go to this settings panel &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Outlet Support Table */}
              <div className="p-5 rounded-xl bg-neutral-900 border border-white/[0.08] space-y-3">
                <h4 className="text-sm font-semibold text-neutral-100">
                  Outlet Support & Direct Telephone Ordering Directory
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <p className="text-neutral-400">Restaurant Location</p>
                    <p className="text-neutral-100 font-medium mt-0.5">
                      {RESTAURANT_INFO.address}
                    </p>
                  </div>
                  <div>
                    <p className="text-neutral-400">Direct Hotlines</p>
                    <p className="text-neutral-100 font-mono tabular-nums font-medium mt-0.5">
                      {RESTAURANT_INFO.mobile} · {RESTAURANT_INFO.landlines[0]}
                    </p>
                  </div>
                  <div>
                    <p className="text-neutral-400">Service Hours & Delivery Policy</p>
                    <p className="text-neutral-100 font-medium mt-0.5">
                      {RESTAURANT_INFO.hours} (Free Delivery ≤ 3 Km)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Direct UPI 9877932787@fam Simulator Modal */}
      <UPIPaymentModal
        isOpen={isTestUpiOpen}
        onClose={() => setIsTestUpiOpen(false)}
        amount={399}
        customerName={profile.fullName}
        customerPhone={profile.phone}
        customerEmail={profile.email}
        customerAddress={
          profile.addresses.find((a) => a.isDefault)?.streetLine || ''
        }
        onPaymentSuccess={(data) => {
          setIsTestUpiOpen(false);
          triggerSaveFeedback(
            `Direct UPI test payment approved! Txn: ${data.transactionId} via ${data.upiVpa}.`
          );
        }}
      />
    </div>
  );
};
