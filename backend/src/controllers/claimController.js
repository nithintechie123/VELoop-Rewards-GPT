import mongoose from 'mongoose';
import { db } from '../data/store.js';
import { AuditLogger } from '../utils/logger.js';
import { PrizeClaim } from '../models/PrizeClaim.js';
import { GiveawayWinner } from '../models/GiveawayWinner.js';
import { AuditService } from '../services/auditService.js';

const isMongo = () => mongoose.connection.readyState === 1;

/**
 * Server-Side Validation for Physical Prize Claims (Requirement 36)
 * Strictly validates all 6 mandatory physical shipping fields:
 * 1. Name: Non-empty string, min 2 chars
 * 2. Phone: Valid telephone number pattern (min 8 digits)
 * 3. Address: Valid street address line, min 5 chars
 * 4. City: Non-empty valid city name, min 2 chars
 * 5. State: Non-empty valid state name, min 2 chars
 * 6. PIN: Valid postal PIN code (3-10 alphanumeric or Indian 6-digit PIN)
 */
export const validatePhysicalShippingDetails = (body = {}, authUser = null, verifiedWinner = null) => {
  const errors = {};
  const missingFields = [];

  const rawName = body.fullName || body.name || body.shippingDetails?.fullName || body.shippingDetails?.name;
  const rawPhone = body.phoneNumber || body.phone || body.shippingDetails?.phoneNumber || body.shippingDetails?.phone;
  const rawAddress = body.address || body.street || body.addressLine1 || body.shippingDetails?.address || body.shippingDetails?.addressLine1;
  const rawCity = body.city || body.shippingDetails?.city;
  const rawState = body.state || body.shippingDetails?.state;
  const rawPin = body.pin || body.pincode || body.postalCode || body.zipCode || body.shippingDetails?.pin || body.shippingDetails?.pincode;

  // 1. Name Validation
  if (!rawName || typeof rawName !== 'string' || rawName.trim().length < 2) {
    missingFields.push('fullName');
    errors.fullName = 'Name is required and must be at least 2 characters.';
  }

  // 2. Phone Validation
  const cleanPhone = rawPhone ? String(rawPhone).trim().replace(/[\s\-\(\)]/g, '') : '';
  if (!cleanPhone || cleanPhone.length < 8) {
    missingFields.push('phoneNumber');
    errors.phoneNumber = 'Phone number is required and must contain at least 8 digits.';
  } else if (!/^\+?[0-9]{8,15}$/.test(cleanPhone)) {
    errors.phoneNumber = 'Phone number format is invalid.';
  }

  // 3. Address Validation
  if (!rawAddress || typeof rawAddress !== 'string' || rawAddress.trim().length < 5) {
    missingFields.push('address');
    errors.address = 'Address is required and must be at least 5 characters.';
  }

  // 4. City Validation
  if (!rawCity || typeof rawCity !== 'string' || rawCity.trim().length < 2) {
    missingFields.push('city');
    errors.city = 'City is required and must be at least 2 characters.';
  }

  // 5. State Validation
  if (!rawState || typeof rawState !== 'string' || rawState.trim().length < 2) {
    missingFields.push('state');
    errors.state = 'State is required and must be at least 2 characters.';
  }

  // 6. PIN Validation
  const cleanPin = rawPin ? String(rawPin).trim().replace(/\s+/g, '') : '';
  if (!cleanPin || cleanPin.length < 3) {
    missingFields.push('pin');
    errors.pin = 'PIN code is required.';
  } else if (!/^[A-Za-z0-9\-]{3,10}$/.test(cleanPin)) {
    errors.pin = 'PIN code format is invalid.';
  }

  const isValid = missingFields.length === 0 && Object.keys(errors).length === 0;

  return {
    isValid,
    missingFields,
    errors,
    validatedShippingInfo: {
      fullName: rawName?.trim() || '',
      phoneNumber: rawPhone ? String(rawPhone).trim() : '',
      address: rawAddress?.trim() || '',
      city: rawCity?.trim() || '',
      state: rawState?.trim() || '',
      pin: cleanPin
    }
  };
};

/**
 * Server-Side Validation for Gift Card & Digital Claims (Requirement 37)
 * Validates digital delivery email address format against strict RFC standard.
 */
