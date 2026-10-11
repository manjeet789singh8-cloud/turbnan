export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategoryId;
  price: number;
  halfPrice?: number;
  priceLabel?: string;
  description: string;
  isJainAvailable: boolean;
  spiceDefault: 'Mild' | 'Medium' | 'Punjabi Spicy';
  isSignature?: boolean;
  pageNumber: 1 | 2;
}

export type MenuCategoryId =
  | 'beverages'
  | 'soup'
  | 'continental_sandwich'
  | 'main_course'
  | 'momos'
  | 'chinese'
  | 'tandoori_khazana'
  | 'rice_pulao'
  | 'breads'
  | 'salad_raita'
  | 'sweet_desserts'
  | 'burger';

export interface MenuCategory {
  id: MenuCategoryId;
  title: string;
  subtitle: string;
  pageNumber: 1 | 2;
}

export interface DeliveryAddress {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  streetLine: string;
  landmark: string;
  city: string;
  postalCode: string;
  distanceKm: number;
  isDefault: boolean;
  deliveryInstructions: string;
}

export interface UserProfileSettings {
  fullName: string;
  email: string;
  phone: string;
  alternatePhone: string;
  preferredLanguage: 'English' | 'Punjabi (Gurmukhi)' | 'Hindi';
  birthdayMonth: string;
  gstNumber: string;
  avatarUrl: string;
  addresses: DeliveryAddress[];
  preferences: {
    defaultSpiceLevel: 'Mild' | 'Medium' | 'Punjabi Spicy';
    jainPreparationDefault: boolean;
    lowOilButterDefault: boolean;
    avoidNutsCashewGravy: boolean;
    includeCutleryAndNapkins: boolean;
    autoHighlightJainItems: boolean;
    freeDeliveryThresholdReminder: boolean;
    defaultPaymentMethod:
      | 'UPI (9877932787@fam)'
      | 'UPI / QR on Delivery'
      | 'Cash on Delivery'
      | 'Card on Delivery'
      | string;
    upiVpa: string;
    razorpayUpiVpa?: string;
    notifications: {
      whatsappUpdates: boolean;
      smsOrderTracking: boolean;
      emailReceipts: boolean;
      festiveSpecials: boolean;
    };
    defaultPortionSize: 'Full' | 'Half';
  };
  favoriteItemIds: string[];
}

export interface OrderRecord {
  id: string;
  placedAt: string;
  createdAtMs?: number;
  estimatedDeliveryMinutes?: number;
  status:
    | 'Delivered'
    | 'Preparing in Kitchen'
    | 'Out for Delivery'
    | 'Sent via WhatsApp'
    | 'Payment Verified (UPI)'
    | 'Payment Verified (Razorpay)'
    | 'Confirmed After Payment';
  orderChannel?: string;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  paymentTransactionId?: string;
  paymentUpiVpa?: string;
  items: {
    name: string;
    variant?: 'Half' | 'Full';
    quantity: number;
    unitPrice: number;
    spiceLevel: string;
    isJain: boolean;
  }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  addressSummary: string;
  paymentMethod: string;
}

export interface BookingRecord {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  guests: number;
  date: string;
  timeSlot: string;
  seatingSection: 'AC Family Dining' | 'Traditional Baithak' | 'Garden Courtyard' | 'VIP Anandpur Hall';
  occasion: 'Family Dining' | 'Birthday Celebration' | 'Anniversary' | 'Anandpur Sahib Darshan Yatra' | 'Casual Gathering';
  specialRequests?: string;
  isJainPreference?: boolean;
  tableNumber: string;
  advanceAmount: number; // ₹199 advance cover charge
  paymentTransactionId: string;
  paymentUpiVpa: string;
  status: 'Confirmed (Payment Verified)' | 'Completed' | 'Cancelled';
  createdAtMs: number;
  placedAt: string;
}

export const INITIAL_BOOKINGS: BookingRecord[] = [];

export const RESTAURANT_INFO = {
  name: 'The Turban Kitchen',
  tagline: 'Authentic Punjabi Flavours',
  hindiMotto: 'भूख का हो सवाल, टर्बन किचन बेमिसाल।',
  dietaryBadge: '100% Pure Vegetarian Family Restaurant',
  address: 'Near Bus Stand, Sri Anandpur Sahib',
  mobile: '+91-73 7909-7909',
  whatsappNumberClean: '917379097909',
  upiVpa: '9877932787@fam',
  razorpayUpiVpa: '9877932787@fam',
  landlines: ['01887-260810', '01887-260820'],
  hours: 'Open 7:30 AM to 11:30 PM',
  deliveryRadiusKm: 3,
  minOrderFreeDelivery: 0,
  standardDeliveryFee: 40,
};

export const MENU_CATEGORIES: MenuCategory[] = [
  { id: 'main_course', title: 'Main Course', subtitle: '24 authentic Punjabi curries & handi specialties', pageNumber: 1 },
  { id: 'tandoori_khazana', title: 'Tandoori Khazana', subtitle: 'Clay-oven roasted paneer, mushroom & soya chaap', pageNumber: 2 },
  { id: 'breads', title: 'Breads', subtitle: '15 freshly baked rotis, naans, kulchas & parathas', pageNumber: 2 },
  { id: 'chinese', title: 'Chinese', subtitle: '19 wok-tossed noodles, manchurian, paneer & fries', pageNumber: 2 },
  { id: 'continental_sandwich', title: 'Continental & Sandwich', subtitle: 'Grilled sandwiches, crispy pakoras & jalfrezi', pageNumber: 1 },
  { id: 'momos', title: 'Momos', subtitle: 'Steamed, tandoori & rich gravy momos', pageNumber: 1 },
  { id: 'rice_pulao', title: 'Rice & Pulao', subtitle: 'Fragrant basmati rice, jeera rice & veg biryani', pageNumber: 2 },
  { id: 'beverages', title: 'Beverages', subtitle: '13 hot chais, Punjabi lassis, cold coffee & mojitos', pageNumber: 1 },
  { id: 'soup', title: 'Soup', subtitle: 'Warm comforting bowls prepared fresh to order', pageNumber: 1 },
  { id: 'burger', title: 'Burger', subtitle: 'Crispy veg, paneer & molten cheese burst burgers', pageNumber: 2 },
  { id: 'salad_raita', title: 'Salad & Raita', subtitle: 'Chilled curd, boondi/pineapple raita & fresh salads', pageNumber: 2 },
  { id: 'sweet_desserts', title: 'Sweet & Desserts', subtitle: 'Traditional gulab jamun, rasmalai & warm brownie', pageNumber: 2 },
];

