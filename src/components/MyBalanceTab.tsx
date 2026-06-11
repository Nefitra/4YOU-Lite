/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  Coins, User, Calendar, Award, ArrowUpRight, 
  HelpCircle, Sparkles, RefreshCw, Layers, Lock, AlertCircle
} from 'lucide-react';
import { Participant, ParticipantStatus, SystemStatus } from '../types';

interface MyBalanceTabProps {
  userWallet: { address: string; ton: number; luckys: number; connected: boolean };
  userParticipant: Participant | null;
  onWithdraw: () => void;
  systemStatus: SystemStatus;
  setActiveTab: (tab: 'HOME' | 'DEPOSIT' | 'BALANCE' | 'QUEUE' | 'WITHDRAW' | 'ADMIN') => void;
}

export default function MyBalanceTab({
  userWallet,
  userParticipant,
  onWithdraw,
  systemStatus,
  setActiveTab
}: MyBalanceTabProps) {
  const targetBalance = 15.0;
  const currentBalance = userParticipant ? userParticipant.internalBalance : 0.0;
  const progressPercent = Math.min(100, (currentBalance / targetBalance) * 100);

  // Math calculated events: 15 / 0.1 = 150 events
  const remainingEvents = userParticipant 
    ? Math.max(0, Math.ceil((targetBalance - userParticipant.totalRewardsReceived) / 0.1))
    : 150;

  return (
    <div id="my-balance-tab" className="space-y-6 animate-fadeIn">
      {/* Tab Header */}
      <div>
        <span className="text-[9px] uppercase tracking-[0.25em] text-blue-400 font-black block">Earnings Hub</span>
        <h3 className="text-white font-black text-sm uppercase tracking-wide flex items-center gap-1.5 mt-0.5">
          <Coins className="w-4 h-4 text-blue-400" />
          My Internal Balance
        </h3>
      </div>

      {userParticipant ? (
        <div className="space-y-5">
          {/* Main Balance card */}
          <div className="bg-gradient-to-r from-blue-950/30 via-[#0a0f1d] to-[#040711] border border-blue-500/15 p-6 rounded-[32px] relative overflow-hidden shadow-lg">
            <div className="absolute top-[-10%] right-[-10%] w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest block leading-none">Internal Accumulator</span>
                <span className="text-2xl font-mono font-black text-white block mt-1.5 leading-none">
                  {currentBalance.toFixed(2)} <span className="text-sm font-sans font-bold text-blue-400">TON</span>
                </span>
                <span className="text-[9.5px] text-slate-500 mt-1 block">Accumulated off-chain rewards</span>
              </div>

              <span className={`text-[9.5px] font-black px-2.5 py-1 rounded-full border tracking-wider uppercase ${
                userParticipant.status === ParticipantStatus.ACTIVE
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : userParticipant.status === ParticipantStatus.COMPLETED
                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                    : 'bg-white/5 border border-white/5 text-slate-400'
              }`}>
                {userParticipant.status}
              </span>
            </div>

            {/* Custom Horizontal Progress Bar */}
            <div className="space-y-2 mt-5">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span className="font-sans font-bold">Progress to Cycle Cap</span>
                <span>{currentBalance.toFixed(1)} / 15.0 TON ({progressPercent.toFixed(0)}%)</span>
              </div>

              <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden p-[1px] border border-white/5 relative">
                <div 
                  style={{ width: `${progressPercent}%` }}
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                />
              </div>

              <span className="text-[10px] text-slate-500 font-medium block">
                {userParticipant.status === ParticipantStatus.COMPLETED 
                  ? '👑 Cycle completed! Maximum 15 TON achieved.'
                  : `*Needs ${remainingEvents} more entry event of +0.1 TON to complete.`}
              </span>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Wallet connected</span>
              <span className="text-[11.5px] font-mono text-slate-300 block mt-1 truncate">
                {userWallet.address.slice(0, 7)}...{userWallet.address.slice(-7)}
              </span>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Queue Position</span>
              <span className="text-sm font-black text-white font-mono block mt-1">
                #{userParticipant.position}
              </span>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Total Earned</span>
              <span className="text-sm font-black text-emerald-400 font-mono block mt-1 font-bold">
                {userParticipant.totalRewardsReceived.toFixed(1)} TON
              </span>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Withdrawn Total</span>
              <span className="text-sm font-black text-blue-400 font-mono block mt-1 font-bold">
                {userParticipant.withdrawnTotal.toFixed(1)} TON
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex gap-2.5">
            <button
              onClick={() => setActiveTab('WITHDRAW')}
              disabled={currentBalance <= 0 || systemStatus === SystemStatus.PAUSED}
              className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all text-center flex items-center justify-center gap-1.5 ${
                currentBalance > 0 && systemStatus === SystemStatus.ACTIVE
                  ? 'bg-blue-600 text-white hover:brightness-110 active:scale-95 cursor-pointer shadow-[0_5px_15px_rgba(59,130,246,0.3)]'
                  : 'bg-white/5 border border-white/5 text-slate-550 cursor-not-allowed'
              }`}
            >
              Withdraw Cash
            </button>

            <button
              disabled
              title="Disabled in Lite version"
              className="py-4 px-4 bg-white/[0.01] border border-white/5 text-slate-600 rounded-2xl text-[10.5px] font-black uppercase tracking-wider cursor-not-allowed flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 flex-shrink-0" />
              Reinvest
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[28px] text-center space-y-5">
          <div className="w-12 h-12 bg-white/5 border border-white/5 rounded-full flex items-center justify-center text-slate-500 mx-auto">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-white font-extrabold text-sm uppercase">No Active Queue Position</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-[260px] mx-auto leading-relaxed">
              You are currently not listed in the active TON allocation ladder. Complete an entry deposit to join the pool.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('DEPOSIT')}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer active:scale-95 shadow-md"
          >
            Deposit 10 TON
          </button>
        </div>
      )}

      {/* Bonus tokens placeholder field per spec (12 & 15. LUCKYS support) */}
      <div className="bg-white/[0.01] border border-white/5 p-4 rounded-2xl flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">Optional Utility Placeholder</span>
          <h4 className="text-xs font-black text-slate-300 uppercase">Off-chain Bonus Token</h4>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono font-black text-amber-500">
            {userWallet.luckys.toLocaleString()} $LUCKYS
          </span>
          <span className="text-[8.5px] text-slate-550 block mt-0.5">Presaved Ecosystem Balance</span>
        </div>
      </div>
    </div>
  );
}
