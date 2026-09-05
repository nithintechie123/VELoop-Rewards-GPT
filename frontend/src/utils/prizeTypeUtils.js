/**
 * prizeTypeUtils.js
 * Centralized, reusable prize-type configuration and business logic.
 * Eliminates scattered ad-hoc string checks (e.g. `if (prize === "Amazon")`).
 */

export const PRIZE_TYPES = Object.freeze({
  PHYSICAL: 'PHYSICAL',
  GIFT_CARD: 'GIFT_CARD',
  DIGITAL_KEY: 'DIGITAL_KEY',
  EXPERIENCE: 'EXPERIENCE'
});

export const FULFILLMENT_METHODS = Object.freeze({
  SHIPPING: 'SHIPPING',
  EMAIL_DISPATCH: 'EMAIL_DISPATCH',
  INSTANT_REDEEM: 'INSTANT_REDEEM',
  DIRECT_CREDIT: 'DIRECT_CREDIT'
});

/**
 * Structured configurations for each prize type
 */
export const PRIZE_TYPE_CONFIGS = Object.freeze({
  [PRIZE_TYPES.PHYSICAL]: {
    type: PRIZE_TYPES.PHYSICAL,
    label: 'Physical Hardware',
    shortLabel: 'Physical',
    badgeText: 'PHYSICAL SHIPMENT',
    fulfillmentMethod: FULFILLMENT_METHODS.SHIPPING,
    requiresShippingAddress: true,
    requiresDigitalEmail: false,
    requiresGamerTag: false,
    deliveryEstimate: '3-5 Business Days',
    dispatchDescription: 'Insured express door-to-door courier with live SMS & AWB tracking.',
    iconName: 'Package',
    tagColor: 'purple',
    claimFields: ['fullName', 'phoneNumber', 'address', 'city', 'state', 'pin'],
    claimHeaderTitle: 'Enter Delivery Address',
    claimHeaderSubtitle: 'Your prize will be securely packaged and dispatched via insured courier.'
  },
  [PRIZE_TYPES.GIFT_CARD]: {
    type: PRIZE_TYPES.GIFT_CARD,
    isGiftCard: true,
    label: 'Digital Gift Voucher',
    shortLabel: 'Gift Card',
    badgeText: 'INSTANT DIGITAL VOUCHER',
    fulfillmentMethod: FULFILLMENT_METHODS.EMAIL_DISPATCH,
    requiresShippingAddress: false,
    requiresDigitalEmail: true,
    requiresGamerTag: false,
    deliveryEstimate: 'Instant Delivery (< 15 mins)',
    dispatchDescription: '100% verified digital gift voucher code delivered directly to your email inbox.',
    iconName: 'CreditCard',
    tagColor: 'orange',
    claimFields: ['fullName', 'digitalEmail'],
    claimHeaderTitle: 'Enter Redemption Email',
    claimHeaderSubtitle: 'The 16-digit voucher code and PIN will be sent directly to your verified inbox.'
  },
  [PRIZE_TYPES.DIGITAL_KEY]: {
    type: PRIZE_TYPES.DIGITAL_KEY,
    label: 'Digital Game/License Key',
    shortLabel: 'Digital Key',
    badgeText: 'INSTANT LICENSE CODE',
    fulfillmentMethod: FULFILLMENT_METHODS.INSTANT_REDEEM,
    requiresShippingAddress: false,
    requiresDigitalEmail: true,
    requiresGamerTag: true,
    deliveryEstimate: 'Instant Activation (< 5 mins)',
    dispatchDescription: 'Official license activation key sent to email and linked directly to your gaming ID.',
    iconName: 'Key',
    tagColor: 'emerald',
    claimFields: ['fullName', 'digitalEmail', 'gamerTag'],
    claimHeaderTitle: 'Account & Activation Details',
    claimHeaderSubtitle: 'Your official activation license key will be dispatched and registered.'
  },
  [PRIZE_TYPES.EXPERIENCE]: {
    type: PRIZE_TYPES.EXPERIENCE,
    label: 'VIP Experience / Pass',
    shortLabel: 'VIP Pass',
    badgeText: 'VIP CONCIERGE PASS',
    fulfillmentMethod: FULFILLMENT_METHODS.DIRECT_CREDIT,
    requiresShippingAddress: false,
    requiresDigitalEmail: true,
    requiresGamerTag: false,
    deliveryEstimate: '24-48 Hours Concierge Contact',
    dispatchDescription: 'Our VIP rewards concierge will contact you with booking confirmation & travel itineraries.',
    iconName: 'Sparkles',
    tagColor: 'gold',
    claimFields: ['fullName', 'phoneNumber', 'digitalEmail'],
    claimHeaderTitle: 'Concierge Contact Info',
    claimHeaderSubtitle: 'Provide your contact info so our VIP concierge can finalize your experience.'
  }
});

/**
 * Normalizes input (object, type string, or title) to standard PRIZE_TYPES key.
 * Used for backwards-compatibility or dynamic mock data lookups.
 *
 * @param {object|string} prizeIdentifier
 * @returns {string} One of PRIZE_TYPES (PHYSICAL, GIFT_CARD, DIGITAL_KEY, EXPERIENCE)
 */