export const validateGiftCardDeliveryDetails = (body = {}, authUser = null) => {
  const errors = {};
  const missingFields = [];

  const rawEmail = body.digitalEmail || body.email || body.claimDetails?.digitalEmail;

  if (!rawEmail || typeof rawEmail !== 'string' || !rawEmail.trim()) {
    missingFields.push('digitalEmail');
    errors.digitalEmail = 'Delivery email address is required for gift card fulfillment.';
  } else {
    const emailTrimmed = rawEmail.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!emailRegex.test(emailTrimmed) || emailTrimmed.length > 254) {
      missingFields.push('digitalEmail');
      errors.digitalEmail = 'Please provide a valid delivery email address (e.g. user@domain.com).';
    }
  }

  const isValid = missingFields.length === 0 && Object.keys(errors).length === 0;

  return {
    isValid,
    missingFields,
    errors,
    validatedDigitalInfo: {
      digitalEmail: rawEmail ? rawEmail.trim().toLowerCase() : ''
    }
  };
};

/**
 * Determine required claim information based on server-evaluated prize type
 */
export const determineRequiredFields = (prizeType) => {
  const normType = String(prizeType || 'PHYSICAL').toUpperCase();
  if (normType === 'PHYSICAL') {
    return {
      prizeType: 'PHYSICAL',
      claimType: 'shipping_address',
      requiredFields: ['fullName', 'phoneNumber', 'address', 'city', 'state', 'pin'],
      optionalFields: ['notes']
    };
  }
  if (['GIFT_CARD', 'DIGITAL_VOUCHER', 'DIGITAL_KEY', 'DIGITAL', 'AMAZON', 'AMAZON_GIFT_CARD'].includes(normType)) {
    return {
      prizeType: 'GIFT_CARD',
      claimType: 'digital_email',
      requiredFields: ['digitalEmail'],
      optionalFields: ['fullName', 'phoneNumber', 'notes']
    };
  }
  if (normType === 'GAMING_CODE') {
    return {
      prizeType: 'GAMING_CODE',
      claimType: 'gamer_tag',
      requiredFields: ['gamerTag', 'digitalEmail'],
      optionalFields: ['fullName', 'notes']
    };
  }
  return {
    prizeType: normType,
    claimType: 'shipping_address',
    requiredFields: ['fullName', 'phoneNumber', 'address', 'city', 'state', 'pin'],
    optionalFields: ['notes']
  };
};

/**
 * Get Claim Requirements & Evaluation (Requirement 35)
 * GET /api/giveaways/:giveawayId/claim-requirements or GET /api/claim/:id/requirements
 */
