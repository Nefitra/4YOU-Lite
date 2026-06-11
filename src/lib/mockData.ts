/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Participant, ParticipantStatus } from '../types';

export const ENGLISH_USERNAMES = [
  'GoldMiner77', 'ChainBoss', 'SonicTon', 'BlockWalker', 'LuckyStriker', 'GemFinder',
  'MatrixSurfer', 'TMA_Gamer', 'QuantumTon', 'BullRun2026', 'CyberDolphin',
  'GoldenGateTON', 'HyperCrypto', 'NeoTons', 'AlphaHodler', 'NebulaTon',
  'EtherRider', 'SolWhale', 'DefiSamurai', 'GasSlayer', 'BlockWizard', 'JettonShaman'
];

export function generateTxHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

export function generateRandomUsername(): string {
  const base = ENGLISH_USERNAMES[Math.floor(Math.random() * ENGLISH_USERNAMES.length)];
  return base + '_' + Math.floor(100 + Math.random() * 900);
}

export function generateInitialParticipants(): Participant[] {
  const participants: Participant[] = [];
  const baseTime = Date.now() - 36 * 3600 * 1000; // 36 hours ago

  // Create 15 active/completed participants to pre-populate the queue
  for (let i = 0; i < 15; i++) {
    const isCompleted = i < 5; // First 5 are completed (already achieved target 15 TON)
    const intBalance = isCompleted ? 15.0 : parseFloat((i * 0.8).toFixed(1));
    const status = isCompleted ? ParticipantStatus.COMPLETED : ParticipantStatus.ACTIVE;
    
    participants.push({
      id: `p-${i + 1}`,
      userId: `user-${1000 + i}`,
      username: generateRandomUsername(),
      walletAddress: `EQD${generateTxHash().slice(2, 42)}`,
      position: i + 1,
      depositAmount: 10,
      internalBalance: isCompleted ? 0 : intBalance, // reset back to 0 if they withdrew, but total rewards received tracks overall gain
      totalRewardsReceived: isCompleted ? 15.0 : intBalance,
      status: status,
      createdAt: new Date(baseTime + i * 2 * 3600 * 1000).toISOString(),
      completedAt: isCompleted ? new Date(baseTime + (i + 5) * 2 * 3600 * 1000).toISOString() : undefined,
      withdrawnTotal: isCompleted ? 15.0 : 0,
      txHashDeposit: generateTxHash()
    });
  }
  return participants;
}
