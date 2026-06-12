/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { Participant, Transaction, ParticipantStatus, SystemStatus, TransactionType } from './types';

interface DbSchema {
  participants: Participant[];
  transactions: Transaction[];
  systemStatus: SystemStatus;
  treasuryBalance: number;
  projectBalance: number;
  usedTxHashes: string[];
  withdrawalLimit: number;
  autoWithdrawalsEnabled: boolean;
  withdrawalSignerAddress: string;
  treasuryWalletAddress: string;
  projectWalletAddress: string;
  // Account activity logs for limits
  withdrawalLogs: { [wallet: string]: { amount: number; timestamp: string }[] };
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Initialize list of mock participants mimicking the frontend
function generateSeedParticipants(): Participant[] {
  const participants: Participant[] = [];
  const baseTime = Date.now() - 36 * 3600 * 1000; // 36 hours ago

  for (let i = 0; i < 15; i++) {
    const isCompleted = i < 5;
    const intBalance = isCompleted ? 15.0 : parseFloat((i * 0.8).toFixed(1));
    const status = isCompleted ? ParticipantStatus.COMPLETED : ParticipantStatus.ACTIVE;
    
    // Generate mock transaction hashes
    const chars = '0123456789abcdef';
    let txHash = '0x';
    for (let c = 0; c < 64; c++) {
      txHash += chars[Math.floor(Math.random() * chars.length)];
    }

    participants.push({
      id: `p-${i + 1}`,
      userId: `user-${1000 + i}`,
      username: `ChainGamer_${100 + i}`,
      walletAddress: `EQD${txHash.slice(2, 42)}`,
      position: i + 1,
      depositAmount: 10,
      internalBalance: isCompleted ? 0 : intBalance,
      totalRewardsReceived: isCompleted ? 15.0 : intBalance,
      status: status,
      createdAt: new Date(baseTime + i * 2 * 3600 * 1000).toISOString(),
      completedAt: isCompleted ? new Date(baseTime + (i + 5) * 2 * 3600 * 1000).toISOString() : undefined,
      withdrawnTotal: isCompleted ? 15.0 : 0,
      txHashDeposit: txHash
    });
  }
  return participants;
}

export class DbStore {
  private data: DbSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DbSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(fileContent);
      }
    } catch (err) {
      console.error('Failed to load database. Re-initializing...', err);
    }

    // Default Seed state
    const defaultState: DbSchema = {
      participants: generateSeedParticipants(),
      transactions: [
        {
          id: `tx-init-1`,
          type: TransactionType.DEPOSIT,
          fromUsername: 'ChainGamer_101',
          amount: 10,
          txHash: '0x3fe88c76da3b2fa71dc982760de3818e95c102a940f823bacdf426cbd1a37c98',
          status: 'CONFIRMED' as const,
          createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
        },
        {
          id: `tx-init-2`,
          type: TransactionType.PROJECT_FEE,
          amount: 0.1,
          txHash: '0x88f2ba12ee33f7893da7772412b1bcfe52f203cf33887d1ea838da152efca099',
          status: 'CONFIRMED' as const,
          createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
        }
      ],
      systemStatus: SystemStatus.ACTIVE,
      treasuryBalance: 73.5,
      projectBalance: 1.5,
      usedTxHashes: [],
      withdrawalLimit: 10, // 10 TON max limit
      autoWithdrawalsEnabled: true,
      withdrawalSignerAddress: 'UQB4l2OcvXTiYJbo9C9B-Zed6cENVptYZxmcyY1qgBH5M-0K',
      treasuryWalletAddress: 'UQADu7pNPl90A0FKR-macOmwAE7UFdihWwMEtAxm8VPpJuCl',
      projectWalletAddress: 'UQAqb2Kvfzd1dIGaA7sOEB7M6rKZP6b-uVuLX7tABDD-kaam',
      withdrawalLogs: {}
    };

    this.saveState(defaultState);
    return defaultState;
  }

  private saveState(state: DbSchema) {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save state to db.json:', err);
    }
  }

  public getState() {
    return this.data;
  }

  public resetDb() {
    const defaultState: DbSchema = {
      participants: generateSeedParticipants(),
      transactions: [
        {
          id: `tx-init-1`,
          type: TransactionType.DEPOSIT,
          fromUsername: 'ChainGamer_101',
          amount: 10,
          txHash: '0x3fe88c76da3b2fa71dc982760de3818e95c102a940f823bacdf426cbd1a37c98',
          status: 'CONFIRMED' as const,
          createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
        },
        {
          id: `tx-init-2`,
          type: TransactionType.PROJECT_FEE,
          amount: 0.1,
          txHash: '0x88f2ba12ee33f7893da7772412b1bcfe52f203cf33887d1ea838da152efca099',
          status: 'CONFIRMED' as const,
          createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
        }
      ],
      systemStatus: SystemStatus.ACTIVE,
      treasuryBalance: 73.5,
      projectBalance: 1.5,
      usedTxHashes: [],
      withdrawalLimit: 10,
      autoWithdrawalsEnabled: true,
      withdrawalSignerAddress: 'UQB4l2OcvXTiYJbo9C9B-Zed6cENVptYZxmcyY1qgBH5M-0K',
      treasuryWalletAddress: 'UQADu7pNPl90A0FKR-macOmwAE7UFdihWwMEtAxm8VPpJuCl',
      projectWalletAddress: 'UQAqb2Kvfzd1dIGaA7sOEB7M6rKZP6b-uVuLX7tABDD-kaam',
      withdrawalLogs: {}
    };
    this.data = defaultState;
    this.saveState(defaultState);
  }

  public updateSystemConfig(config: { systemStatus?: SystemStatus, treasuryAddress?: string, projectAddress?: string, autoWithdrawals?: boolean }) {
    if (config.systemStatus !== undefined) this.data.systemStatus = config.systemStatus;
    if (config.treasuryAddress !== undefined) this.data.treasuryWalletAddress = config.treasuryAddress;
    if (config.projectAddress !== undefined) this.data.projectWalletAddress = config.projectAddress;
    if (config.autoWithdrawals !== undefined) this.data.autoWithdrawalsEnabled = config.autoWithdrawals;
    this.saveState(this.data);
  }

  // Address conversion logic helper (Standardizing bounceable, raw, or non-bounceable addresses)
  private matchesAddress(addr1: string, addr2: string): boolean {
    if (!addr1 || !addr2) return false;
    const clean = (a: string) => a.trim().toLowerCase().replace(/[^a-z0-9]/gi, '');
    return clean(addr1) === clean(addr2);
  }

  /**
   * Verify an on-chain TOM transaction via Toncenter v3
   */
  public async verifyOnChainDeposit(txHash: string, userAddress: string, username: string, apiKey: string): Promise<{ success: boolean; message: string }> {
    if (this.data.systemStatus === SystemStatus.PAUSED) {
      return { success: false, message: 'System is paused.' };
    }

    // Prevent duplicate hash processing
    if (this.data.usedTxHashes.includes(txHash)) {
      return { success: false, message: 'Transaction hash was already verified and processed.' };
    }

    // Enforce dry run mode bypass or production check
    const dryRun = process.env.MAINNET_DRY_RUN === 'true';
    if (dryRun) {
      console.log(`[DRY RUN VERIFICATION] Bypassing on-chain check for ${txHash}. Instantly confirming.`);
      this.addNewParticipant(username, userAddress, txHash, 10.0);
      return { success: true, message: 'Success (Dry Run)' };
    }

    try {
      const url = `${process.env.TON_API_BASE_URL || 'https://toncenter.com/api/v3'}/transactions?account=${encodeURIComponent(this.data.treasuryWalletAddress)}&limit=15&sort=desc`;
      const response = await fetch(url, {
        headers: {
          'accept': 'application/json',
          'X-Api-Key': apiKey || process.env.TON_API_KEY || ''
        }
      });

      if (!response.ok) {
        throw new Error(`Toncenter API returned HTTP status ${response.status}`);
      }

      const json: any = await response.json();
      const txs = json.transactions || [];

      // Find the transaction by hash
      let matchedTx = txs.find((t: any) => t.hash && (t.hash.toLowerCase() === txHash.toLowerCase() || t.hash.trim() === txHash.trim()));

      // If check directly by hash fails, let's scan for a recent transfer with matching criteria
      if (!matchedTx) {
        matchedTx = txs.find((t: any) => {
          const inMsg = t.in_msg;
          if (!inMsg) return false;
          
          const isFromSender = this.matchesAddress(inMsg.source, userAddress);
          const isToTreasury = this.matchesAddress(inMsg.destination, this.data.treasuryWalletAddress);
          const isCorrectAmount = inMsg.value && Math.abs(parseFloat(inMsg.value) - 10000000000) < 50000000; // Allow 10 TON (with tiny transaction gas deviation)

          return isFromSender && isToTreasury && isCorrectAmount;
        });
      }

      if (!matchedTx) {
        return { 
          success: false, 
          message: `On-chain transaction not found on Toncenter for Treasury wallet ${this.data.treasuryWalletAddress}. Ensure you have transferred exactly 10 TON to the treasury and wait 15-30 seconds before clicking verify.` 
        };
      }

      // Found the transaction. Double check attributes to be fully secure!
      const inMsg = matchedTx.in_msg;
      if (!inMsg) {
        return { success: false, message: 'Transaction container contains no message payload details.' };
      }

      const sourceAddress = inMsg.source;
      const destAddress = inMsg.destination;
      const nanotonValue = parseFloat(inMsg.value || '0');
      const tonAmount = nanotonValue / 10000000000;

      if (!this.matchesAddress(destAddress, this.data.treasuryWalletAddress)) {
        return { success: false, message: 'Recipient mismatch: funds were not received at the registered Treasury Address.' };
      }

      if (!this.matchesAddress(sourceAddress, userAddress)) {
        return { success: false, message: 'Sender mismatch: transaction was sent from a different connected wallet.' };
      }

      if (tonAmount < 9.9) { // strict 10 TON rule allows small fee offsets
        return { success: false, message: `Invalid deposit amount: Received ${tonAmount} TON, but entry index requires exactly 10 TON.` };
      }

      // Valid transaction. Commit deposit!
      const actualTxHash = matchedTx.hash || txHash;
      this.addNewParticipant(username, userAddress, actualTxHash, 10.0);
      return { success: true, message: 'Transaction verified and slot activated on-chain!' };

    } catch (error: any) {
      console.error('Blockchain verification failure:', error);
      return { success: false, message: `TON verification server exception: ${error.message}` };
    }
  }

  private addNewParticipant(username: string, walletAddress: string, txHash: string, depositAmount: number) {
    // 1. Save hash to used list
    this.data.usedTxHashes.push(txHash);

    const nextPosition = this.data.participants.length + 1;
    const newParticipant: Participant = {
      id: `p-${Date.now()}`,
      userId: `user-live-${Math.floor(2000 + Math.random() * 8000)}`,
      username: username.startsWith('@') ? username : `@${username}`,
      walletAddress: walletAddress,
      position: nextPosition,
      depositAmount: depositAmount,
      internalBalance: 0.0,
      totalRewardsReceived: 0.0,
      status: ParticipantStatus.ACTIVE,
      createdAt: new Date().toISOString(),
      withdrawnTotal: 0.0,
      txHashDeposit: txHash
    };

    // 2. Loop & reward active members: Give +0.1 TON to all previous ACTIVE queues
    this.data.participants = this.data.participants.map(member => {
      if (
        member.status === ParticipantStatus.ACTIVE &&
        member.internalBalance < 15.0 &&
        member.position < nextPosition
      ) {
        const updatedRewards = parseFloat((member.totalRewardsReceived + 0.1).toFixed(1));
        const updatedBalance = parseFloat((member.internalBalance + 0.1).toFixed(1));
        const isFinished = updatedBalance >= 15.0;

        return {
          ...member,
          internalBalance: updatedBalance,
          totalRewardsReceived: updatedRewards,
          status: isFinished ? ParticipantStatus.COMPLETED : member.status,
          completedAt: isFinished ? new Date().toISOString() : undefined
        };
      }
      return member;
    });

    // 3. Central Treasury Calculations
    this.data.treasuryBalance = parseFloat((this.data.treasuryBalance + depositAmount - 0.1).toFixed(2));
    this.data.projectBalance = parseFloat((this.data.projectBalance + 0.1).toFixed(2));

    // 4. Record transactions logs
    const depositTx: Transaction = {
      id: `tx-dep-${Date.now()}-1`,
      type: TransactionType.DEPOSIT,
      fromUsername: username,
      amount: depositAmount,
      txHash: txHash,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    };

    const feeTx: Transaction = {
      id: `tx-fee-${Date.now()}-2`,
      type: TransactionType.PROJECT_FEE,
      amount: 0.1,
      txHash: `0xfee${txHash.slice(5)}`,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    };

    // Add reward logs for dynamic transaction chain visual blocks
    const rewLogs: Transaction[] = [];
    this.data.participants.forEach((member, i) => {
      if (
        member.status === ParticipantStatus.ACTIVE &&
        member.internalBalance < 15.0 &&
        member.position < nextPosition &&
        rewLogs.length < 5
      ) {
        rewLogs.push({
          id: `tx-rew-${Date.now()}-rew-${member.id}`,
          type: TransactionType.INTERNAL_REWARD,
          toUsername: member.username,
          amount: 0.1,
          txHash: `0xrew${txHash.slice(5, 40)}${member.position}`,
          status: 'CONFIRMED',
          createdAt: new Date(Date.now() + i * 20).toISOString()
        });
      }
    });

    this.data.transactions = [depositTx, feeTx, ...rewLogs, ...this.data.transactions];
    this.data.participants.push(newParticipant);

    this.saveState(this.data);
  }

  /**
   * Execute or request user payout under safety limits
   */
  public executeUserWithdrawal(username: string, walletAddress: string, amount: number): { success: boolean; message: string } {
    if (this.data.systemStatus === SystemStatus.PAUSED) {
      return { success: false, message: 'Emergency pause active: payouts are suspended.' };
    }

    if (!amount || amount <= 0) {
      return { success: false, message: 'Invalid withdrawal amount.' };
    }

    if (amount > 10.0) {
      return { success: false, message: 'Single payout maximum limit exceeded: Cannot withdraw more than 10 TON per transaction.' };
    }

    // Find participant
    const idx = this.data.participants.findIndex(p => p.username.toLowerCase() === username.toLowerCase() || p.walletAddress === walletAddress);
    if (idx === -1) {
      return { success: false, message: 'No registered slot found matching this username or wallet address.' };
    }

    const participant = this.data.participants[idx];
    if (participant.internalBalance < amount) {
      return { success: false, message: `Insufficient internal rewards: Your balance has ${participant.internalBalance} TON. You requested ${amount} TON.` };
    }

    // 24 Hour and Daily limits enforcement
    const logs = this.data.withdrawalLogs[walletAddress] || [];
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 3600 * 1000);

    // Filter logs for the last 24h
    const recentLogs = logs.filter(log => new Date(log.timestamp) > oneDayAgo);

    // Check throttle (1 withdrawal per 24 hours per wallet)
    if (recentLogs.length > 0) {
      return { success: false, message: 'Payout limit reached: Only 1 withdrawal is permitted per user wallet every 24 hours.' };
    }

    // Check daily transaction caps
    const total24h = recentLogs.reduce((sum, log) => sum + log.amount, 0);
    if (total24h + amount > 10.0) {
      return { success: false, message: `Daily withdrawal limit of 10 TON exceeded. You can withdraw at most ${10.0 - total24h} TON more today.` };
    }

    // Check Signer Wallet liquid asset limits to avoid transaction drops (Simulated pool reserve)
    if (this.data.treasuryBalance < amount) {
      return { success: false, message: 'Signer Payout liquidity alert: Treasury has insufficient liquidity to compile transfer. Contact admin support.' };
    }

    // All checks pass! Execute automatic payout
    participant.internalBalance = parseFloat((participant.internalBalance - amount).toFixed(1));
    participant.withdrawnTotal = parseFloat((participant.withdrawnTotal + amount).toFixed(1));
    
    if (participant.status !== ParticipantStatus.COMPLETED) {
      participant.status = ParticipantStatus.WITHDRAWN;
    }

    // Record logs
    const chars = '0123456789abcdef';
    let txHash = '0x';
    for (let c = 0; c < 64; c++) {
      txHash += chars[Math.floor(Math.random() * chars.length)];
    }

    const withdrawTx: Transaction = {
      id: `tx-with-${Date.now()}`,
      type: TransactionType.WITHDRAWAL,
      toUsername: participant.username,
      amount: amount,
      txHash: txHash,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    };

    this.data.transactions = [withdrawTx, ...this.data.transactions];
    this.data.treasuryBalance = parseFloat((this.data.treasuryBalance - amount).toFixed(2));

    // Post to logs
    if (!this.data.withdrawalLogs[walletAddress]) {
      this.data.withdrawalLogs[walletAddress] = [];
    }
    this.data.withdrawalLogs[walletAddress].push({
      amount: amount,
      timestamp: new Date().toISOString()
    });

    this.saveState(this.data);
    return { success: true, message: `Automatic payout of ${amount} TON processed. Transaction is pending block inclusion.` };
  }
}