export function normalizePrizeType(prizeIdentifier) {
  if (!prizeIdentifier) return PRIZE_TYPES.PHYSICAL;

  // If already an object with explicit prizeType / type
  if (typeof prizeIdentifier === 'object') {
    const rawType = prizeIdentifier.prizeType || prizeIdentifier.type || prizeIdentifier.claimType;
    if (rawType) {
      const up = String(rawType).toUpperCase().replace(/[-_]/g, '');
      if (up.includes('GIFT') || up.includes('CARD') || up.includes('VOUCHER') || up.includes('DIGITALEMAIL')) {
        return PRIZE_TYPES.GIFT_CARD;
      }
      if (up.includes('KEY') || up.includes('GAME') || up.includes('LICENSE') || up.includes('SOFTWARE')) {
        return PRIZE_TYPES.DIGITAL_KEY;
      }
      if (up.includes('EXPERIENCE') || up.includes('PASS') || up.includes('VIP')) {
        return PRIZE_TYPES.EXPERIENCE;
      }
      if (up.includes('PHYSICAL') || up.includes('SHIPPING')) {
        return PRIZE_TYPES.PHYSICAL;
      }
    }
    // Check title/name inside object if no explicit type
    const title = prizeIdentifier.name || prizeIdentifier.title || prizeIdentifier.prize || '';
    return normalizePrizeType(title);
  }

  // String lookup
  const str = String(prizeIdentifier).toUpperCase();
  if (PRIZE_TYPE_CONFIGS[str]) {
    return str;
  }

  const lower = String(prizeIdentifier).toLowerCase();
  if (
    lower.includes('gift card') ||
    lower.includes('amazon') ||
    lower.includes('voucher') ||
    lower.includes('wallet') ||
    lower.includes('coupon') ||
    lower.includes('flipkart') ||
    lower.includes('apple store card')
  ) {
    return PRIZE_TYPES.GIFT_CARD;
  }

  if (
    lower.includes('steam') ||
    lower.includes('game pass') ||
    lower.includes('key') ||
    lower.includes('license') ||
    lower.includes('subscription') ||
    lower.includes('membership')
  ) {
    return PRIZE_TYPES.DIGITAL_KEY;
  }

  if (lower.includes('trip') || lower.includes('pass') || lower.includes('concert') || lower.includes('vip')) {
    return PRIZE_TYPES.EXPERIENCE;
  }

  return PRIZE_TYPES.PHYSICAL;
}

/**
 * Returns complete configuration metadata for a prize
 *
 * @param {object|string} prize
 * @returns {object} Prize type configuration
 */
export function getPrizeTypeConfig(prize) {
  const normalizedType = normalizePrizeType(prize);
  return PRIZE_TYPE_CONFIGS[normalizedType] || PRIZE_TYPE_CONFIGS[PRIZE_TYPES.PHYSICAL];
}

/**
 * Helper predicates
 */
export function isPhysicalPrize(prize) {
  return normalizePrizeType(prize) === PRIZE_TYPES.PHYSICAL;
}

export function isGiftCardPrize(prize) {
  return normalizePrizeType(prize) === PRIZE_TYPES.GIFT_CARD;
}

export function isDigitalPrize(prize) {
  const type = normalizePrizeType(prize);
  return type === PRIZE_TYPES.GIFT_CARD || type === PRIZE_TYPES.DIGITAL_KEY;
}

export function getClaimRequiredFields(prize) {
  const config = getPrizeTypeConfig(prize);
  return config.claimFields;
}

export const CURRENCY_TYPES = Object.freeze({
  VES: 'VEs',
  SVES: 'SVEs',
  TOKENS: 'Tokens'
});

/**
 * Requirement 89: Currency-Specific Validation
 * Validates whether a user's wallet has sufficient balance in the giveaway's required currency:
 * - iPhone: VEs >= 250
 * - Apple Watch: VEs >= 200
 * - AirPods: SVEs >= 500
 * - ₹2,000 Amazon Voucher: VEs >= 500
 * - ₹500 Amazon Voucher: VEs >= 300
 * - ₹20 Flash Voucher: Tokens >= 2,000
 *
 * @param {object} userState
 * @param {object} giveaway
 * @returns {object} Validation result
 */
export function validateUserCurrencyBalance(userState = {}, giveaway = {}) {
  const feeUnit = giveaway.entryFeeUnit || 'VEs';
  const feeAmount = giveaway.entryFee || giveaway.coinCost || 250;

  let currentBalance = 0;
  if (feeUnit === 'SVEs') {
    currentBalance = userState.sveCoins !== undefined ? userState.sveCoins : 1200;
  } else if (feeUnit === 'Tokens') {
    currentBalance = userState.tokens !== undefined ? userState.tokens : 5000;
  } else {
    // Default VEs (VELoop Coins)
    currentBalance = userState.veloopCoins !== undefined ? userState.veloopCoins : 850;
  }

  const isValid = currentBalance >= feeAmount;
  const difference = feeAmount - currentBalance;

  return {
    feeUnit,
    feeAmount,
    currentBalance,
    isValid,
    hasEnoughBalance: isValid,
    difference: difference > 0 ? difference : 0,
    statusText: isValid ? `✓ You have enough ${feeUnit}` : `⚠️ Insufficient ${feeUnit}`,
    descriptionText: isValid
      ? `Your ${feeUnit} balance (${currentBalance.toLocaleString()} ${feeUnit}) meets the entry requirement.`
      : `You need ${difference.toLocaleString()} more ${feeUnit} to participate.`
  };
}