export const getClaimRequirements = async (req, res, next) => {
  try {
    const { id, giveawayId } = req.params;
    const targetId = giveawayId || id;
    const authenticatedUserId = req.user?.id || req.user?.userId || req.headers['x-user-id'];

    if (!authenticatedUserId) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Authentication required to inspect claim requirements.'
      });
    }

    const authUser = db.getUserById(authenticatedUserId);
    const authId = authUser?.id || authenticatedUserId;
    const authUserId = authUser?.userId || authenticatedUserId;

    // Stage 1 & 2: Authenticated User & Winner Check
    const allArchiveWinners = db.getArchiveWinners();
    const allWinnerLookup = db.state.winnerLookup || [];
    let targetGiveaway = db.getGiveawayById(targetId) || db.getGiveaways().find(g => g.slug === targetId || g.id === targetId);

    let candidateWinners = [
      ...allArchiveWinners,
      ...allWinnerLookup
    ].filter(w =>
      w.giveawayId === targetId ||
      w.id === targetId ||
      (targetGiveaway && w.giveawayId === targetGiveaway.id)
    );

    if (candidateWinners.length === 0 && targetGiveaway?.winners?.length > 0) {
      candidateWinners = targetGiveaway.winners;
    } else if (candidateWinners.length === 0 && targetGiveaway?.winner) {
      candidateWinners = [targetGiveaway.winner];
    }

    const verifiedWinner = candidateWinners.find(w =>
      w.userId === authId ||
      w.userId === authUserId ||
      w.winnerUserId === authId ||
      w.winnerUserId === authUserId
    );

    if (!verifiedWinner) {
      return res.status(403).json({
        error: 'FORBIDDEN_CLAIM',
        message: 'Access denied: You are not a verified winner for this giveaway.',
        isWinner: false
      });
    }

    // Stage 3: Which Prize?
    const prizeId = verifiedWinner.prizeId || targetGiveaway?.prizes?.[0]?.id || `prize_${targetGiveaway?.id || 'main'}`;
    const prizeTitle = verifiedWinner.prizeTitle || targetGiveaway?.title || 'Exclusive Reward';
    const prizeValue = verifiedWinner.prizeValue || targetGiveaway?.value || '₹0';

    // Stage 4: Prize Type?
    const rawPrizeType = verifiedWinner.prizeType || targetGiveaway?.prizeType || targetGiveaway?.type || 'PHYSICAL';
    const requirements = determineRequiredFields(rawPrizeType);

    // Stage 5: Required Information
    res.json({
      success: true,
      pipeline: {
        step1_authenticatedUser: { id: authId, userId: authUserId, name: authUser?.name || verifiedWinner.userName },
        step2_isWinner: true,
        step3_whichPrize: { prizeId, prizeTitle, prizeValue },
        step4_prizeType: requirements.prizeType,
        step5_requiredInformation: requirements.requiredFields
      },
      claimRequirements: {
        prizeId,
        prizeTitle,
        prizeValue,
        prizeType: requirements.prizeType,
        claimType: requirements.claimType,
        requiredFields: requirements.requiredFields,
        optionalFields: requirements.optionalFields
      },
      alreadyClaimed: Boolean(verifiedWinner.claimed)
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Submit Prize Claim with 5-Stage Determination Pipeline (Requirement 34 & 35)
 * Pipeline: Authenticated User -> Winner? -> Which Prize? -> Prize Type? -> Required Information
 * POST /api/giveaways/:giveawayId/claim
 */
export const submitClaim = async (req, res, next) => {
  try {
    const { id, giveawayId } = req.params;
    const targetId = giveawayId || id;

    // -------------------------------------------------------------
    // STAGE 1: Authenticated User
    // -------------------------------------------------------------
    const authenticatedUserId = req.user?.id || req.user?.userId || req.headers['x-user-id'];

    if (!authenticatedUserId) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Authentication required to claim prizes.'
      });
    }

    const authUser = db.getUserById(authenticatedUserId);
    const authId = authUser?.id || authenticatedUserId;
    const authUserId = authUser?.userId || authenticatedUserId;

    // -------------------------------------------------------------
    // STAGE 2: Winner? (Server-Authoritative Winner Resolution)
    // -------------------------------------------------------------
    const allArchiveWinners = db.getArchiveWinners();
    const allWinnerLookup = db.state.winnerLookup || [];
    let targetGiveaway = db.getGiveawayById(targetId) || db.getGiveaways().find(g => g.slug === targetId || g.id === req.body?.giveawayId || g.id === targetId);

    // Find candidate winner record(s) for this giveaway or winnerId
    let candidateWinners = [
      ...allArchiveWinners,
      ...allWinnerLookup
    ].filter(w =>
      w.giveawayId === targetId ||
      w.id === targetId ||
      (targetGiveaway && w.giveawayId === targetGiveaway.id) ||
      (req.body?.giveawayId && w.giveawayId === req.body.giveawayId) ||
      (req.body?.winnerId && w.id === req.body.winnerId)
    );

    // Fallback to giveaway.winner / giveaway.winners if archive list is pending
    if (candidateWinners.length === 0 && targetGiveaway) {
      if (targetGiveaway.winners && targetGiveaway.winners.length > 0) {
        candidateWinners = targetGiveaway.winners;
      } else if (targetGiveaway.winner) {
        candidateWinners = [targetGiveaway.winner];
      }
    }

    // If MongoDB is available, query GiveawayWinner
    if (candidateWinners.length === 0 && isMongo()) {
      try {
        const mongoWinners = await GiveawayWinner.find({
          $or: [
            { giveawayId: targetId },
            { id: targetId },
            { giveawayId: targetGiveaway?.id },
            { id: req.body?.winnerId }
          ]
        }).lean();
        if (mongoWinners && mongoWinners.length > 0) {
          candidateWinners = mongoWinners;
        }
      } catch {}
    }

    if (candidateWinners.length === 0) {
      return res.status(404).json({
        error: 'WINNER_RECORD_NOT_FOUND',
        message: 'No finalized winner record found for this giveaway.'
      });
    }

    // Verify authenticatedUserId === winner.userId
    const verifiedWinner = candidateWinners.find(w =>
      w.userId === authId ||
      w.userId === authUserId ||
      w.winnerUserId === authId ||
      w.winnerUserId === authUserId
    );

    if (!verifiedWinner) {
      await AuditService.logFraudFlagged({
        userId: authId,
        giveawayId: targetGiveaway?.id || candidateWinners[0]?.giveawayId || targetId,
        riskScore: 75,
        riskLevel: 'HIGH',
        reason: `Unauthorized prize claim attempt: User ${authId} is not a verified winner for this prize`,
        action: 'BLOCKED',
        signals: {
          authenticatedUserId: authId,
          targetGiveawayId: targetGiveaway?.id || targetId,
          submittedWinnerId: req.body?.winnerId || null,
          submittedUserId: req.body?.userId || null
        }
      });

      AuditLogger.warn(`[CLAIM BLOCKED] Unauthorized prize claim attempt by non-winner ${authId} on giveaway ${targetId}`);
      return res.status(403).json({
        error: 'FORBIDDEN_CLAIM',
        message: 'Access denied: Only the verified winner can claim this prize.'
      });
    }

    // Prevent Duplicate Claims for Already Claimed Prizes
    const existingClaim = db.state.claims.find(c =>
      c.giveawayId === verifiedWinner.giveawayId &&
      (c.userId === authId || c.userId === authUserId) &&
      (c.prizeId === verifiedWinner.prizeId || !c.prizeId || !verifiedWinner.prizeId)
    );

    if (verifiedWinner.claimed || existingClaim) {
      return res.status(400).json({
        error: 'ALREADY_CLAIMED',
        message: 'This prize has already been claimed and is being processed.',
        claim: existingClaim || verifiedWinner
      });
    }

    // -------------------------------------------------------------
    // STAGE 3: Which Prize? (Server-Determined Prize Record)
    // -------------------------------------------------------------
    const prizeId = verifiedWinner.prizeId || targetGiveaway?.prizes?.[0]?.id || `prize_${targetGiveaway?.id || 'main'}`;
    const prizeTitle = verifiedWinner.prizeTitle || targetGiveaway?.title || 'Exclusive Reward';
    const prizeValue = verifiedWinner.prizeValue || targetGiveaway?.value || '₹0';

    // -------------------------------------------------------------
    // STAGE 4: Prize Type? (Strictly Server-Determined - Zero Trust Frontend type)
    // Requirement 37: The backend determines the prize type instead of trusting type = amazon from frontend
    // -------------------------------------------------------------
    const rawPrizeType = verifiedWinner.prizeType || targetGiveaway?.prizeType || targetGiveaway?.prizes?.[0]?.type || targetGiveaway?.type || 'PHYSICAL';
    const { prizeType, claimType, requiredFields } = determineRequiredFields(rawPrizeType);

    // -------------------------------------------------------------
    // STAGE 5: Required Information Validation (Requirements 36 & 37)
    // -------------------------------------------------------------
    const body = req.body || {};
    let shippingInfo = {};

    if (prizeType === 'PHYSICAL') {
      const physicalValidation = validatePhysicalShippingDetails(body, authUser, verifiedWinner);
      if (!physicalValidation.isValid) {
        return res.status(400).json({
          error: 'MISSING_REQUIRED_INFORMATION',
          message: `Physical prize claim requires complete shipping details: ${physicalValidation.missingFields.join(', ')}`,
          prizeType: 'PHYSICAL',
          requiredFields,
          missingFields: physicalValidation.missingFields,
          fieldErrors: physicalValidation.errors
        });
      }

      shippingInfo = {
        fullName: physicalValidation.validatedShippingInfo.fullName,
        phoneNumber: physicalValidation.validatedShippingInfo.phoneNumber,
        address: physicalValidation.validatedShippingInfo.address,
        city: physicalValidation.validatedShippingInfo.city,
        state: physicalValidation.validatedShippingInfo.state,
        pin: physicalValidation.validatedShippingInfo.pin,
        digitalEmail: body.digitalEmail || body.email || authUser?.email || '',
        gamerTag: body.gamerTag || '',
        notes: body.notes || ''
      };
    } else if (prizeType === 'GIFT_CARD' || prizeType === 'DIGITAL') {
      const giftCardValidation = validateGiftCardDeliveryDetails(body, authUser);
      if (!giftCardValidation.isValid) {
        return res.status(400).json({
          error: 'MISSING_REQUIRED_INFORMATION',
          message: giftCardValidation.errors.digitalEmail || 'Digital gift card claim requires a valid delivery email address (digitalEmail).',
          prizeType: 'GIFT_CARD',
          requiredFields,
          missingFields: giftCardValidation.missingFields,
          fieldErrors: giftCardValidation.errors
        });
      }

      shippingInfo = {
        fullName: body.fullName || body.shippingDetails?.fullName || verifiedWinner.userName || authUser?.name || 'Verified Winner',
        phoneNumber: body.phoneNumber || body.shippingDetails?.phoneNumber || authUser?.shippingAddress?.phone || '',
        address: '',
        city: '',
        state: '',
        pin: '',
        digitalEmail: giftCardValidation.validatedDigitalInfo.digitalEmail,
        gamerTag: body.gamerTag || '',
        notes: body.notes || ''
      };
    } else {
      shippingInfo = {
        fullName: body.fullName || body.shippingDetails?.fullName || verifiedWinner.userName || authUser?.name || 'Verified Winner',
        phoneNumber: body.phoneNumber || body.shippingDetails?.phoneNumber || '',
        address: body.address || '',
        city: body.city || '',
        state: body.state || '',
        pin: body.pin || '',
        digitalEmail: body.digitalEmail || body.email || authUser?.email || '',
        gamerTag: body.gamerTag || '',
        notes: body.notes || ''
      };
    }

    // Fulfillment Tracking Generation
    const trackingNumber = prizeType === 'PHYSICAL'
      ? `FDX-${Math.floor(10000000 + Math.random() * 90000000)}-IN`
      : `VCH-${Math.floor(10000000 + Math.random() * 90000000)}-CODE`;

    const claimDoc = {
      id: `claim_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
      giveawayId: verifiedWinner.giveawayId,
      prizeId,
      winnerId: verifiedWinner.id,
      userId: authId,
      userFullName: shippingInfo.fullName,
      winnerName: shippingInfo.fullName,
      prize: prizeTitle,
      prizeTitle,
      prizeValue,
      prizeType,
      claimType,
      ticket: verifiedWinner.winningTicketId || verifiedWinner.ticketNumber,
      trackingNumber,
      carrier: prizeType === 'PHYSICAL' ? 'FedEx Priority' : 'VELOOP Digital Instant Delivery',
      estimatedDelivery: new Date(Date.now() + (prizeType === 'PHYSICAL' ? 5 : 0) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      shippingDetails: shippingInfo,
      claimDetails: shippingInfo,
      status: 'PROCESSING',
      statusStep: 1,
      claimedAt: new Date().toISOString()
    };

    db.addClaim(claimDoc);

    // Update verified winner record across storage layers
    verifiedWinner.claimed = true;
    verifiedWinner.claimStatus = 'claimed';
    verifiedWinner.trackingNumber = trackingNumber;
    db.save();

    db.updateWinnerRecord(authId, {
      claimed: true,
      claimStatus: 'claimed',
      trackingNumber
    });
    if (authUserId && authUserId !== authId) {
      db.updateWinnerRecord(authUserId, {
        claimed: true,
        claimStatus: 'claimed',
        trackingNumber
      });
    }

    if (isMongo()) {
      try {
        await PrizeClaim.create(claimDoc);
        await GiveawayWinner.updateOne(
          { id: verifiedWinner.id },
          { $set: { claimed: true, claimStatus: 'claimed', trackingNumber } }
        );
      } catch {}
    }

    // Audit Logging
    await AuditService.logClaimSubmitted({
      userId: authId,
      giveawayId: verifiedWinner.giveawayId,
      giveawayTitle: claimDoc.prizeTitle,
      prizeId: verifiedWinner.prizeId || claimDoc.id,
      claimType: claimDoc.claimType,
      shippingDetails: claimDoc.shippingDetails,
      transactionId: claimDoc.trackingNumber,
      ipAddress: req.headers['x-forwarded-for'] || req.ip || '127.0.0.1'
    });

    AuditLogger.info(`Prize claim successfully verified & registered for winner ${authId} on giveaway ${verifiedWinner.giveawayId} (Tracking: ${trackingNumber})`);

    res.json({
      success: true,
      message: 'Prize claim successfully verified and submitted for fulfillment.',
      determinedPrize: {
        prizeId,
        prizeTitle,
        prizeValue,
        prizeType,
        claimType
      },
      claim: claimDoc
    });
  } catch (err) {
    next(err);
  }
};

export const getClaimStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const authenticatedUserId = req.user?.id || req.user?.userId || req.headers['x-user-id'];
    const isAdmin = req.user?.role === 'admin' || req.headers['x-role'] === 'admin';

    if (!authenticatedUserId && !isAdmin) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Authentication required to access claim information.'
      });
    }

    const authUser = db.getUserById(authenticatedUserId);
    const authId = authUser?.id || authenticatedUserId;
    const authUserId = authUser?.userId || authenticatedUserId;

    const claim = db.state.claims.find(c => {
      const matchesTarget = c.id === id || c.giveawayId === id || c.trackingNumber === id;
      if (!matchesTarget) return false;
      if (isAdmin) return true;
      return c.userId === authId || c.userId === authUserId;
    });

    if (!claim) {
      return res.status(404).json({
        error: 'CLAIM_NOT_FOUND',
        message: 'No authorized claim record found for this request'
      });
    }

    res.json({ success: true, claim });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin Claim Retrieval (Requirement 38)
 * Only authorized backend processes/admins can access bulk claim records.
 */
export const getAdminClaims = async (req, res, next) => {
  try {
    const isAdmin = req.user?.role === 'admin' || req.headers['x-role'] === 'admin';
    if (!isAdmin) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'Access denied: Only authorized administrators and backend fulfillment processes may access claim records.'
      });
    }

    const claims = db.state.claims || [];
    res.json({
      success: true,
      total: claims.length,
      claims
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Authenticated User's Claim for a Specific Giveaway (Requirement 39)
 * GET /api/giveaways/:id/my-claim
 */
export const getMyClaim = async (req, res, next) => {
  try {
    const { id } = req.params;
    const authenticatedUserId = req.user?.id || req.user?.userId || req.headers['x-user-id'];

    if (!authenticatedUserId) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Authentication required to inspect prize claim.'
      });
    }

    const authUser = db.getUserById(authenticatedUserId);
    const authId = authUser?.id || authenticatedUserId;
    const authUserId = authUser?.userId || authenticatedUserId;

    const giveaway = db.getGiveawayById(id) || db.getGiveaways().find(g => g.slug === id || g.id === id);
    const targetGiveawayId = giveaway?.id || id;

    const claim = db.state.claims.find(c =>
      (c.giveawayId === targetGiveawayId || c.giveawayId === id || c.id === id) &&
      (c.userId === authId || c.userId === authUserId)
    );

    if (!claim) {
      return res.status(404).json({
        error: 'CLAIM_NOT_FOUND',
        message: 'No claim record found for this giveaway.'
      });
    }

    res.json({
      success: true,
      claim
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin Process Claim Fulfillment (Requirement 48)
 * PATCH /api/claims/:id/process or PATCH /api/claims/:id
 */
export const processClaim = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, carrier, trackingNumber, notes } = req.body || {};

    const claim = db.state.claims.find(c => c.id === id || c.giveawayId === id || c.trackingNumber === id);
    if (!claim) {
      return res.status(404).json({
        error: 'CLAIM_NOT_FOUND',
        message: 'No claim record found to process.'
      });
    }

    if (status) claim.status = status;
    if (carrier) claim.carrier = carrier;
    if (trackingNumber) claim.trackingNumber = trackingNumber;
    if (notes) claim.notes = notes;
    claim.updatedAt = new Date().toISOString();

    db.save();

    AuditLogger.info(`[ADMIN] Claim ${claim.id} status updated to ${claim.status} by admin.`);

    res.json({
      success: true,
      message: `Claim status successfully updated to ${claim.status}`,
      claim
    });
  } catch (err) {
    next(err);
  }
};


