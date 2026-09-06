import mongoose from 'mongoose';

const RuleSchema = new mongoose.Schema({
  terms: [{ type: String }],
  minAge: { type: Number, default: 18 },
  prohibitedRegions: [{ type: String }],
  maxEntriesPerUser: { type: Number, default: 100 },
  fairnessPolicy: { type: String, default: 'SHA-256 Provably Fair Commitment' }
}, { _id: false });

const EligibilitySchema = new mongoose.Schema({
  minTier: { type: String, default: 'Member' },
  requireVerification: { type: Boolean, default: false },
  allowedCountries: [{ type: String, default: ['IN', 'US', 'GB', 'GLOBAL'] }],
  minBalanceRequired: { type: Number, default: 0 }
}, { _id: false });

const PrizeItemSchema = new mongoose.Schema({
  id: { type: String },
  title: { type: String, required: true },
  name: { type: String },
  tier: { type: String, default: 'Tier 1' },
  type: { type: String, default: 'PHYSICAL', enum: ['PHYSICAL', 'GIFT_CARD', 'DIGITAL_KEY', 'EXPERIENCE'] },
  value: { type: String, default: '₹0' },
  valueUSD: { type: Number, default: 0 },
  image: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  claimInstructions: { type: String, default: 'Provide verified delivery details within 7 days.' }
}, { _id: false });

const ParticipationSettingsSchema = new mongoose.Schema({
  entryFee: { type: Number, default: 250 },
  entryFeeUnit: { type: String, default: 'VEs', enum: ['VEs', 'SVEs', 'Tokens'] },
  allowsFreeDaily: { type: Boolean, default: true },
  maxTicketsPerBatch: { type: Number, default: 100 },
  poolCap: { type: Number, default: 25000 },
  currentTickets: { type: Number, default: 0 }
}, { _id: false });

const GiveawaySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  name: { type: String },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  status: { 
    type: String, 
    default: 'ACTIVE', 
    enum: ['UPCOMING', 'ACTIVE', 'ENDED', 'ARCHIVED', 'upcoming', 'active', 'ended', 'archived', 'draft', 'drawing'],
    uppercase: true,
    index: true
  },
  statusLabel: { type: String, default: 'Giveaway Live' },
  
  // Date Fields (with compatibility aliases)
  startAt: { type: Date, default: Date.now },
  endAt: { type: Date, required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  endsAt: { type: Date, required: true },

  // Rich Configuration Sub-Documents
  rules: { type: RuleSchema, default: () => ({}) },
  eligibility: { type: EligibilitySchema, default: () => ({}) },
  prizes: [{ type: PrizeItemSchema }],
  participationSettings: { type: ParticipationSettingsSchema, default: () => ({}) },

  // Presentation & Legacy Top-Level Fields for UI Direct Binding
  isHero: { type: Boolean, default: false },
  category: { type: String, default: 'Tech' },
  prizeTier: { type: String, default: 'Featured' },
  position: { type: Number, default: 1 },
  prizeType: { type: String, default: 'PHYSICAL', enum: ['PHYSICAL', 'GIFT_CARD', 'DIGITAL_KEY', 'EXPERIENCE'] },
  claimType: { type: String, default: 'shipping_address' },
  badge: { type: String, default: '' },
  image: { type: String, required: true },
  value: { type: String, default: '₹0' },
  valueUSD: { type: Number, default: 0 },
  winnerCount: { type: Number, default: 1 },
  winnerLabel: { type: String, default: '1 Winner' },
  totalTicketsEntered: { type: Number, default: 0 },
  totalTickets: { type: Number, default: 0 },
  poolCap: { type: Number, default: 25000 },
  entryFee: { type: Number, default: 250 },
  entryFeeUnit: { type: String, default: 'VEs', enum: ['VEs', 'SVEs', 'Tokens'] },
  joiningRequirement: { type: String, default: '250 VEs' },

  // Provably Fair Cryptographic Commitments
  serverSeed: { type: String, required: true },
  serverSeedHash: { type: String, required: true },
  clientSeed: { type: String, default: 'VELOOP_COMMUNITY_PUBLIC_SEED' },
  winnerName: { type: String },
  winningTicket: { type: String }
}, {
  timestamps: true // Automatically creates createdAt and updatedAt
});

export const Giveaway = mongoose.models.Giveaway || mongoose.model('Giveaway', GiveawaySchema);
