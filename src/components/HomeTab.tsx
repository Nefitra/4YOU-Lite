/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  Wallet, Info, ArrowUpRight, Award, ShieldAlert, 
  Layers, AppWindow, Sparkles, AlertCircle
} from 'lucide-react';
import { SystemStatus } from '../types';

interface HomeTabProps {
  systemStatus: SystemStatus;
  userWallet: { address: string; ton: number; luckys: number; connected: boolean; telegramId?: string };
  setUserWallet?: React.Dispatch<React.SetStateAction<{ address: string; ton: number; luckys: number; connected: boolean; telegramId?: string }>>;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  setActiveTab: (tab: 'HOME' | 'DEPOSIT' | 'BALANCE' | 'QUEUE' | 'WITHDRAW' | 'ADMIN') => void;
  hasActivePosition: boolean;
}

export default function HomeTab({
  systemStatus,
  userWallet,
  setUserWallet,
  onConnectWallet,
  onDisconnectWallet,
  setActiveTab,
  hasActivePosition
}: HomeTabProps) {
  return (
    <div id="home-tab" className="space-y-6 animate-fadeIn">
      {/* Immersive GameFi Banner */}
      <div className="bg-gradient-to-br from-blue-900/40 via-[#0a0f1d] to-[#040711] border border-blue-500/10 p-5 rounded-[32px] overflow-hidden relative shadow-[0_12px_40px_rgba(59,130,246,0.1)]">
        <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-indigo-500/20 rounded-full blur-[40px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-24 h-24 bg-blue-500/15 rounded-full blur-[30px] pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-blue-500/25 border border-blue-400/30 text-blue-400 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 animate-pulse" />
              LITE WORKSPACE
            </span>
            <span className={`text-[10px] font-extrabold border rounded-full px-2.5 py-1 uppercase tracking-wider flex items-center gap-1.5 ${
              systemStatus === SystemStatus.ACTIVE
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400'
                : 'bg-rose-950/40 border-rose-800/40 text-rose-300'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${systemStatus === SystemStatus.ACTIVE ? 'bg-emerald-400' : 'bg-rose-450'}`} />
              System Status: {systemStatus}
            </span>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight font-display bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-blue-400">
              4YOU Lite MVP
            </h2>
            <p className="text-slate-400 text-xs leading-relaxed max-w-[340px]">
              Join the smart queue with <strong className="text-blue-400">10 TON</strong> and receive internal rewards when new participants enter after you. Simple, transparent, and completely automated.
            </p>
          </div>
        </div>
      </div>

      {/* Wallet Status Area */}
      <div className="bg-white/[0.02] border border-white/5 p-5 rounded-[24px] space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">Account Hub</span>
            <h3 className="text-white font-extrabold text-xs uppercase tracking-wider">TON Network Wallet</h3>
          </div>
          {userWallet.connected ? (
            <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/25 font-bold uppercase py-1 px-2.5 rounded-lg">
              CONNECTED
            </span>
          ) : (
            <span className="text-[9px] bg-slate-500/10 text-slate-400 border border-white/5 font-bold uppercase py-1 px-2.5 rounded-lg">
              DISCONNECTED
            </span>
          )}
        </div>

        {userWallet.connected ? (
          <div className="bg-[#080b12] border border-white/10 p-4 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-mono block">Address</span>
                <span className="text-white text-xs font-mono font-bold select-all">
                  {userWallet.address.slice(0, 8)}...{userWallet.address.slice(-8)}
                </span>
                <div className="text-[11px] font-bold text-blue-400 font-mono mt-1">
                  Asset: {userWallet.ton.toFixed(2)} TON
                </div>
              </div>
              
              <button
                onClick={onDisconnectWallet}
                className="text-[9px] font-bold text-rose-450 bg-rose-500/10 border border-rose-500/25 px-2.5 py-1.5 rounded-lg transition-all hover:bg-rose-500/20 active:scale-95 cursor-pointer self-start"
              >
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onConnectWallet}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white border border-blue-500/30 rounded-2xl text-[11.5px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_5px_20px_rgba(59,130,246,0.3)] hover:scale-[1.01]"
          >
            <Wallet className="w-4 h-4" />
            Connect TON Wallet via TON Connect
          </button>
        )}
      </div>

      {/* Main Action Grid */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => {
            if (!userWallet.connected) {
              alert('Please connect your TON wallet first!');
              return;
            }
            setActiveTab('DEPOSIT');
          }}
          className="bg-white/[0.02] border border-white/5 hover:border-blue-500/40 p-4 rounded-2xl text-left space-y-3 transition-all hover:scale-[1.02] cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Join System</h4>
            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Deposit 10 TON to enter queue</p>
          </div>
        </button>

        <button
          onClick={() => {
            if (!userWallet.connected) {
              alert('Please connect your TON wallet first!');
              return;
            }
            setActiveTab('BALANCE');
          }}
          className="bg-white/[0.02] border border-white/5 hover:border-blue-500/40 p-4 rounded-2xl text-left space-y-3 transition-all hover:scale-[1.02] cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider">My Balance</h4>
            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
              {hasActivePosition ? 'View target status & rewards' : 'No active cycle currently'}
            </p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('QUEUE')}
          className="bg-white/[0.02] border border-white/5 hover:border-blue-500/40 p-4 rounded-2xl text-left space-y-3 transition-all hover:scale-[1.02] cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider">View Queue</h4>
            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Real-time off-chain ledger list</p>
          </div>
        </button>

        <button
          onClick={() => {
            if (!userWallet.connected) {
              alert('Please connect your TON wallet first!');
              return;
            }
            setActiveTab('WITHDRAW');
          }}
          className="bg-white/[0.02] border border-white/5 hover:border-blue-500/40 p-4 rounded-2xl text-left space-y-3 transition-all hover:scale-[1.02] cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <AppWindow className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Withdraw</h4>
            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Transfer internal TON rewards</p>
          </div>
        </button>
      </div>

      {/* Strict TON Queue Risk Disclaimer Tabular Banner (ТЗ Section 17) */}
      <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 text-[11px] text-slate-400 leading-relaxed space-y-2">
        <div className="flex items-center gap-1.5 font-bold uppercase text-[9.5px] text-amber-500">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <span>GameFi Risk Disclaimer</span>
        </div>
        <p>
          4YOU Lite does not guarantee fixed income, fixed payout time, daily profit, or guaranteed return. Internal rewards are generated only when new confirmed deposits enter the system. If no new deposits arrive, new rewards do not accrue. Participate responsibly.
        </p>
      </div>
    </div>
  );
}