export const MENU_ITEMS: MenuItem[] = [
  // ================= PAGE 1: BEVERAGES =================
  {
    id: 'bev-tea',
    name: 'Tea',
    category: 'beverages',
    price: 35,
    description: 'Classic Punjabi kadak milk tea brewed with aromatic Assam leaves.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 1,
  },
  {
    id: 'bev-lemon-tea',
    name: 'Lemon Tea',
    category: 'beverages',
    price: 40,
    description: 'Refreshing black tea infused with fresh lemon juice and mild spices.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 1,
  },
  {
    id: 'bev-masala-tea',
    name: 'Masala Tea',
    category: 'beverages',
    price: 40,
    description: 'Spiced chai simmered with crushed green cardamom, ginger, and cloves.',
    isJainAvailable: true,
    spiceDefault: 'Medium',
    pageNumber: 1,
  },
  {
    id: 'bev-green-tea',
    name: 'Green Tea',
    category: 'beverages',
    price: 40,
    description: 'Light antioxidant-rich soothing green tea leaves steeped to perfection.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 1,
  },
  {
    id: 'bev-black-tea',
    name: 'Black Tea',
    category: 'beverages',
    price: 35,
    description: 'Pure brisk brewed black tea served piping hot without milk.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 1,
  },
  {
    id: 'bev-coffee',
    name: 'Coffee',
    category: 'beverages',
    price: 60,
    description: 'Frothed hot milk coffee topped with a light dusting of cocoa.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 1,
  },
  {
    id: 'bev-cold-coffee',
    name: 'Cold Coffee',
    category: 'beverages',
    price: 60,
    description: 'Chilled creamy blended coffee shake with rich espresso notes.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 1,
  },
  {
    id: 'bev-cold-coffee-ice-cream',
    name: 'Cold Coffee With Ice Cream',
    category: 'beverages',
    price: 120,
    description: 'Thick café-style cold coffee crowned with a scoop of vanilla ice cream.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    isSignature: true,
    pageNumber: 1,
  },
  {
    id: 'bev-lassi-sweet',
    name: 'Lassi Sweet',
    category: 'beverages',
    price: 70,
    description: 'Traditional hand-churned thick Punjabi sweet yogurt drink with malai.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    isSignature: true,
    pageNumber: 1,
  },
  {
    id: 'bev-lassi-salted',
    name: 'Lassi Salted',
    category: 'beverages',
    price: 60,
    description: 'Cooling churned buttermilk seasoned with roasted cumin and black salt.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 1,
  },
  {
    id: 'bev-fresh-lime-soda',
    name: 'Fresh Lime Soda',
    category: 'beverages',
    price: 100,
    description: 'Sparkling lime cooler served sweet, salted, or mixed to your preference.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 1,
  },
  {
    id: 'bev-mineral-water',
    name: 'Mineral Water',
    category: 'beverages',
    price: 20,
    priceLabel: 'MRP (₹20/-)',
    description: 'Chilled or room-temperature packaged 1L drinking water billed at MRP.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 1,
  },
  {
    id: 'bev-mint-mojito',
    name: 'Mint Mojito',
    category: 'beverages',
    price: 140,
    description: 'Muddled garden mint leaves, lime wedges, and crushed ice fizz.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 1,
  },

  // ================= PAGE 1: SOUP =================
  {
    id: 'soup-tomato',
    name: 'Tomato Soup',
    category: 'soup',
    price: 90,
    description: 'Velvety vine-ripened tomato puree simmered with herbs and crispy croutons.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 1,
  },
  {
    id: 'soup-hot-sour',
    name: 'Hot & Sour Soup',
    category: 'soup',
    price: 100,
    description: 'Tangy and peppery Indo-Chinese broth loaded with finely julienned vegetables.',
    isJainAvailable: true,
    spiceDefault: 'Punjabi Spicy',
    pageNumber: 1,
  },
  {
    id: 'soup-sweet-corn',
    name: 'Sweet Corn Veg Soup',
    category: 'soup',
    price: 110,
    description: 'Comforting creamy golden corn kernels and diced garden vegetables.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 1,
  },
  {
    id: 'soup-manchow',
    name: 'Veg Manchow Soup',
    category: 'soup',
    price: 100,
    description: 'Savory garlic-soy vegetable broth topped with crunchy fried noodles.',
    isJainAvailable: false,
    spiceDefault: 'Medium',
    pageNumber: 1,
  },

  // ================= PAGE 1: CONTINENTAL & SANDWICH =================
  {
    id: 'cont-veg-sandwich',
    name: 'Veg Sandwich',
    category: 'continental_sandwich',
    price: 120,
    description: 'Fresh cucumber, tomato, potato, and mint chutney layered in soft bread.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 1,
  },
  {
    id: 'cont-veg-grilled-sandwich',
    name: 'Veg Grilled Sandwich',
    category: 'continental_sandwich',
    price: 150,
    description: 'Golden-toasted jumbo bread stuffed with seasoned garden veggies and butter.',
    isJainAvailable: true,
    spiceDefault: 'Medium',
    pageNumber: 1,
  },
  {
    id: 'cont-paneer-sandwich',
    name: 'Paneer Sandwich',
    category: 'continental_sandwich',
    price: 150,
    description: 'Crumbled fresh malai paneer tossed with herbs and creamy dressing.',
    isJainAvailable: true,
    spiceDefault: 'Medium',
    pageNumber: 1,
  },
  {
    id: 'cont-corn-cheese-sandwich',
    name: 'Corn & Cheese Sandwich',
    category: 'continental_sandwich',
    price: 150,
    description: 'Sweet American corn and melted mozzarella grilled with oregano seasoning.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 1,
  },
  {
    id: 'cont-paneer-tikka-grilled-sandwich',
    name: 'Paneer Tikka Grilled Sandwich',
    category: 'continental_sandwich',
    price: 170,
    description: 'Smoky tandoori paneer tikka cubes, bell peppers, and mint mayo grilled crisp.',
    isJainAvailable: false,
    spiceDefault: 'Medium',
    isSignature: true,
    pageNumber: 1,
  },
  {
    id: 'cont-pyaz-pakora',
    name: 'Pyaz Pakora',
    category: 'continental_sandwich',
    price: 80,
    description: 'Crispy spiced gram-flour onion fritters served with tangy tamarind & mint chutney.',
    isJainAvailable: false,
    spiceDefault: 'Medium',
    pageNumber: 1,
  },
  {
    id: 'cont-paneer-pakora',
    name: 'Paneer Pakora',
    category: 'continental_sandwich',
    price: 130,
    description: 'Soft cottage cheese fingers dipped in ajwain-spiced besan batter and fried golden.',
    isJainAvailable: true,
    spiceDefault: 'Medium',
    pageNumber: 1,
  },
  {
    id: 'cont-mix-pakora',
    name: 'Mix Pakora',
    category: 'continental_sandwich',
    price: 120,
    description: 'Assorted platter of potato, gobhi, onion, and paneer pakoras with chat masala.',
    isJainAvailable: false,
    spiceDefault: 'Medium',
    pageNumber: 1,
  },
  {
    id: 'cont-palak-corn',
    name: 'Palak Corn',
    category: 'continental_sandwich',
    price: 270,
    description: 'Tender sweet corn kernels simmered in a velvety spiced spinach puree.',
    isJainAvailable: true,
    spiceDefault: 'Medium',
    pageNumber: 1,
  },
  {
    id: 'cont-mix-veg-jalfreezi',
    name: 'Mix Veg Jalfreezi',
    category: 'continental_sandwich',
    price: 180,
    description: 'Juliennes of bell peppers, carrots, baby corn, and paneer in a tangy tomato glaze.',
    isJainAvailable: true,
    spiceDefault: 'Medium',
    pageNumber: 1,
  },

  // ================= PAGE 1: MAIN COURSE =================
  {
    id: 'mc-dal-makhni',
    name: 'Dal Makhni',
    category: 'main_course',
    price: 190,
    description: 'Whole black lentils slow-simmered overnight on charcoal with white butter and cream.',
    isJainAvailable: true,
    spiceDefault: 'Medium',
    isSignature: true,
    pageNumber: 1,
  },
  {
    id: 'mc-dal-fry',
    name: 'Dal Fry',
    category: 'main_course',
    price: 170,
    description: 'Comforting yellow lentils sautéed with ginger, tomatoes, and fresh coriander.',
    isJainAvailable: true,
    spiceDefault: 'Medium',
    pageNumber: 1,
  },
  {
    id: 'mc-yellow-dal-tadka',
    name: 'Yellow Dal Tadka',
    category: 'main_course',
    price: 180,
    description: 'Moong and toor dal finished with a crackling desi ghee tempering of cumin and red chili.',
    isJainAvailable: true,
    spiceDefault: 'Medium',
    pageNumber: 1,
  },
  {
    id: 'mc-shahi-paneer',
    name: 'Shahi Paneer',
    category: 'main_course',
    price: 250,
    description: 'Cottage cheese cubes in a royal creamy cashew, cardamom, and saffron-tinted gravy.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    isSignature: true,
    pageNumber: 1,
  },
  {
    id: 'mc-kadai-paneer',
    name: 'Kadai Paneer',
    category: 'main_course',
    price: 270,
    description: 'Paneer and crunchy capsicum tossed in freshly pounded coriander seeds and whole chilies.',
    isJainAvailable: true,
    spiceDefault: 'Punjabi Spicy',
    isSignature: true,
    pageNumber: 1,
  },
  {
    id: 'mc-handi-paneer',
    name: 'Handi Paneer',
    category: 'main_course',
    price: 260,
    description: 'Slow-cooked cottage cheese in a traditional clay-pot style spiced onion-tomato gravy.',
    isJainAvailable: false,
    spiceDefault: 'Medium',
    pageNumber: 1,
  },
  {
    id: 'mc-paneer-butter-masala',
    name: 'Paneer Butter Masala',
    category: 'main_course',
    price: 270,
    description: 'Soft paneer cubes immersed in a rich, velvety makhani tomato and butter sauce.',
    isJainAvailable: true,
    spiceDefault: 'Medium',
    isSignature: true,
    pageNumber: 1,
  },
  {
    id: 'mc-paneer-do-pyaza',
    name: 'Paneer Do Pyaza',
    category: 'main_course',
    price: 280,
    description: 'Cottage cheese cooked with caramelized onion petals and aromatic Punjabi spices.',
    isJainAvailable: false,
    spiceDefault: 'Medium',
    pageNumber: 1,
  },
  {
    id: 'mc-paneer-malai-pasanda',
    name: 'Paneer Malai Pasanda',
    category: 'main_course',
    price: 300,
    description: 'Stuffed paneer sandwiches simmered in an indulgent cream and dry-fruit gravy.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 1,
  },
  {
    id: 'mc-palak-paneer',
    name: 'Palak Paneer',
    category: 'main_course',
    price: 220,
    description: 'Fresh farm spinach puree tempered with roasted cumin and cubes of soft paneer.',
    isJainAvailable: true,
    spiceDefault: 'Medium',
    pageNumber: 1,
  },
  {
    id: 'mc-mix-veg',
    name: 'Mix Veg',
    category: 'main_course',
    price: 180,
    description: 'Seasonal garden vegetables and paneer braised in a homestyle masala.',
    isJainAvailable: true,
    spiceDefault: 'Medium',
    pageNumber: 1,
  },
  {
    id: 'mc-aloo-gobhi',
    name: 'Aloo Gobhi',
    category: 'main_course',
    price: 170,
    description: 'Cauliflower florets and potatoes roasted with ginger juliennes and turmeric.',
    isJainAvailable: true,
    spiceDefault: 'Medium',
    pageNumber: 1,
  },
  {
    id: 'mc-kashmiri-dum-aloo',
    name: 'Kashmiri Dum Aloo',
    category: 'main_course',
    price: 260,
    description: 'Golden baby potatoes stuffed and slow-cooked in a fennel and yogurt gravy.',
    isJainAvailable: false,
    spiceDefault: 'Medium',
    pageNumber: 1,
  },
  {
    id: 'mc-aloo-jeera',
    name: 'Aloo Jeera',
    category: 'main_course',
    price: 190,
    description: 'Diced potatoes tossed with crackling roasted cumin seeds, green chilies, and coriander.',
    isJainAvailable: true,
    spiceDefault: 'Medium',
    pageNumber: 1,
  },
  {
    id: 'mc-mix-makhana-veg',
    name: 'Mix Makhana Veg',
    category: 'main_course',
    price: 250,
    description: 'Puffed lotus seeds (phool makhana), cashews, and vegetables in a rich gravy.',
    isJainAvailable: true,
    spiceDefault: 'Medium',
    pageNumber: 1,
  },
  {
    id: 'mc-veg-kofta',
    name: 'Veg Kofta',
    category: 'main_course',
    price: 220,
    description: 'Spiced vegetable dumplings served in a savory onion-tomato curry.',
    isJainAvailable: false,
    spiceDefault: 'Medium',
    pageNumber: 1,
  },
  {
    id: 'mc-malai-kofta',
    name: 'Malai Kofta',
    category: 'main_course',
    price: 130,
    description: 'Melt-in-mouth paneer and khoya dumplings in a silky sweet-savory cream sauce.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 1,
  },
  {
    id: 'mc-chana-masala',
    name: 'Chana Masala',
    category: 'main_course',
    price: 200,
    description: 'Amritsari-style chickpeas cooked with pomegranate seed powder and bhuna masala.',
    isJainAvailable: true,
    spiceDefault: 'Punjabi Spicy',
    pageNumber: 1,
  },
  {
    id: 'mc-rajma-masala',
    name: 'Rajma Masala',
    category: 'main_course',
    price: 200,
    description: 'Punjabi red kidney beans slow-cooked in a thick homestyle tomato-ginger gravy.',
    isJainAvailable: true,
    spiceDefault: 'Medium',
    pageNumber: 1,
  },
  {
    id: 'mc-mutter-mushroom',
    name: 'Mutter Mushroom',
    category: 'main_course',
    price: 240,
    description: 'Button mushrooms and sweet green peas simmered in a spiced Punjabi masala.',
    isJainAvailable: false,
    spiceDefault: 'Medium',
    pageNumber: 1,
  },
  {
    id: 'mc-kadai-mushroom',
    name: 'Kadai Mushroom',
    category: 'main_course',
    price: 270,
    description: 'Fresh mushrooms and bell peppers stir-fried in roasted kadai spice blend.',
    isJainAvailable: false,
    spiceDefault: 'Punjabi Spicy',
    pageNumber: 1,
  },
  {
    id: 'mc-kaju-curry',
    name: 'Kaju Curry',
    category: 'main_course',
    price: 270,
    description: 'Whole roasted golden cashews simmered in a rich, creamy tomato-cashew gravy.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 1,
  },
  {
    id: 'mc-tfc-special-paneer-pasanda',
    name: 'TFC Special Paneer Pasanda',
    category: 'main_course',
    price: 300,
    description: "Chef's signature stuffed cottage cheese delicacy in a royal saffron-nut gravy.",
    isJainAvailable: true,
    spiceDefault: 'Medium',
    isSignature: true,
    pageNumber: 1,
  },
  {
    id: 'mc-makke-di-roti-sarso-da-saag',
    name: 'Makke Di Roti Te Sarso Da Saag',
    category: 'main_course',
    price: 320,
    description: 'Traditional Punjabi mustard greens topped with white makhan, served with 2 Makke Di Rotis & jaggery.',
    isJainAvailable: true,
    spiceDefault: 'Medium',
    isSignature: true,
    pageNumber: 1,
  },

  // ================= PAGE 1: MOMOS =================
  {
    id: 'momo-veg-steam',
    name: 'Veg Steam Momos',
    category: 'momos',
    price: 110,
    description: 'Delicate thin-wrapper dumplings filled with finely chopped cabbage, carrots, and herbs.',
    isJainAvailable: true,
    spiceDefault: 'Medium',
    pageNumber: 1,
  },
  {
    id: 'momo-veg-tandoori',
    name: 'Veg Tandoori Momos',
    category: 'momos',
    price: 170,
    description: 'Momos marinated in spiced hung curd and char-grilled in a clay tandoor.',
    isJainAvailable: false,
    spiceDefault: 'Punjabi Spicy',
    isSignature: true,
    pageNumber: 1,
  },
  {
    id: 'momo-veg-gravy',
    name: 'Veg Gravy Momos',
    category: 'momos',
    price: 190,
    description: 'Steamed vegetable momos tossed in a fiery creamy schezwan-makhani fusion gravy.',
    isJainAvailable: false,
    spiceDefault: 'Punjabi Spicy',
    pageNumber: 1,
  },
  {
    id: 'momo-paneer-gravy',
    name: 'Paneer Gravy Momos',
    category: 'momos',
    price: 210,
    description: 'Paneer-stuffed dumplings drenched in rich, tangy tandoori butter gravy.',
    isJainAvailable: false,
    spiceDefault: 'Punjabi Spicy',
    isSignature: true,
    pageNumber: 1,
  },

  // ================= PAGE 2: CHINESE =================
  {
    id: 'chi-veg-noodle',
    name: 'Veg Noodle',
    category: 'chinese',
    price: 180,
    description: 'Street-style wok-tossed noodles with crunchy cabbage, capsicum, and soy-chili glaze.',
    isJainAvailable: true,
    spiceDefault: 'Medium',
    pageNumber: 2,
  },
  {
    id: 'chi-veg-hakka-noodles',
    name: 'Veg Hakka Noodles',
    category: 'chinese',
    price: 190,
    description: 'Classic high-flame Hakka noodles tossed with julienned veggies, white pepper, and sesame oil.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    isSignature: true,
    pageNumber: 2,
  },
  {
    id: 'chi-veg-manchurian',
    name: 'Veg Manchurian',
    category: 'chinese',
    price: 180,
    description: 'Crispy vegetable dumplings simmered in a savory ginger-garlic soy coriander sauce.',
    isJainAvailable: true,
    spiceDefault: 'Medium',
    pageNumber: 2,
  },
  {
    id: 'chi-fried-rice',
    name: 'Fried Rice',
    category: 'chinese',
    price: 100,
    description: 'Aromatic basmati rice stir-fried in a wok with finely diced carrots, beans, and spring onions.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 2,
  },
  {
    id: 'chi-cheese-manchurian-dry',
    name: 'Cheese Manchurian (Dry)',
    category: 'chinese',
    price: 200,
    description: 'Batter-fried paneer & cheese bites tossed dry with bell peppers and tangy Manchurian glaze.',
    isJainAvailable: true,
    spiceDefault: 'Medium',
    pageNumber: 2,
  },
  {
    id: 'chi-paneer-satay',
    name: 'Paneer Satay',
    category: 'chinese',
    price: 250,
    description: 'Grilled cottage cheese strips glazed with a spicy peanut-chili oriental sauce.',
    isJainAvailable: true,
    spiceDefault: 'Punjabi Spicy',
    pageNumber: 2,
  },
  {
    id: 'chi-veg-spring-roll',
    name: 'Veg Spring Roll',
    category: 'chinese',
    price: 180,
    description: 'Crispy golden pastry rolls stuffed with seasoned glass noodles and shredded vegetables.',
    isJainAvailable: true,
    spiceDefault: 'Medium',
    pageNumber: 2,
  },
  {
    id: 'chi-cheese-spring-roll',
    name: 'Cheese Spring Roll',
    category: 'chinese',
    price: 200,
    description: 'Crunchy rolls filled with melted cheese, sweet corn, and spiced bell peppers.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 2,
  },
  {
    id: 'chi-chilly-potato',
    name: 'Chilly Potato',
    category: 'chinese',
    price: 140,
    description: 'Crispy potato wedges wok-tossed in fiery red chili, garlic, and capsicum sauce.',
    isJainAvailable: false,
    spiceDefault: 'Punjabi Spicy',
    pageNumber: 2,
  },
  {
    id: 'chi-honey-chilly-potato',
    name: 'Honey Chilly Potato',
    category: 'chinese',
    price: 160,
    description: 'Crunchy potato fingers glazed with honey, chili flakes, and toasted white sesame seeds.',
    isJainAvailable: true,
    spiceDefault: 'Medium',
    isSignature: true,
    pageNumber: 2,
  },
  {
    id: 'chi-mushroom-duplex',
    name: 'Mushroom Duplex',
    category: 'chinese',
    price: 200,
    description: 'Button mushroom caps stuffed with cheese and herbs, crumb-fried and served with dip.',
    isJainAvailable: false,
    spiceDefault: 'Medium',
    pageNumber: 2,
  },
  {
    id: 'chi-chilly-paneer',
    name: 'Chilly Paneer',
    category: 'chinese',
    price: 270,
    description: 'Wok-seared cottage cheese cubes, diced onions, and green chilies in dark soy sauce.',
    isJainAvailable: true,
    spiceDefault: 'Punjabi Spicy',
    isSignature: true,
    pageNumber: 2,
  },
  {
    id: 'chi-cheese-manchurian-gravy',
    name: 'Cheese Manchurian (Gravy)',
    category: 'chinese',
    price: 270,
    description: 'Rich cheese-paneer dumplings served in a generous bowl of hot Manchurian gravy.',
    isJainAvailable: true,
    spiceDefault: 'Medium',
    pageNumber: 2,
  },
  {
    id: 'chi-crispy-corn',
    name: 'Crispy Corn',
    category: 'chinese',
    price: 180,
    description: 'Crackling golden sweet corn kernels tossed with diced peppers, lime juice, and spice dust.',
    isJainAvailable: true,
    spiceDefault: 'Medium',
    pageNumber: 2,
  },
  {
    id: 'chi-veg-crispy',
    name: 'Veg Crispy',
    category: 'chinese',
    price: 130,
    description: 'Batter-fried crunchy florets of cauliflower, baby corn, and carrots in schezwan glaze.',
    isJainAvailable: true,
    spiceDefault: 'Punjabi Spicy',
    pageNumber: 2,
  },
  {
    id: 'chi-chopsy',
    name: 'Chopsy',
    category: 'chinese',
    price: 240,
    description: 'Crispy fried noodle nest topped with tangy sweet-and-sour vegetable gravy.',
    isJainAvailable: true,
    spiceDefault: 'Medium',
    pageNumber: 2,
  },
  {
    id: 'chi-paneer-65',
    name: 'Paneer 65',
    category: 'chinese',
    price: 270,
    description: 'South-Indian inspired fiery tempered paneer cubes with curry leaves and green chilies.',
    isJainAvailable: true,
    spiceDefault: 'Punjabi Spicy',
    pageNumber: 2,
  },
  {
    id: 'chi-french-fries',
    name: 'French Fries',
    category: 'chinese',
    price: 140,
    description: 'Classic golden salted potato fries served crisp with tomato ketchup.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 2,
  },
  {
    id: 'chi-perri-perri-fries',
    name: 'Perri Perri Fries',
    category: 'chinese',
    price: 150,
    description: 'Crispy fries generously dusted with zesty African Peri-Peri spice blend.',
    isJainAvailable: true,
    spiceDefault: 'Punjabi Spicy',
    pageNumber: 2,
  },

  // ================= PAGE 2: TANDOORI KHAZANA =================
  {
    id: 'tan-paneer-tikka',
    name: 'Paneer Tikka',
    category: 'tandoori_khazana',
    price: 290,
    description: 'Chunks of fresh paneer marinated in spiced yogurt and roasted in a charcoal tandoor.',
    isJainAvailable: true,
    spiceDefault: 'Punjabi Spicy',
    isSignature: true,
    pageNumber: 2,
  },
  {
    id: 'tan-mushroom-tikka',
    name: 'Mushroom Tikka',
    category: 'tandoori_khazana',
    price: 270,
    description: 'Juicy button mushrooms coated in tandoori masala and skewered over live coals.',
    isJainAvailable: false,
    spiceDefault: 'Medium',
    pageNumber: 2,
  },
  {
    id: 'tan-paneer-achari-tikka',
    name: 'Paneer Achari Tikka',
    category: 'tandoori_khazana',
    price: 280,
    description: 'Cottage cheese cubes infused with tangy Punjabi pickling spices (nigella, fennel, mustard).',
    isJainAvailable: true,
    spiceDefault: 'Punjabi Spicy',
    pageNumber: 2,
  },
  {
    id: 'tan-paneer-malai-tikka',
    name: 'Paneer Malai Tikka',
    category: 'tandoori_khazana',
    price: 290,
    description: 'Melt-in-mouth paneer marinated in cashew paste, cream, white pepper, and cardamom.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    isSignature: true,
    pageNumber: 2,
  },
  {
    id: 'tan-soya-chaap-tikka',
    name: 'Soya Chaap Tikka',
    category: 'tandoori_khazana',
    price: 270,
    description: 'Succulent soya chaap pieces char-grilled with smoky tandoori spices and butter.',
    isJainAvailable: false,
    spiceDefault: 'Punjabi Spicy',
    pageNumber: 2,
  },
  {
    id: 'tan-masala-papad',
    name: 'Masala Papad',
    category: 'tandoori_khazana',
    price: 120,
    description: 'Roasted urad dal papad topped with tangy spiced tomato, cucumber, and coriander salsa.',
    isJainAvailable: true,
    spiceDefault: 'Medium',
    pageNumber: 2,
  },
  {
    id: 'tan-malai-chaap',
    name: 'Malai Chaap',
    category: 'tandoori_khazana',
    price: 230,
    description: 'Creamy soya chaap tossed in rich fresh cream, butter, and mild black pepper.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    isSignature: true,
    pageNumber: 2,
  },
  {
    id: 'tan-achari-chaap',
    name: 'Achari Chaap',
    category: 'tandoori_khazana',
    price: 260,
    description: 'Char-grilled soya chaap marinated in zesty five-spice Punjabi achari masala.',
    isJainAvailable: false,
    spiceDefault: 'Punjabi Spicy',
    pageNumber: 2,
  },
  {
    id: 'tan-stuffed-chaap',
    name: 'Stuffed Chaap',
    category: 'tandoori_khazana',
    price: 280,
    description: 'Soya chaap rolls stuffed with spiced paneer and dry fruits, roasted golden in tandoor.',
    isJainAvailable: false,
    spiceDefault: 'Medium',
    pageNumber: 2,
  },

  // ================= PAGE 2: RICE & PULAO =================
  {
    id: 'rice-plain',
    name: 'Plain Rice',
    category: 'rice_pulao',
    price: 120,
    description: 'Fluffy long-grain aged basmati rice cooked to perfection.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 2,
  },
  {
    id: 'rice-steam',
    name: 'Steam Rice',
    category: 'rice_pulao',
    price: 120,
    description: 'Aromatic steamed basmati rice, ideal accompaniment for Dal Makhni or Rajma.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 2,
  },
  {
    id: 'rice-jeera',
    name: 'Jeera Rice',
    category: 'rice_pulao',
    price: 140,
    description: 'Basmati rice tempered with royal cumin seeds in pure desi ghee and fresh coriander.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 2,
  },
  {
    id: 'rice-veg-pulao',
    name: 'Veg Pulao',
    category: 'rice_pulao',
    price: 170,
    description: 'Fragrant rice cooked with garden peas, carrots, beans, cashews, and whole spices.',
    isJainAvailable: true,
    spiceDefault: 'Medium',
    pageNumber: 2,
  },
  {
    id: 'rice-veg-biryani',
    name: 'Veg Biryani',
    category: 'rice_pulao',
    price: 190,
    description: 'Slow dum-cooked basmati rice layered with spiced vegetables, paneer, mint, and raita.',
    isJainAvailable: false,
    spiceDefault: 'Punjabi Spicy',
    isSignature: true,
    pageNumber: 2,
  },

  // ================= PAGE 2: BREADS =================
  {
    id: 'bread-tawa-roti',
    name: 'Tawa Roti',
    category: 'breads',
    price: 25,
    description: 'Homestyle soft whole-wheat phulka cooked on a hot iron tawa.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 2,
  },
  {
    id: 'bread-butter-tawa-roti',
    name: 'Butter Tawa Roti',
    category: 'breads',
    price: 30,
    description: 'Whole-wheat homestyle tawa phulka brushed generously with butter.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 2,
  },
  {
    id: 'bread-plain-naan',
    name: 'Plain Naan',
    category: 'breads',
    price: 35,
    description: 'Soft leavened flatbread baked on the walls of our traditional clay tandoor.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 2,
  },
  {
    id: 'bread-butter-naan',
    name: 'Butter Naan',
    category: 'breads',
    price: 45,
    description: 'Fluffy clay-oven baked naan glazed with melted butter.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    isSignature: true,
    pageNumber: 2,
  },
  {
    id: 'bread-missi-roti',
    name: 'Missi Roti',
    category: 'breads',
    price: 40,
    description: 'Rustic Punjabi gram-flour and whole-wheat bread seasoned with ajwain and coriander.',
    isJainAvailable: true,
    spiceDefault: 'Medium',
    pageNumber: 2,
  },
  {
    id: 'bread-tandoori-roti',
    name: 'Tandoori Roti',
    category: 'breads',
    price: 30,
    description: 'Crisp whole-wheat flatbread baked directly inside the charcoal tandoor.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 2,
  },
  {
    id: 'bread-garlic-naan',
    name: 'Garlic Naan',
    category: 'breads',
    price: 50,
    description: 'Tandoori naan topped with roasted minced garlic, cilantro, and butter.',
    isJainAvailable: false,
    spiceDefault: 'Medium',
    isSignature: true,
    pageNumber: 2,
  },
  {
    id: 'bread-lachha-paratha',
    name: 'Lachha Paratha',
    category: 'breads',
    price: 70,
    description: 'Multi-layered flaky whole-wheat paratha baked crisp with butter.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 2,
  },
  {
    id: 'bread-aloo-paratha',
    name: 'Aloo Paratha',
    category: 'breads',
    price: 80,
    description: 'Whole-wheat flatbread stuffed with spiced mashed potatoes, served with pickle & curd.',
    isJainAvailable: true,
    spiceDefault: 'Medium',
    pageNumber: 2,
  },
  {
    id: 'bread-paneer-paratha',
    name: 'Paneer Paratha',
    category: 'breads',
    price: 90,
    description: 'Hearty paratha stuffed with grated fresh cottage cheese, green chilies, and herbs.',
    isJainAvailable: true,
    spiceDefault: 'Medium',
    pageNumber: 2,
  },
  {
    id: 'bread-gobhi-paratha',
    name: 'Gobhi Paratha',
    category: 'breads',
    price: 80,
    description: 'Stuffed with grated cauliflower, ginger, and roasted cumin.',
    isJainAvailable: true,
    spiceDefault: 'Medium',
    pageNumber: 2,
  },
  {
    id: 'bread-mix-paratha',
    name: 'Mix Paratha',
    category: 'breads',
    price: 80,
    description: 'Wholesome blend of potato, paneer, cauliflower, and Punjabi spices.',
    isJainAvailable: true,
    spiceDefault: 'Medium',
    pageNumber: 2,
  },
  {
    id: 'bread-tandoori-paratha',
    name: 'Tandoori Paratha',
    category: 'breads',
    price: 90,
    description: 'Stuffed Punjabi paratha roasted crisp in our clay tandoor and topped with white butter.',
    isJainAvailable: true,
    spiceDefault: 'Medium',
    pageNumber: 2,
  },
  {
    id: 'bread-onion-kulcha',
    name: 'Onion Kulcha',
    category: 'breads',
    price: 70,
    description: 'Soft leavened kulcha stuffed with spiced chopped onions and coriander seeds.',
    isJainAvailable: false,
    spiceDefault: 'Medium',
    pageNumber: 2,
  },
  {
    id: 'bread-amritsari-naan',
    name: 'Amritsari Naan',
    category: 'breads',
    price: 70,
    description: 'Crispy flaky stuffed kulcha-naan loaded with spiced potato-paneer filling and crushed coriander.',
    isJainAvailable: true,
    spiceDefault: 'Medium',
    isSignature: true,
    pageNumber: 2,
  },

  // ================= PAGE 2: SALAD & RAITA =================
  {
    id: 'sal-green-salad',
    name: 'Green Salad',
    category: 'salad_raita',
    price: 80,
    description: 'Freshly sliced farm cucumbers, tomatoes, carrots, onions, and lemon wedges.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 2,
  },
  {
    id: 'sal-green-cucumber-salad',
    name: 'Green Cucumber Salad',
    category: 'salad_raita',
    price: 90,
    description: 'Chilled crunchy cucumber rounds tossed with chat masala and fresh lime.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 2,
  },
  {
    id: 'sal-boondi-raita',
    name: 'Boondi Raita',
    category: 'salad_raita',
    price: 90,
    description: 'Whisked chilled curd with crisp gram-flour pearls, roasted jeera, and black salt.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 2,
  },
  {
    id: 'sal-pineapple-raita',
    name: 'Pineapple Raita',
    category: 'salad_raita',
    price: 140,
    description: 'Sweet and tangy chilled yogurt studded with juicy pineapple chunks.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 2,
  },
  {
    id: 'sal-plain-curd',
    name: 'Plain Curd',
    category: 'salad_raita',
    price: 70,
    description: 'Bowl of thick, fresh house-set dairy yogurt.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 2,
  },
  {
    id: 'sal-russian-salad',
    name: 'Russian Salad',
    category: 'salad_raita',
    price: 140,
    description: 'Diced apples, pineapples, green peas, and carrots folded in a creamy dressing.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 2,
  },
  {
    id: 'sal-fruit-salad',
    name: 'Fruit Salad',
    category: 'salad_raita',
    price: 140,
    description: 'Assorted seasonal fresh cut fruits served chilled.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 2,
  },

  // ================= PAGE 2: SWEET & DESSERTS =================
  {
    id: 'des-fruit-custard',
    name: 'Fruit Custard',
    category: 'sweet_desserts',
    price: 120,
    description: 'Chilled creamy vanilla custard loaded with fresh diced fruits and pomegranate.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 2,
  },
  {
    id: 'des-gulab-jamun',
    name: 'Gulab Jamun (2 pcs)',
    category: 'sweet_desserts',
    price: 50,
    description: 'Two warm khoya dumplings soaked in rose and green cardamom sugar syrup.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    isSignature: true,
    pageNumber: 2,
  },
  {
    id: 'des-rasmalai',
    name: 'Rasmalai (2 pcs)',
    category: 'sweet_desserts',
    price: 60,
    description: 'Two soft cottage cheese patties poached in chilled saffron and pistachio rabri milk.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    isSignature: true,
    pageNumber: 2,
  },
  {
    id: 'des-chocolate-brownie',
    name: 'Chocolate Brownie',
    category: 'sweet_desserts',
    price: 130,
    description: 'Warm fudgy dark chocolate walnut brownie drizzled with rich chocolate fudge.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 2,
  },

  // ================= PAGE 2: BURGER =================
  {
    id: 'bur-veg-burger',
    name: 'Veg Burger',
    category: 'burger',
    price: 59,
    description: 'Crispy golden vegetable patty, fresh lettuce, onion, and tangy burger mayo in a sesame bun.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 2,
  },
  {
    id: 'bur-veg-cheese-burger',
    name: 'Veg Cheese Burger',
    category: 'burger',
    price: 79,
    description: 'Classic crispy veg patty topped with a slice of melted cheddar cheese and fresh veggies.',
    isJainAvailable: true,
    spiceDefault: 'Mild',
    pageNumber: 2,
  },
  {
    id: 'bur-paneer-burger',
    name: 'Paneer Burger',
    category: 'burger',
    price: 89,
    description: 'Spiced cottage cheese fillet, crunchy slaw, and tandoori mayo in a toasted bun.',
    isJainAvailable: true,
    spiceDefault: 'Medium',
    pageNumber: 2,
  },
  {
    id: 'bur-crunchy-paneer',
    name: 'Crunchy Paneer Burger',
    category: 'burger',
    price: 149,
    description: 'Extra-crispy panko-crusted thick paneer patty with jalapeno sauce and lettuce.',
    isJainAvailable: true,
    spiceDefault: 'Punjabi Spicy',
    isSignature: true,
    pageNumber: 2,
  },
  {
    id: 'bur-cheese-burst',
    name: 'Cheese Burst Burger',
    category: 'burger',
    price: 159,
    description: 'Double cheese overload burger with molten liquid cheese core and crispy veg-paneer patty.',
    isJainAvailable: true,
    spiceDefault: 'Medium',
    isSignature: true,
    pageNumber: 2,
  },
];

