import { PRIZE_TYPES } from '../utils/prizeTypeUtils';

/**
 * Standardized Giveaway Data Structures
 * Conforms to production REST API response specifications.
 *
 * Prize Configuration Schema (Requirement 37, 69):
 * - id: "PRIZE-001"
 * - name: "iPhone 15 Pro"
 * - position: 1 (or "1st Prize")
 * - image: "/assets/images/iphone_titanium.jpg"
 * - description: "Latest iPhone 15 Pro 128GB with Aerospace-grade Titanium chassis."
 * - winnerCount: 1
 * - prizeType: PRIZE_TYPES.PHYSICAL | PRIZE_TYPES.GIFT_CARD | PRIZE_TYPES.DIGITAL_KEY
 * - claimType: "shipping_address" | "digital_email"
 */

/**
 * Standard Prize Configurations (Requirement 37, 69)
 */
export const mockPrizes = [
  {
    id: "PRIZE-001",
    name: "iPhone 15 Pro",
    title: "iPhone 15 Pro",
    position: 1,
    tier: "1st Prize",
    image: "/assets/images/iphone_titanium.jpg",
    description: "Latest iPhone 15 Pro 128GB with Aerospace-grade Titanium chassis and A17 Pro chip.",
    model: "128GB Natural Titanium",
    winnerCount: 1,
    winnerLabel: "1 Winner",
    type: "physical",
    prizeType: PRIZE_TYPES.PHYSICAL,
    claimType: "shipping_address",
    value: "₹1,34,900",
    valueUSD: 134900,
    accentTheme: "purple",
    badge: "1st Prize",
    isGiftCard: false,
    isInstantWin: false
  },
  {
    id: "PRIZE-002",
    name: "Apple Watch Series 9",
    title: "Apple Watch Series 9",
    position: 2,
    tier: "2nd Prize",
    image: "/assets/images/luxury_smartwatch.jpg",
    description: "Latest Apple Watch Series 9 with Always-On Retina display & S9 SiP precision tracking.",
    model: "GPS 45mm Midnight Aluminum Case",
    winnerCount: 3,
    winnerLabel: "3 Winners",
    type: "physical",
    prizeType: PRIZE_TYPES.PHYSICAL,
    claimType: "shipping_address",
    value: "₹44,900",
    valueUSD: 44900,
    accentTheme: "blue",
    badge: "2nd Prize",
    isGiftCard: false,
    isInstantWin: false
  },
  {
    id: "PRIZE-003",
    name: "AirPods Pro 2",
    title: "AirPods Pro 2",
    position: 3,
    tier: "3rd Prize",
    image: "/assets/images/apple_tech_bundle.jpg",
    description: "Active Noise Cancellation, Adaptive Audio and MagSafe Charging Case (USB-C).",
    model: "MagSafe Charging Case (USB-C)",
    winnerCount: 5,
    winnerLabel: "5 Winners",
    type: "physical",
    prizeType: PRIZE_TYPES.PHYSICAL,
    claimType: "shipping_address",
    value: "₹24,900",
    valueUSD: 24900,
    accentTheme: "green",
    badge: "3rd Prize",
    isGiftCard: false,
    isInstantWin: false
  },
  {
    id: "PRIZE-004",
    name: "₹2,000 Amazon Gift Card",
    title: "Amazon Gift Card",
    position: 4,
    tier: "Lucky Draw",
    image: "/assets/images/rewards_gift_card.jpg",
    description: "₹2,000 Amazon Gift Card redeemable instantly with voucher code sent via email.",
    model: "Instant Digital Redemption",
    winnerCount: 10,
    winnerLabel: "10 Winners",
    type: "digital",
    prizeType: PRIZE_TYPES.GIFT_CARD,
    claimType: "digital_email",
    value: "₹2,000",
    valueUSD: 2000,
    accentTheme: "orange",
    badge: "Lucky Draw",
    isGiftCard: true,
    isInstantWin: true
  }
];

/**
 * Primary Current Giveaway API Response Object (Requirement 36 & 37)
 */
export const mockCurrentGiveawayApiResponse = {
  id: "GW-2026-08",
  title: "Summer Rewards Giveaway",
  status: "active",
  startDate: "2026-08-01T00:00:00.000Z",
  endDate: new Date(Date.now() + 4 * 86400000 + 12 * 3600000).toISOString(),
  endsAt: new Date(Date.now() + 4 * 86400000 + 12 * 3600000).toISOString(),
  participants: 8500,
  totalParticipants: 8500,
  totalTickets: 28450,
  totalTicketsEntered: 28450,
  poolCap: 35000,
  category: "Tech & Lifestyle",
  drawType: "Guaranteed SHA-256 Verified",
  sponsor: "Apple & Amazon Authorized Loyalty Partner",
  badge: "Flagship Mega Draw",
  prizes: mockPrizes
};

