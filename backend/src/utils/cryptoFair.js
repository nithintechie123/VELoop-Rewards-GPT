import crypto from 'crypto';

/**
 * Provably Fair SHA-256 Engine
 * Formula:
 * Winning Index = hexToDecimal(SHA-256(ServerSeed + ClientSeed + Nonce)) % TotalTickets
 */
export class CryptoFairEngine {
  static generateServerSeed() {
    return crypto.randomBytes(32).toString('hex');
  }

  static hashSeed(seed) {
    return crypto.createHash('sha256').update(seed).digest('hex');
  }

  static calculateWinningTicketIndex(serverSeed, clientSeed, nonce, totalTickets) {
    if (!totalTickets || totalTickets <= 0) {
      throw new Error('Total tickets must be greater than 0');
    }

    const combinedString = `${serverSeed}:${clientSeed}:${nonce}`;
    const resultHash = crypto.createHash('sha256').update(combinedString).digest('hex');

    const subHex = resultHash.substring(0, 8);
    const decimalValue = parseInt(subHex, 16);
    const winningIndex = decimalValue % totalTickets;

    return {
      serverSeedHashed: this.hashSeed(serverSeed),
      serverSeedUnmasked: serverSeed,
      clientSeed,
      nonce,
      combinedString,
      resultHash,
      decimalValue,
      totalTickets,
      winningIndex
    };
  }

  static verifyProof(serverSeed, clientSeed, nonce, totalTickets, expectedWinningIndex) {
    const calc = this.calculateWinningTicketIndex(serverSeed, clientSeed, nonce, totalTickets);
    return {
      isValid: calc.winningIndex === expectedWinningIndex,
      calculatedIndex: calc.winningIndex,
      expectedIndex: expectedWinningIndex,
      hash: calc.resultHash
    };
  }
}