export const INITIAL_USER_PROFILE: UserProfileSettings = {
  fullName: 'Manjeet Singh',
  email: 'manjeet789singh8@gmail.com',
  phone: '+91 98765-43210',
  alternatePhone: '+91 73790-97909',
  preferredLanguage: 'English',
  birthdayMonth: 'October',
  gstNumber: '',
  avatarUrl: '',
  addresses: [
    {
      id: 'addr-1',
      label: 'Home — Keshgarh Sahib Road',
      recipientName: 'Manjeet Singh',
      phone: '+91 98765-43210',
      streetLine: 'House No. 142, Ward 4, Near Gurdwara Takht Sri Keshgarh Sahib',
      landmark: '200m from Main Sarai Gate',
      city: 'Sri Anandpur Sahib, Punjab',
      postalCode: '140118',
      distanceKm: 1.4,
      isDefault: true,
      deliveryInstructions: 'Call on arrival. Please pack extra mint chutney.',
    },
    {
      id: 'addr-2',
      label: 'Office — Near Bus Stand',
      recipientName: 'Manjeet Singh',
      phone: '+91 98765-43210',
      streetLine: 'SCO 18, First Floor, Main Market, Near Bus Stand',
      landmark: 'Opposite State Bank ATM',
      city: 'Sri Anandpur Sahib, Punjab',
      postalCode: '140118',
      distanceKm: 0.4,
      isDefault: false,
      deliveryInstructions: 'Deliver to reception desk on 1st floor.',
    },
    {
      id: 'addr-3',
      label: 'Family Residence — Virasat-e-Khalsa Enclave',
      recipientName: 'Harpreet Kaur',
      phone: '+91 98140-22110',
      streetLine: 'Plot 29, Green Avenue, Near Virasat-e-Khalsa Museum',
      landmark: 'Near Main Park',
      city: 'Sri Anandpur Sahib, Punjab',
      postalCode: '140118',
      distanceKm: 2.6,
      isDefault: false,
      deliveryInstructions: 'Ring doorbell once; dog in courtyard.',
    },
  ],
  preferences: {
    defaultSpiceLevel: 'Medium',
    jainPreparationDefault: false,
    lowOilButterDefault: false,
    avoidNutsCashewGravy: false,
    includeCutleryAndNapkins: true,
    autoHighlightJainItems: false,
    freeDeliveryThresholdReminder: true,
    defaultPaymentMethod: 'UPI (9877932787@fam)',
    upiVpa: '9877932787@fam',
    razorpayUpiVpa: '9877932787@fam',
    notifications: {
      whatsappUpdates: true,
      smsOrderTracking: true,
      emailReceipts: true,
      festiveSpecials: false,
    },
    defaultPortionSize: 'Full',
  },
  favoriteItemIds: [
    'mc-dal-makhni',
    'mc-shahi-paneer',
    'bread-garlic-naan',
    'tan-paneer-tikka',
    'bev-lassi-sweet',
  ],
};

export const INITIAL_ORDERS: OrderRecord[] = [];
