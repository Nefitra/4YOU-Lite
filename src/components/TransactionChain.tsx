/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowUpRight, ArrowDownLeft, Award, Layers, Sparkles, Clock, 
  HelpCircle, ShieldCheck, Filter, ArrowUpDown, ChevronRight, X, Info
} from 'lucide-react';
import { Transaction, TransactionType } from '../types';

interface TransactionChainProps {
  transactions: Transaction[];
}

export default function TransactionChain({ transactions }: TransactionChainProps) {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'ALL'>('ALL');
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST'>('NEWEST');

  // Filter & Sort logic
  const filteredTxs = transactions
    .filter(tx => typeFilter === 'ALL' || tx.type === typeFilter)
    .sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === 'NEWEST' ? timeB - timeA : timeA - timeB;
    });

  // Color mapper for nodes
  const getNodeStyles = (type: TransactionType) => {
    switch (type) {
      case TransactionType.DEPOSIT:
        return {
          bg: 'bg-gradient-to-br from-cyan-400 to-blue-500',
          glow: 'shadow-[0_0_15px_rgba(34,211,238,0.5)] border-cyan-300/40',
          textColor: 'text-cyan-400',
          label: 'DEP',
          iconColor: 'bg-cyan-500/10 text-cyan-400'
        };
      case TransactionType.PROJECT_FEE:
        return {
          bg: 'bg-gradient-to-br from-purple-500 to-fuchsia-600',
          glow: 'shadow-[0_0_15px_rgba(217,70,239,0.5)] border-purple-300/40',
          textColor: 'text-fuchsia-400',
          label: 'FEE',
          iconColor: 'bg-purple-500/10 text-purple-400'
        };
      case TransactionType.INTERNAL_REWARD:
        return {
          bg: 'bg-gradient-to-br from-emerald-400 to-teal-500',
          glow: 'shadow-[0_0_15px_rgba(52,211,153,0.5)] border-emerald-300/40',
          textColor: 'text-emerald-400',
          label: 'RWD',
          iconColor: 'bg-emerald-500/10 text-emerald-400'
        };
      case TransactionType.WITHDRAWAL:
        return {
          bg: 'bg-gradient-to-br from-amber-400 to-orange-500',
          glow: 'shadow-[0_0_15px_rgba(251,191,36,0.5)] border-amber-300/40',
          textColor: 'text-amber-500',
          label: 'WTH',
          iconColor: 'bg-amber-500/10 text-amber-500'
        };
      case TransactionType.REINVEST:
        return {
          bg: 'bg-gradient-to-br from-indigo-500 to-violet-600',
          glow: 'shadow-[0_0_15px_rgba(99,102,241,0.5)] border-indigo-300/40',
          textColor: 'text-indigo-400',
          label: 'REI',
          iconColor: 'bg-indigo-500/10 text-indigo-400'
        };
      default:
        return {
          bg: 'bg-slate-500',
          glow: 'shadow-[0_0_15px_rgba(148,163,184,0.5)] border-slate-300/40',
          textColor: 'text-slate-400',
          label: 'TX',
          iconColor: 'bg-slate-500/10 text-slate-400'
        };
    }
  };

  const getExplanation = (tx: Transaction): string => {
    switch (tx.type) {
      case TransactionType.DEPOSIT:
        return `A secure entry deposit of ${tx.amount} TON was made by @${tx.fromUsername || 'User'} to join the smart allocation queue. This successfully activated their position in the system.`;
      case TransactionType.PROJECT_FEE:
        return `A 1% protocol fee (${tx.amount} TON) was automatically routed off-chain to the core Smart Contract management wallet for platform development and nodes maintenance.`;
      case TransactionType.INTERNAL_REWARD:
        return `An internal reward of ${tx.amount} TON was credited off-chain to @${tx.toUsername || 'User'} triggered by a new verified participant deposit in the rolling queue.`;
      case TransactionType.WITHDRAWAL:
        return `A manual withdrawal of ${tx.amount} TON was successfully processed. Funds were routed from the Treasury Pool directly back to the linked user wallet.`;
      case TransactionType.REINVEST:
        return `An automated reinvestment of ${tx.amount} TON was completed. The user's active position completed its cycle, and automatically spawned a new position at the end of the queue.`;
      default:
        return `Platform transaction processed successfully within the off-chain system ledger.`;
    }
  };

  return (
    <div id="transaction-chain-module" className="space-y-4">
      {/* Module Title with filters */}
      <div className="flex justify-between items-center bg-white/[0.01] p-3 rounded-2xl border border-white/5">
        <div>
          <span className="text-[8.5px] uppercase tracking-wider text-slate-500 font-extrabold block">Live Visual Blocks</span>
          <h4 className="text-white text-xs font-black uppercase flex items-center gap-1 mt-0.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Transaction Chain
          </h4>
        </div>

        <div className="flex gap-1.5 items-center">
          {/* Filters trigger */}
          <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/5">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-transparent border-none text-[9px] font-bold text-slate-350 px-1 py-1 uppercase focus:outline-none focus:ring-0 cursor-pointer"
            >
              <option value="ALL" className="bg-[#0c101a] text-xs text-white">ALL TXs</option>
              <option value="DEPOSIT" className="bg-[#0c101a] text-xs text-cyan-400">Deposits</option>
              <option value="PROJECT_FEE" className="bg-[#0c101a] text-xs text-fuchsia-400">Fees</option>
              <option value="INTERNAL_REWARD" className="bg-[#0c101a] text-xs text-emerald-400">Rewards</option>
              <option value="WITHDRAWAL" className="bg-[#0c101a] text-xs text-amber-500">Withdraws</option>
            </select>
          </div>

          <button
            onClick={() => setSortOrder(prev => prev === 'NEWEST' ? 'OLDEST' : 'NEWEST')}
            className="p-1.5 bg-white/5 border border-white/5 rounded-lg text-slate-400 hover:text-white cursor-pointer transition-all active:scale-95 flex items-center"
            title={`Sort: ${sortOrder}`}
          >
            <ArrowUpDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Visual Chain Scroll Area */}
      <div className="bg-[#05080e] border border-white/5 rounded-[24px] p-4 relative overflow-hidden">
        {/* Dynamic ambient grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.08),rgba(0,0,0,0))]" />
        
        {/* Horizontal glowing trail */}
        <div className="relative py-2 overflow-x-auto scrollbar-thin select-none scroll-smooth">
          {filteredTxs.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-600 font-mono">
              No matching activity blocks in current viewport.
            </div>
          ) : (
            <div className="flex items-center min-w-[500px] gap-0 px-2 relative py-4">
              
              {/* Linked chain background connector path line */}
              <div className="absolute left-[36px] right-[36px] top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 border-t border-dashed border-white/10 z-0" />
              
              <AnimatePresence mode="popLayout">
                {filteredTxs.slice(0, 16).map((tx, idx) => {
                  const node = getNodeStyles(tx.type);
                  const isSelected = selectedTx?.id === tx.id;
                  
                  return (
                    <div key={tx.id} className="flex items-center z-10 relative">
                      
                      {/* Connection segment energy line (different style for newest node highlight) */}
                      {idx > 0 && (
                        <div className="w-6 h-1 flex items-center justify-center">
                          <motion.div 
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            className="w-full h-[2px] bg-indigo-500/30"
                          />
                        </div>
                      )}

                      {/* Sphere Node */}
                      <motion.button
                        layoutId={`node-${tx.id}`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => setSelectedTx(tx)}
                        className={`w-12 h-12 rounded-full border flex flex-col items-center justify-center cursor-pointer transition-all relative ${node.bg} ${node.glow} ${
                          isSelected 
                            ? 'ring-4 ring-white/25 scale-[1.12]' 
                            : 'hover:scale-[1.08] active:scale-95'
                        }`}
                      >
                        {/* Shimmer overlay */}
                        <span className="absolute inset-0.5 rounded-full bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                        
                        {/* Transaction abbreviation */}
                        <span className="text-[10px] font-black tracking-tighter text-white font-mono uppercase drop-shadow">
                          {node.label}
                        </span>

                        {/* Direct Amount preview code */}
                        <span className="text-[7.5px] font-mono font-bold text-white/90 leading-tight drop-shadow-sm truncate max-w-[40px]">
                          {tx.amount.toFixed(1)}
                        </span>

                        {/* Status microdot */}
                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#0a0d14] p-[1.5px] border border-white/10">
                          <div className={`w-full h-full rounded-full ${
                            tx.status === 'CONFIRMED' ? 'bg-emerald-400' : 'bg-rose-400'
                          }`} />
                        </div>
                      </motion.button>
                    </div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2 font-medium px-1 border-t border-white/5 pt-2">
          <span>Total visualization chain length: <strong>{filteredTxs.length} event nodes</strong></span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Sync: Online
          </span>
        </div>
      </div>

      {/* Info card modal overlay */}
      <AnimatePresence>
        {selectedTx && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTx(null)}
          >
            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-[#090d16] border border-white/10 rounded-[32px] p-5 shadow-[0_20px_50px_rgba(59,130,246,0.3)] relative text-left"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedTx(null)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Title Section */}
              <div className="flex items-center gap-3 mb-4 select-none">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getNodeStyles(selectedTx.type).iconColor}`}>
                  {selectedTx.type === TransactionType.DEPOSIT && <ArrowUpRight className="w-5 h-5" />}
                  {selectedTx.type === TransactionType.WITHDRAWAL && <ArrowDownLeft className="w-5 h-5" />}
                  {selectedTx.type === TransactionType.INTERNAL_REWARD && <Award className="w-5 h-5" />}
                  {selectedTx.type === TransactionType.PROJECT_FEE && <Layers className="w-5 h-5" />}
                </div>

                <div>
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 font-extrabold block">BLOCK VERIFIED</span>
                  <div className="flex items-center gap-1.5">
                    <h3 className={`text-sm font-black uppercase ${getNodeStyles(selectedTx.type).textColor}`}>
                      {selectedTx.type}
                    </h3>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-black tracking-wider uppercase font-mono">
                      {selectedTx.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amount Display */}
              <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 text-center mb-4 select-all">
                <span className="text-[8.5px] uppercase tracking-widest text-slate-500 font-bold block mb-0.5">Asset Amount</span>
                <span className="text-2xl font-mono font-black text-white">
                  {selectedTx.amount.toFixed(2)} <span className="text-xs font-sans font-bold text-blue-400">TON</span>
                </span>
                <span className="text-[9px] text-slate-500 block font-mono mt-1">Status Code: OxC098..2026</span>
              </div>

              {/* Detailed specs list */}
              <div className="space-y-2.5 text-xs select-all">
                {/* Timestamp */}
                <div className="flex justify-between items-center text-slate-450">
                  <span>Block Timestamp:</span>
                  <span className="text-slate-200 font-bold">{new Date(selectedTx.createdAt).toLocaleString()}</span>
                </div>

                {/* Routing information */}
                {selectedTx.fromUsername && (
                  <div className="flex justify-between items-center text-slate-450">
                    <span>Sender/From Account:</span>
                    <span className="text-blue-400 font-bold">@{selectedTx.fromUsername}</span>
                  </div>
                )}

                {selectedTx.toUsername && (
                  <div className="flex justify-between items-center text-slate-450">
                    <span>Recipient/To Account:</span>
                    <span className="text-emerald-400 font-bold">@{selectedTx.toUsername}</span>
                  </div>
                )}

                {/* Blockchain type */}
                <div className="flex justify-between items-center text-slate-450">
                  <span>Routing Layer:</span>
                  <span className="text-slate-300 font-bold font-mono text-[10.5px]">
                    {selectedTx.type === TransactionType.WITHDRAWAL || selectedTx.type === TransactionType.DEPOSIT
                      ? '⛓️ On-Chain (SIMULATED TON MAINNET)'
                      : '⚡ Off-Chain Ledger Event'}
                  </span>
                </div>

                {/* Transaction hash */}
                <div className="space-y-1 pt-1 border-t border-white/5">
                  <span className="text-[9.5px] text-slate-500 font-bold uppercase tracking-wider block">Transaction Hash</span>
                  <div className="bg-[#05080e] border border-white/5 rounded-lg p-2 font-mono text-[9.5px] text-slate-450 break-all select-all font-mono">
                    {selectedTx.txHash}
                  </div>
                </div>

                {/* Explanation text */}
                <div className="mt-3.5 bg-blue-500/5 border border-blue-500/10 rounded-xl p-3 text-[10.5px] text-slate-400 leading-relaxed">
                  <div className="flex items-center gap-1.5 text-[9px] font-black text-blue-400 uppercase tracking-wider mb-1 select-none">
                    <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    <span>Transaction Explanation</span>
                  </div>
                  {getExplanation(selectedTx)}
                </div>
              </div>

              {/* Close CTAs */}
              <button
                onClick={() => setSelectedTx(null)}
                className="w-full mt-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 active:scale-95 text-white font-black uppercase text-xs tracking-wider rounded-xl cursor-pointer shadow-md text-center"
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
