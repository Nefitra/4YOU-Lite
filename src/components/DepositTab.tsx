/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, Info, ArrowUpRight, CheckCircle2, 
  HelpCircle, RefreshCw, AlertCircle, Sparkles, LogIn
} from 'lucide-react';
import { SystemStatus } from '../types';

interface DepositTabProps {
  systemStatus: SystemStatus;
  userWallet: { address: string; ton: number; luckys: number; connected: boolean };
  setUserWallet: React.Dispatch<React.SetStateAction<{ address: string; ton: number; luckys: number; connected: boolean }>>;
  treasuryWalletAddress: string;
  onConfirmDeposit: (amount: number) => void;
  onSetStatusMessage: (msg: string | null) => void;
}

export default function DepositTab({
  systemStatus,
  userWallet,
  setUserWallet,
  treasuryWalletAddress,
  onConfirmDeposit,
  onSetStatusMessage
}: DepositTabProps) {
  const [txState, setTxState] = useState<'WAITING' | 'PROCESSING' | 'CONFIRMED' | 'FAILED'>('WAITING');
  const [simulatedTxHash, setSimulatedTxHash] = useState<string | null>(null);

  const handlePayTON = () => {
    onSetStatusMessage(null);

    if (systemStatus === SystemStatus.PAUSED) {
      alert('The System is currently PAUSED. Deposits are not accepted at this moment.');
      return;
    }

    if (!userWallet.connected) {
      alert('Please connect your TON wallet first!');
      return;
    }

    if (userWallet.ton < 10) {
      alert(`Insufficient funds. You need exactly 10 TON to join the queue. Your current wallet has ${userWallet.ton.toFixed(2)} TON.`);
      return;
    }

    // Begin Simulated transaction loop
    setTxState('PROCESSING');

    // Simulate 2 seconds delay to verify TON network hash
    setTimeout(() => {
      if (Math.random() > 0.05) { // 95% success rate for simulation
        // Generate a random mock tx hash
        const chars = '0123456789abcdef';
        let hash = '0x';
        for (let i = 0; i < 64; i++) {
          hash += chars[Math.floor(Math.random() * chars.length)];
        }

        // Deduct 10 TON and add placeholder $LUCKYS bonus record off-chain (per specs: after successful deposit, user receives configurable $LUCKYS bonus)
        setUserWallet(prev => ({
          ...prev,
          ton: parseFloat((prev.ton - 10.0).toFixed(2)),
          luckys: prev.luckys + 100 // 100 LUCKYS bonus record assigned off-chain
        }));

        setSimulatedTxHash(hash);
        setTxState('CONFIRMED');
        
        // Trigger queue state updates in App state engine
        onConfirmDeposit(10.0);
      } else {
        setTxState('FAILED');
      }
    }, 2000);
  };

  const resetTxStateHandler = () => {
    setTxState('WAITING');
    setSimulatedTxHash(null);
  };

  return (
    <div id="deposit-tab" className="space-y-6 animate-fadeIn">
      {/* Title block */}
      <div>
        <span className="text-[9px] uppercase tracking-[0.25em] text-blue-400 font-black block">Join Queue Pool</span>
        <h3 className="text-white font-black text-sm uppercase tracking-wide flex items-center gap-1.5 mt-0.5">
          <ArrowUpRight className="w-4 h-4 text-blue-400" />
          Active Deposit
        </h3>
      </div>

      {/* Main Form Box */}
      <div className="bg-white/[0.02] border border-white/5 p-5 rounded-[28px] space-y-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-full blur-2xl pointer-events-none" />

        {/* Deposit Specification */}
        <div className="text-center py-6 bg-white/[0.01] border border-white/5 rounded-2xl">
          <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-widest block">Entry Cost Requirements</span>
          <div className="text-4xl font-black text-white mt-1.5 font-display tracking-tight">
            10.0 <span className="text-base text-blue-400 font-bold font-sans">TON</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 max-w-[280px] mx-auto leading-relaxed">
            Your entry deposit activates your position in the line. <strong className="text-white font-semibold">Your internal balance starts from 0 TON.</strong>
          </p>
        </div>

        {/* Address and details */}
        <div className="space-y-3.5 text-xs">
          <div className="flex justify-between items-center text-slate-400">
            <span>Treasury Dest Address:</span>
            <span className="text-slate-250 font-mono select-all text-[11px] font-bold bg-white/5 px-2 py-1 rounded border border-white/5">
              {treasuryWalletAddress.slice(0, 8)}...{treasuryWalletAddress.slice(-8)}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-400">
            <span>Project Fee Allocation (1%):</span>
            <span className="text-slate-300 font-mono">0.1 TON (Off-chain routed)</span>
          </div>

          <div className="flex justify-between items-center text-slate-400">
            <span>Future $LUCKYS Bonus:</span>
            <span className="text-amber-400 font-bold">+100 $L (Off-chain)</span>
          </div>
        </div>

        {/* Transaction state tracking block */}
        <div className="pt-2">
          {txState === 'WAITING' && (
            <button
              onClick={handlePayTON}
              disabled={!userWallet.connected || systemStatus === SystemStatus.PAUSED}
              className={`w-full py-4 rounded-2xl text-[12px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                userWallet.connected && systemStatus !== SystemStatus.PAUSED
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:brightness-110 active:scale-[0.99] cursor-pointer shadow-[0_4px_20px_rgba(59,130,246,0.25)]'
                  : 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Wallet className="w-4 h-4" />
              Pay 10 TON via TON Connect
            </button>
          )}

          {txState === 'PROCESSING' && (
            <div className="p-4 bg-blue-500/5 border border-blue-500/20 text-center rounded-2xl space-y-3">
              <RefreshCw className="w-6 h-6 text-blue-500 animate-spin mx-auto" />
              <div>
                <h4 className="text-white text-xs font-black uppercase">Verifying TON Blockchain Transaction</h4>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">Scanning transaction index to avoid duplicate hash</p>
              </div>
            </div>
          )}

          {txState === 'CONFIRMED' && (
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-3.5">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div className="text-left">
                  <h4 className="text-emerald-400 text-xs font-black uppercase leading-none">Deposit Confirmed</h4>
                  <span className="text-[9px] text-slate-500 font-mono mt-1 block">Tx Hash validated successfully</span>
                </div>
              </div>

              <div className="bg-[#080b12] border border-white/5 p-3 rounded-xl text-[10.5px] font-mono text-slate-400 break-all select-all">
                Hashtag: {simulatedTxHash}
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                <div className="bg-white/5 p-2 rounded-xl">
                  <span className="text-slate-500 block">Status:</span>
                  <strong className="text-white uppercase font-bold">Active Slot</strong>
                </div>
                <div className="bg-white/5 p-2 rounded-xl">
                  <span className="text-slate-500 block">Rewards accrued:</span>
                  <strong className="text-amber-400 font-bold">+100 $L Bonus</strong>
                </div>
              </div>

              <button
                onClick={resetTxStateHandler}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-[10.5px] font-bold uppercase cursor-pointer transition-all"
              >
                Deposit Again
              </button>
            </div>
          )}

          {txState === 'FAILED' && (
            <div className="p-4 bg-rose-500/5 border border-rose-500/20 text-center rounded-2xl space-y-3">
              <AlertCircle className="w-5 h-5 text-rose-400 mx-auto" />
              <div>
                <h4 className="text-rose-400 text-xs font-black uppercase">Transaction Failed</h4>
                <p className="text-[10px] text-slate-400 mt-1">TON Network verification timestamp timed out or was rejected.</p>
              </div>
              <button
                onClick={resetTxStateHandler}
                className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-300 rounded-xl text-[10.5px] font-bold uppercase cursor-pointer"
              >
                Retry Request
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-3.5 bg-white/[0.01] border border-white/5 text-[10.5px] text-slate-400 rounded-xl flex items-start gap-2 select-none">
        <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p>
          Each deposit must transfer exactly <strong className="text-white">10 TON</strong>. Our automated system detects the incoming payment to the Treasury parameters and instantly creates your active record row behind the current queue index.
        </p>
      </div>
    </div>
  );
}
