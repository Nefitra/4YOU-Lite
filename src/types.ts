/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ParticipantStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  WITHDRAWN = 'WITHDRAWN',
  REINVESTED = 'REINVESTED',
  BLOCKED = 'BLOCKED'
}

export enum SystemStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  PROCESSING = 'PROCESSING',
  MAINTENANCE = 'MAINTENANCE',
  ERROR = 'ERROR'
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  PROJECT_FEE = 'PROJECT_FEE',
  INTERNAL_REWARD = 'INTERNAL_REWARD',
  WITHDRAWAL = 'WITHDRAWAL',
  REINVEST = 'REINVEST'
}

export interface Participant {
  id: string;
  userId: string;
  username: string;
  walletAddress: string;
  position: number;
  depositAmount: number;
  internalBalance: number;
  totalRewardsReceived: number;
  status: ParticipantStatus;
  createdAt: string;
  completedAt?: string;
  withdrawnTotal: number;
  reinvestedFromId?: string;
  txHashDeposit: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  fromUserId?: string;
  fromUsername?: string;
  toUserId?: string;
  toUsername?: string;
  amount: number;
  txHash: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  createdAt: string;
  metadata?: string;
}

export interface SystemSettings {
  depositAmount: number;
  projectFeeAmount: number;
  rewardPerUser: number;
  targetBalance: number;
  treasuryWalletAddress: string;
  projectWalletAddress: string;
  systemStatus: SystemStatus;
  maintenanceMessage: string;
  luckysBonusBalance: number;
}