/**
 * Flagship Hero Giveaway Model
 */
export const mockHeroGiveaway = {
  id: "GW-2026-08",
  isHero: true,
  title: "Summer Rewards Giveaway - Apple Studio Ultimate Creator Bundle",
  subtitle: "Space Black MacBook Pro M3 Max (36GB/1TB) + Apple 27\" 5K Studio Display + AirPods Max with Smart Case.",
  category: "Tech & Creator",
  filterTag: "high-value",
  image: "/assets/images/apple_tech_bundle.jpg",
  valueUSD: 359999,
  status: "active",
  startDate: "2026-08-01T00:00:00.000Z",
  endDate: new Date(Date.now() + 3 * 86400000 + 14 * 3600000 + 42 * 60000).toISOString(),
  endsAt: new Date(Date.now() + 3 * 86400000 + 14 * 3600000 + 42 * 60000).toISOString(),
  participants: 8500,
  totalParticipants: 8500,
  totalTickets: 18450,
  totalTicketsEntered: 18450,
  poolCap: 25000,
  winnerCount: 1,
  winnerLabel: "1 Winner",
  freeEntryAvailable: true,
  drawType: "Guaranteed SHA-256 Verified",
  sponsor: "Apple Authorized Loyalty Partner",
  badge: "Flagship Mega Draw",
  prizes: mockPrizes
};

/**
 * Individual Active Prize Giveaways (Component Feed)
 */
export const mockActiveGiveaways = [
  {
    id: "gw-iphone-titanium",
    prizeId: "PRIZE-001",
    isHero: false,
    prizeTier: "1st Prize",
    position: 1,
    accentTheme: "purple",
    title: "iPhone 15 Pro",
    name: "iPhone 15 Pro",
    description: "Latest iPhone 15 Pro 128GB with Aerospace-grade Titanium chassis.",
    subtitle: "Latest iPhone 15 Pro 128GB with Aerospace-grade Titanium chassis.",
    type: "physical",
    prizeType: PRIZE_TYPES.PHYSICAL,
    claimType: "shipping_address",
    category: "Flagship Mobile",
    filterTag: "active",
    image: "/assets/images/iphone_titanium.jpg",
    valueUSD: 134900,
    status: "active",
    statusLabel: "Giveaway Live",
    startDate: "2026-08-01T00:00:00.000Z",
    endDate: new Date(Date.now() + 4 * 86400000 + 12 * 3600000 + 25 * 60000).toISOString(),
    endsAt: new Date(Date.now() + 4 * 86400000 + 12 * 3600000 + 25 * 60000).toISOString(),
    participants: 2350,
    totalParticipants: 2350,
    totalTickets: 14210,
    totalTicketsEntered: 14210,
    winnerCount: 1,
    winnerLabel: "1 Winner",
    badge: "1st Prize",
    isInstantWin: false
  },
  {
    id: "gw-smartwatch-titanium",
    prizeId: "PRIZE-002",
    isHero: false,
    prizeTier: "2nd Prize",
    position: 2,
    accentTheme: "blue",
    title: "Apple Watch Series 9",
    name: "Apple Watch Series 9",
    description: "Latest Apple Watch Series 9 with Always-On Retina display & S9 SiP.",
    subtitle: "Latest Apple Watch Series 9 with Always-On Retina display & S9 SiP.",
    type: "physical",
    prizeType: PRIZE_TYPES.PHYSICAL,
    claimType: "shipping_address",
    category: "Luxury Lifestyle",
    filterTag: "active",
    image: "/assets/images/luxury_smartwatch.jpg",
    valueUSD: 44900,
    status: "active",
    statusLabel: "Giveaway Live",
    startDate: "2026-08-01T00:00:00.000Z",
    endDate: new Date(Date.now() + 9 * 86400000 + 6 * 3600000 + 30 * 60000).toISOString(),
    endsAt: new Date(Date.now() + 9 * 86400000 + 6 * 3600000 + 30 * 60000).toISOString(),
    participants: 1840,
    totalParticipants: 1840,
    totalTickets: 8120,
    totalTicketsEntered: 8120,
    winnerCount: 3,
    winnerLabel: "3 Winners",
    badge: "2nd Prize",
    isInstantWin: false
  },
  {
    id: "gw-audio-airpods",
    prizeId: "PRIZE-003",
    isHero: false,
    prizeTier: "3rd Prize",
    position: 3,
    accentTheme: "green",
    title: "AirPods Pro 2",
    name: "AirPods Pro 2",
    description: "Active Noise Cancellation, Adaptive Audio and MagSafe Charging Case (USB-C).",
    subtitle: "Active Noise Cancellation, Adaptive Audio and MagSafe Charging Case (USB-C).",
    type: "physical",
    prizeType: PRIZE_TYPES.PHYSICAL,
    claimType: "shipping_address",
    category: "Audio & Accessories",
    filterTag: "active",
    image: "/assets/images/apple_tech_bundle.jpg",
    valueUSD: 24900,
    status: "active",
    statusLabel: "Giveaway Live",
    startDate: "2026-08-01T00:00:00.000Z",
    endDate: new Date(Date.now() + 7 * 86400000 + 9 * 3600000 + 20 * 60000).toISOString(),
    endsAt: new Date(Date.now() + 7 * 86400000 + 9 * 3600000 + 20 * 60000).toISOString(),
    participants: 3120,
    totalParticipants: 3120,
    totalTickets: 9420,
    totalTicketsEntered: 9420,
    winnerCount: 5,
    winnerLabel: "5 Winners",
    badge: "3rd Prize",
    isInstantWin: false
  },
  {
    id: "gw-gift-card-1000",
    prizeId: "PRIZE-004",
    isHero: false,
    prizeTier: "Lucky Draw",
    position: 4,
    accentTheme: "orange",
    title: "Amazon Gift Card",
    name: "₹2,000 Amazon Gift Card",
    description: "₹2,000 Amazon Gift Card redeemable instantly on Amazon India.",
    subtitle: "₹2,000 Amazon Gift Card redeemable instantly on Amazon India.",
    type: "digital",
    prizeType: PRIZE_TYPES.GIFT_CARD,
    claimType: "digital_email",
    category: "Gift Cards & Cash",
    filterTag: "active",
    image: "/assets/images/rewards_gift_card.jpg",
    valueUSD: 2000,
    status: "active",
    statusLabel: "Lucky Draw",
    startDate: "2026-08-01T00:00:00.000Z",
    endDate: new Date(Date.now() + 5 * 86400000 + 2 * 3600000 + 15 * 60000).toISOString(),
    endsAt: new Date(Date.now() + 5 * 86400000 + 2 * 3600000 + 15 * 60000).toISOString(),
    participants: 1350,
    totalParticipants: 1350,
    totalTickets: 28900,
    totalTicketsEntered: 28900,
    winnerCount: 10,
    winnerLabel: "10 Winners",
    badge: "Lucky Draw",
    isInstantWin: true
  }
];

