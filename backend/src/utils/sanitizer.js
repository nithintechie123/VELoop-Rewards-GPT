/**
 * Data Sanitization Utilities (Requirement 38: Sensitive Claim Information)
 * 
 * Strict Zero-Trust data sanitizers ensuring sensitive prize claim information
 * (shipping address, phone number, pin code, digital delivery email, notes, private tracking)
 * is NEVER returned through public APIs, public winner lists, URLs, or frontend logs.
 */

/**
 * Sanitize public winner record
 * Strips all personal identifying information (PII) and claim details.
 */
export const sanitizePublicWinner = (winner) => {
  if (!winner) return null;
  return {
    id: winner.id,
    giveawayId: winner.giveawayId,
    giveawayTitle: winner.giveawayTitle || winner.giveawayName || winner.title,
    prizeId: winner.prizeId,
    prizeTitle: winner.prizeTitle || winner.prize?.title,
    prizeValue: winner.prizeValue || winner.prize?.value,
    prizeType: winner.prizeType || winner.prize?.type,
    userId: winner.userId || winner.winnerUserId,
    winnerUserId: winner.winnerUserId || winner.userId,
    userName: winner.userName || winner.winnerName || 'Winner',
    winnerName: winner.winnerName || winner.userName || 'Winner',
    userAvatar: winner.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    userLocation: winner.userLocation || 'Verified Member',
    ticketNumber: winner.ticketNumber || winner.winningTicketId,
    winningTicketId: winner.winningTicketId || winner.ticketNumber,
    selectionMethod: winner.selectionMethod || 'PROVABLY_FAIR_SHA256',
    selectedAt: winner.selectedAt || winner.wonAt,
    wonAt: winner.wonAt || winner.selectedAt,
    isSpotlight: Boolean(winner.isSpotlight),
    claimed: Boolean(winner.claimed),
    claimStatus: winner.claimStatus || (winner.claimed ? 'claimed' : 'unclaimed'),
    proof: winner.proof ? {
      serverSeedHashed: winner.proof.serverSeedHashed,
      serverSeedUnmasked: winner.proof.serverSeedUnmasked,
      clientSeed: winner.proof.clientSeed,
      nonce: winner.proof.nonce,
      winningIndex: winner.proof.winningIndex,
      totalEligibleTickets: winner.proof.totalEligibleTickets,
      resultHash: winner.proof.resultHash
    } : undefined
  };
};

/**
 * Sanitize public giveaway record
 * Ensures attached winner / winners arrays contain ZERO sensitive claim PII.
 */
export const sanitizePublicGiveaway = (giveaway) => {
  if (!giveaway) return null;
  const clone = { ...giveaway };

  // Remove any internal or accidentally attached claim fields
  delete clone.shippingDetails;
  delete clone.claimDetails;
  delete clone.shippingAddress;
  delete clone.phoneNumber;
  delete clone.phone;
  delete clone.address;
  delete clone.city;
  delete clone.state;
  delete clone.pin;
  delete clone.digitalEmail;
  delete clone.notes;

  if (clone.winner) {
    clone.winner = sanitizePublicWinner(clone.winner);
  }
  if (Array.isArray(clone.winners)) {
    clone.winners = clone.winners.map(w => sanitizePublicWinner(w));
  }

  return clone;
};
