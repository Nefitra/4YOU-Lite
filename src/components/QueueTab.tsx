/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Layers, Lock, CheckCircle2, Zap, Hourglass, Coins, AlertCircle, Share2 } from 'lucide-react';
import { Participant, ParticipantStatus, Transaction } from '../types';
import TransactionChain from './TransactionChain';

interface QueueTabProps {
  participants: Participant[];
  userWallet: { address: string; ton: number; luckys: number };
  userParticipant: Participant | null;
  transactions: Transaction[];
}

export default function QueueTab({
  participants,
  userWallet,
  userParticipant,
  transactions
}: QueueTabProps) {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [viewMode, setViewMode] = useState<'LIST' | 'CHAIN'>('CHAIN');

  const filteredParticipants = participants
    .filter(p => {
      if (statusFilter === 'ALL') return true;
      return p.status === statusFilter;
    })
    .sort((a, b) => b.position - a.position); // newest positions first (simulates a rolling live board)

  const totalCount = participants.length;
  const activeCount = participants.filter(p => p.status === ParticipantStatus.ACTIVE).length;
  const completedCount = participants.filter(p => p.status === ParticipantStatus.COMPLETED).length;

  return (
    <div id="queue-tab" className="space-y-6 animate-fadeIn">
      {/* Header Info */}
      <div>
        <span className="text-[9px] uppercase tracking-[0.25em] text-blue-400 font-black block">Live Ledger</span>
        <h3 className="text-white font-black text-sm uppercase tracking-wide flex items-center gap-1.5 mt-0.5">
          <Users className="w-4 h-4 text-blue-400" />
          Queue Map Tracker
        </h3>
      </div>

      {/* Grid counters */}
      <div id="queue-counters" className="grid grid-cols-3 gap-2.5">
        <div className="bg-white/[0.02] border border-white/5 p-3.5 rounded-2xl text-center">
          <span className="text-[8.5px] text-slate-500 font-bold uppercase block mb-1 tracking-wider">Total Slots</span>
          <span className="text-base font-black text-white font-mono">#{totalCount}</span>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/20 p-3.5 rounded-2xl text-center">
          <span className="text-[8.5px] text-emerald-400 font-bold uppercase block mb-1 tracking-wider">Active</span>
          <span className="text-base font-black text-emerald-400 font-mono">{activeCount}</span>
        </div>
        <div className="bg-blue-500/5 border border-blue-500/20 p-3.5 rounded-2xl text-center">
          <span className="text-[8.5px] text-blue-300 font-bold uppercase block mb-1 tracking-wider">Completed</span>
          <span className="text-base font-black text-blue-300 font-mono">{completedCount}</span>
        </div>
      </div>

      {/* User summary if active */}
      {userParticipant && (
        <div className="bg-blue-650/10 border border-blue-500/30 p-4 rounded-2xl flex justify-between items-center text-xs">
          <div>
            <span className="text-slate-400">My Position:</span>
            <strong className="text-white font-mono ml-1.5 font-black">#{userParticipant.position}</strong>
          </div>
          <div>
            <span className="text-slate-400">Internal Balance:</span>
            <strong className="text-blue-400 font-mono ml-1.5 font-black">{userParticipant.internalBalance.toFixed(1)} / 15 TON</strong>
          </div>
        </div>
      )}

      {/* Switcher tabs for Ledger vs Visual Chain */}
      <div id="queue-view-switcher" className="flex bg-white/5 rounded-2xl p-1 border border-white/5">
        <button
          onClick={() => setViewMode('CHAIN')}
          className={`flex-1 py-2.5 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            viewMode === 'CHAIN'
              ? 'bg-blue-600 text-white font-black shadow-md shadow-blue-500/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          Interactive Chain
        </button>
        <button
          onClick={() => setViewMode('LIST')}
          className={`flex-1 py-2.5 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            viewMode === 'LIST'
              ? 'bg-blue-600 text-white font-black shadow-md shadow-blue-500/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Queue Map List
        </button>
      </div>

      {viewMode === 'CHAIN' ? (
        <TransactionChain transactions={transactions} />
      ) : (
        /* Filter and timeline stream */
        <div className="space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center">
            <span className="text-[9.5px] uppercase tracking-wider text-slate-400 font-bold">List Timeline</span>
            
            <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
              {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`text-[9.5px] px-3 py-1.5 font-bold uppercase rounded-lg transition-all cursor-pointer ${
                    statusFilter === filter 
                      ? 'bg-blue-600 text-white font-black shadow-sm' 
                      : 'text-slate-450 hover:text-slate-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Live List Scroll Grid */}
          <div id="timeline-scroll-grid" className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {filteredParticipants.length === 0 ? (
              <div className="text-center py-10 bg-white/[0.01] rounded-[24px] border border-white/5 text-slate-550 text-xs">
                No list items found under the selected query.
              </div>
            ) : (
              filteredParticipants.map((p) => {
                const fraction = Math.min(100, (p.internalBalance / 15) * 100);

                const isCurrentUser = p.username === 'My_Ton_Wallet';

                return (
                  <div
                    key={p.id}
                    className={`p-3.5 rounded-2xl border relative overflow-hidden transition-all ${
                      isCurrentUser 
                        ? 'bg-blue-900/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/10' 
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[9.5px] font-mono text-blue-400 font-bold bg-white/5 border border-white/5 px-2 py-0.5 rounded-lg">
                          #{p.position}
                        </span>
                        <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                          {p.username}
                          {isCurrentUser && (
                            <span className="text-[8px] bg-blue-500/15 text-blue-400 border border-blue-500/35 px-1.5 py-0.5 rounded uppercase font-black tracking-wider">
                              YOU
                            </span>
                          )}
                        </span>
                      </div>

                      <span className={`text-[8.5px] font-mono px-2 py-0.5 rounded-full border tracking-widest uppercase ${
                        p.status === ParticipantStatus.ACTIVE
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400 font-bold'
                          : p.status === ParticipantStatus.COMPLETED
                            ? 'bg-blue-500/5 border-blue-500/20 text-blue-400 font-bold'
                            : 'bg-white/5 border border-white/5 text-slate-500'
                      }`}>
                        {p.status}
                      </span>
                    </div>

                    {/* Accrued reward view */}
                    <div className="flex justify-between items-end mt-2">
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Accrued Rewards</span>
                        <span className="text-sm font-black text-slate-100 mt-0.5 font-sans">
                          {p.internalBalance.toFixed(1)} <span className="text-[10px] text-blue-400 font-bold font-sans">/ 15.0 TON</span>
                        </span>
                      </div>

                      <div className="text-right text-[10px] text-slate-500 font-mono">
                        <span className="block text-[9px] text-slate-455 select-all font-mono">
                          EQ...{p.walletAddress.slice(-8)}
                        </span>
                        <span className="block text-[8.5px] mt-0.5 text-slate-500">
                          {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Micro Progress bar */}
                    <div className="mt-3.5 w-full bg-white/5 h-1.5 rounded-full overflow-hidden p-[1px] border border-white/5">
                      <div 
                        style={{ width: `${fraction}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          p.status === ParticipantStatus.COMPLETED
                            ? 'bg-blue-500 shadow-glow'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                        }`}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