/**
 * Spotlight Winners Feed
 */
export const mockSpotlightWinners = [
  {
    id: "win-101",
    name: "User VE****94",
    username: "VE****94",
    location: "Karnataka, IN",
    avatarBg: "#10b981",
    prizeName: "Sony PlayStation 5 Pro Gaming Rig",
    prizeVal: "₹1,19,900",
    winningTicket: "#VEL-84920-IN",
    drawDate: "28 Aug 2026",
    quote: "Thought it was too good to be true until the shipment tracking arrived 2 days later. VELoop Rewards is 100% authentic!",
    status: "Delivered & Verified",
    proofHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  },
  {
    id: "win-102",
    name: "User VE****71",
    username: "VE****71",
    location: "Maharashtra, IN",
    avatarBg: "#8b5cf6",
    prizeName: "₹1,00,000 Universal Reward Vault",
    prizeVal: "₹1,00,000",
    winningTicket: "#VEL-73195-IN",
    drawDate: "24 Aug 2026",
    quote: "Redeemed directly to my Amazon account in under 10 minutes. Super seamless verification flow!",
    status: "Digital Code Dispatched",
    proofHash: "7d1b32d2c88f98a28e932997103859664440c946e8b4e78a632c02057d2919d7"
  },
  {
    id: "win-103",
    name: "User VE****53",
    username: "VE****53",
    location: "Delhi NCR, IN",
    avatarBg: "#06b6d4",
    prizeName: "Apple MacBook Air M3 15-inch",
    prizeVal: "₹1,34,900",
    winningTicket: "#VEL-90214-IN",
    drawDate: "19 Aug 2026",
    quote: "Used my daily free ticket and bonus task entries. Cryptographic draw hash matched perfectly!",
    status: "Delivered & Verified",
    proofHash: "3f79bb7b435b05321651daefd374cdc681dc06faa65e374e38337b88ca046dea"
  }
];

/**
 * Historical Archived Winners
 */
export const mockArchiveWinners = [
  {
    id: "arch-01",
    user: "VE****42",
    prize: "iPhone 15 Pro",
    giveawayName: "August Flagship Tech Drop",
    date: "August 10, 2026",
    category: "Flagship Mobile",
    status: "Delivered & Verified",
    val: "₹1,34,900",
    ticket: "#VEL-42190-IN",
    tracking: "FDX-9941-8821"
  },
  {
    id: "arch-02",
    user: "VE****91",
    prize: "Apple Watch",
    giveawayName: "Summer Loyalty Blast",
    date: "August 10, 2026",
    category: "Wearables & Lifestyle",
    status: "Delivered & Verified",
    val: "₹44,900",
    ticket: "#VEL-91823-IN",
    tracking: "FDX-8829-9140"
  },
  {
    id: "arch-03",
    user: "VE****27",
    prize: "AirPods Pro",
    giveawayName: "August Audio Rush",
    date: "August 10, 2026",
    category: "Audio & Accessories",
    status: "Delivered & Verified",
    val: "₹24,900",
    ticket: "#VEL-27041-IN",
    tracking: "UPS-1Z992A0194"
  },
  {
    id: "arch-04",
    user: "VE****93",
    prize: "Sony PlayStation 5 Pro",
    giveawayName: "Monsoon Gaming Fest",
    date: "July 20, 2026",
    category: "Gaming & VR",
    status: "Delivered & Verified",
    val: "₹1,19,900",
    ticket: "#VEL-51209-IN",
    tracking: "INSTANT-CODE-994"
  },
  {
    id: "arch-05",
    user: "VE****65",
    prize: "₹10,000 Amazon Gift Card",
    giveawayName: "Amazon Prime Festive Draw",
    date: "July 08, 2026",
    category: "Gift Cards & Cash",
    status: "Digital Dispatched",
    val: "₹10,000",
    ticket: "#VEL-41908-IN",
    tracking: "AMZN-GIFT-992019"
  }
];

export const mockQuestTasks = [
  {
    id: "task-daily-login",
    title: "Daily Login Streak (Day 4/7)",
    desc: "Log into VELoop Rewards consecutively to boost win probabilities.",
    rewardTickets: 2,
    rewardCoins: 25,
    icon: "Flame",
    completed: true
  },
  {
    id: "task-join-discord",
    title: "Join VELoop VIP Discord Community",
    desc: "Connect your Discord account and claim verified member badge.",
    rewardTickets: 5,
    rewardCoins: 100,
    icon: "Users",
    completed: false
  },
  {
    id: "task-follow-x",
    title: "Follow @VELoopRewards on X",
    desc: "Stay updated on winner announcements and live draw drops.",
    rewardTickets: 3,
    rewardCoins: 50,
    icon: "Twitter",
    completed: false
  },
  {
    id: "task-share-giveaway",
    title: "Share Flagship Giveaway with Friends",
    desc: "Share your unique referral link on WhatsApp or Telegram (+5 tickets per referral).",
    rewardTickets: 10,
    rewardCoins: 200,
    icon: "MessageSquare",
    completed: false
  }
];

export const mockCoinPacks = [
  { coins: 500, tickets: 5, label: "Starter Booster", badge: null },
  { coins: 1000, tickets: 12, label: "Power Pack", badge: "Most Popular" },
  { coins: 2500, tickets: 35, label: "VIP Vault Pack", badge: "Best Value" }
];

export const PrizeTypes = {
  PHYSICAL: 'PHYSICAL',
  GIFT_CARD: 'GIFT_CARD',
  DIGITAL: 'DIGITAL'
};

export const mockWinnerLookup = [
  {
    userId: "VE10025",
    userName: "Alex Thorne",
    prize: "Apple Watch Series 9",
    type: "PHYSICAL",
    prizeType: "PHYSICAL",
    claimType: "shipping_address",
    value: "₹44,900",
    ticket: "#VEL-10025-IN",
    giveawayName: "Summer Rewards",
    isGiftCard: false
  },
  {
    userId: "VE20088",
    userName: "Rohan Verma",
    prize: "₹2,000 Amazon Gift Card",
    type: "GIFT_CARD",
    prizeType: "GIFT_CARD",
    claimType: "digital_email",
    value: "₹2,000",
    ticket: "#VEL-20088-IN",
    giveawayName: "Daily Prime Draw",
    isGiftCard: true
  },
  {
    userId: "VE30077",
    userName: "Maya Chen",
    prize: "1-Year Xbox Game Pass Ultimate & Steam Vault",
    type: "DIGITAL",
    prizeType: "DIGITAL",
    claimType: "digital_license",
    value: "₹18,500",
    ticket: "#VEL-30077-IN",
    giveawayName: "Monsoon Gaming Fest",
    isGiftCard: false
  }
];

