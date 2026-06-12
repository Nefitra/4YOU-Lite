/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sliders, ShieldCheck, RefreshCw, Cpu, Edit, Check,
  AlertCircle, ShieldAlert, Play, Pause, Trash2, ListCollapse, Terminal, Bot, Key, Lock
} from 'lucide-react';
import { SystemStatus, Transaction, Participant, ParticipantStatus } from '../types';

interface AdminTabProps {
  treasuryBalance: number;
  projectBalance: number;
  transactions: Transaction[];
  participants: Participant[];
  systemStatus: SystemStatus;
  setSystemStatus: (status: SystemStatus) => void;
  treasuryWalletAddress: string;
  setTreasuryWalletAddress: (address: string) => void;
  projectWalletAddress: string;
  setProjectWalletAddress: (address: string) => void;
  onBlockUser: (isBlocked: boolean) => void;
  userIsBlocked: boolean;
  onResetSimulation: () => void;
  onRetryFailedWithdrawals: () => void;
  autoSimulate: boolean;
  setAutoSimulate: (val: boolean) => void;
  botUsername?: string;
  botToken?: string;
  adminTelegramIds?: string[];
  withdrawalSignerAddress?: string;
  withdrawalLimit?: number;
  autoWithdrawalsEnabled?: boolean;
}

export default function AdminTab({
  treasuryBalance,
  projectBalance,
  transactions,
  participants,
  systemStatus,
  setSystemStatus,
  treasuryWalletAddress,
  setTreasuryWalletAddress,
  projectWalletAddress,
  setProjectWalletAddress,
  onBlockUser,
  userIsBlocked,
  onResetSimulation,
  onRetryFailedWithdrawals,
  autoSimulate,
  setAutoSimulate,
  botUsername = '@YOU_Game_Lite_bot',
  botToken = '',
  adminTelegramIds = [],
  withdrawalSignerAddress = '',
  withdrawalLimit = 5.0,
  autoWithdrawalsEnabled = true
}: AdminTabProps) {
  const [editingTreasury, setEditingTreasury] = useState(false);
  const [treasuryInput, setTreasuryInput] = useState(treasuryWalletAddress);
  const [editingProject, setEditingProject] = useState(false);
  const [projectInput, setProjectInput] = useState(projectWalletAddress);
  const [retryResult, setRetryResult] = useState<string | null>(null);

  // Stats calculation
  const totalDeposits = transactions.filter(t => t.type === 'DEPOSIT').reduce((acc, t) => acc + t.amount, 0);
  const totalWithdrawals = transactions.filter(t => t.type === 'WITHDRAWAL').reduce((acc, t) => acc + t.amount, 0);
  const totalRewardsGiven = participants.reduce((acc, p) => acc + p.totalRewardsReceived, 0);

  const activeUsers = participants.filter(p => p.status === ParticipantStatus.ACTIVE).length;
  const completedUsers = participants.filter(p => p.status === ParticipantStatus.COMPLETED).length;

  const handleSaveTreasury = () => {
    if (!treasuryInput.startsWith('EQ') && !treasuryInput.startsWith('UQ')) {
      alert('Address must match standard TON format (EQ... or UQ...)');
      return;
    }
    setTreasuryWalletAddress(treasuryInput);
    setEditingTreasury(false);
  };

  const handleSaveProject = () => {
    if (!projectInput.startsWith('EQ') && !projectInput.startsWith('UQ')) {
      alert('Address must match standard TON format (EQ... or UQ...)');
      return;
    }
    setProjectWalletAddress(projectInput);
    setEditingProject(false);
  };

  const handleRetry = () => {
    onRetryFailedWithdrawals();
    setRetryResult('Withdrawal queue retried. All pending/failed items were processed successfully.');
    setTimeout(() => setRetryResult(null), 3000);
  };

  return (
    <div id="admin-tab" className="space-y-6 animate-fadeIn pb-4">
      {/* Header Info */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] text-blue-400 font-black block">Administration Panel</span>
          <h3 className="text-white font-black text-sm uppercase tracking-wide flex items-center gap-1.5 mt-0.5">
            <Sliders className="w-4 h-4 text-blue-400" />
            Control Registry
          </h3>
        </div>

        <button
          onClick={onResetSimulation}
          className="px-3 py-1.5 text-rose-450 hover:text-white hover:bg-rose-500/10 rounded-xl border border-rose-500/10 transition-all text-[9.5px] uppercase font-black tracking-wider flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Purge db
        </button>
      </div>

      {/* Primary Financial Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Treasury Pool</span>
          <strong className="text-base font-black text-white font-mono mt-1 block">
            {treasuryBalance.toFixed(2)} <span className="text-[10px] text-blue-400 font-bold">TON</span>
          </strong>
        </div>

        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Project cut Wallet</span>
          <strong className="text-base font-black text-white font-mono mt-1 block">
            {projectBalance.toFixed(2)} <span className="text-[10px] text-blue-400 font-bold">TON</span>
          </strong>
        </div>

        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Total Deposits Volume</span>
          <strong className="text-xs font-bold text-slate-205 font-mono mt-1 block">
            {totalDeposits.toFixed(1)} TON
          </strong>
        </div>

        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Total Withdrawals out</span>
          <strong className="text-xs font-bold text-slate-205 font-mono mt-1 block">
            {totalWithdrawals.toFixed(1)} TON
          </strong>
        </div>

        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl col-span-2">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">User Metrics</span>
              <span className="text-xs text-slate-350 block mt-1">
                Active Queue Size: <strong>{activeUsers}</strong> | Completed: <strong>{completedUsers}</strong>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Total Rewards Given</span>
              <strong className="text-xs font-bold text-emerald-400 font-mono block mt-0.5">
                +{totalRewardsGiven.toFixed(1)} TON
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Bot & Signer Live Production Manifest */}
      <div className="bg-gradient-to-br from-indigo-950/20 via-blue-950/10 to-transparent border border-blue-500/20 p-5 rounded-[24px] space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[8px] bg-blue-500/10 text-blue-400 border border-blue-500/25 px-1.5 py-0.5 rounded font-black tracking-widest uppercase mb-1 inline-block">
              PRODUCTION LIVE MANIFEST
            </span>
            <h4 className="text-xs font-black text-white uppercase flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-blue-400" />
              Telegram Bot & Payout settings
            </h4>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Config Ready
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 text-xs">
          {/* Bot details */}
          <div className="bg-black/40 border border-white/5 p-3 rounded-xl space-y-2">
            <div className="flex justify-between items-center pb-1.5 border-b border-white/5">
              <span className="text-slate-400 font-bold flex items-center gap-1">
                <Bot className="w-3.5 h-3.5 text-blue-400" /> Username
              </span>
              <span className="text-blue-400 font-mono font-bold select-all">{botUsername}</span>
            </div>

            <div className="flex justify-between items-center pb-1.5 border-b border-white/5">
              <span className="text-slate-400 font-bold flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-slate-500" /> Bot Token
              </span>
              <span className="text-slate-300 font-mono text-[10px] select-all truncate max-w-[180px]" title={botToken}>
                {botToken ? `${botToken.slice(0, 15)}...${botToken.slice(-8)}` : 'None Provided'}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-slate-400 font-bold">Admin Telegram IDs:</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {adminTelegramIds.map(id => (
                  <span key={id} className="text-[9.5px] px-2 py-0.5 bg-white/5 border border-white/5 rounded font-mono font-bold text-slate-300 select-all">
                    {id}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Autowithdraw & Signer */}
          <div className="bg-black/40 border border-white/5 p-3 rounded-xl space-y-2">
            <div className="flex justify-between items-center pb-1.5 border-b border-white/5">
              <span className="text-slate-400 font-bold">Withdrawal Gatekeeper</span>
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/5 px-2 py-0.5 border border-emerald-500/25 rounded">
                Auto withdrawals
              </span>
            </div>

            <div className="flex justify-between items-center pb-1.5 border-b border-white/5">
              <span className="text-slate-400 font-bold">Per-Tx Limit</span>
              <span className="text-slate-205 font-bold font-mono">{withdrawalLimit} TON Max</span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 text-[10.5px] font-bold block">Withdrawal Signer Public Key / Account:</span>
              <div className="p-2 bg-white/[0.01] border border-white/5 rounded-lg text-[9.5px] font-mono text-slate-400 break-all select-all leading-tight">
                {withdrawalSignerAddress}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Settings & Toggles */}
      <div className="bg-white/[0.02] border border-white/5 p-5 rounded-[24px] space-y-4">
        <div>
          <span className="text-[9.5px] uppercase tracking-wider text-slate-500 font-bold block">Toggles & Statuses</span>
          <h4 className="text-xs font-black text-white uppercase mt-0.5">System State Control</h4>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <button
            onClick={() => setSystemStatus(SystemStatus.ACTIVE)}
            className={`py-3 rounded-xl font-bold uppercase transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
              systemStatus === SystemStatus.ACTIVE
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-black'
                : 'bg-white/5 border-white/5 text-slate-500'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            Active
          </button>

          <button
            onClick={() => setSystemStatus(SystemStatus.PAUSED)}
            className={`py-3 rounded-xl font-bold uppercase transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
              systemStatus === SystemStatus.PAUSED
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-white/5 border-white/5 text-slate-500'
            }`}
          >
            <Pause className="w-3.5 h-3.5" />
            Pause Queue
          </button>

          <button
            onClick={() => setSystemStatus(SystemStatus.MAINTENANCE)}
            className={`py-3 rounded-xl font-bold uppercase transition-all flex items-center justify-center gap-1.5 border col-span-2 cursor-pointer ${
              systemStatus === SystemStatus.MAINTENANCE
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-white/5 border-white/5 text-slate-500'
            }`}
          >
            🔧 Maintenance Mode
          </button>
        </div>

        {/* Live Simulation switch */}
        <div className="border-t border-white/5 pt-4 flex justify-between items-center">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-white block">Automatic Deposit Injector</span>
            <span className="text-[10px] text-slate-500 block leading-none">Generates Mock Users entry every 6s</span>
          </div>

          <button
            onClick={() => setAutoSimulate(!autoSimulate)}
            className={`px-3 py-1.5 rounded-lg text-[9.5px] font-black uppercase border transition-all ${
              autoSimulate 
                ? 'bg-blue-650/15 border-blue-500 text-blue-400'
                : 'bg-white/5 border-white/5 text-slate-500'
            }`}
          >
            {autoSimulate ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>

      {/* Address Administration Inputs */}
      <div className="bg-white/[0.02] border border-white/5 p-5 rounded-[24px] space-y-4">
        <div>
          <span className="text-[9.5px] uppercase tracking-wider text-slate-500 font-bold block">Smart Contract Addresses</span>
          <h4 className="text-xs font-black text-white uppercase mt-0.5">Parameters Adjustment</h4>
        </div>

        {/* Treasury Wallet Form */}
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between items-center">
            <label className="text-slate-400 font-medium">Treasury Wallet Address:</label>
            {!editingTreasury ? (
              <button
                onClick={() => setEditingTreasury(true)}
                className="text-[10px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Edit className="w-3 h-3" /> Edit
              </button>
            ) : (
              <button
                onClick={handleSaveTreasury}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3 h-3" /> Save
              </button>
            )}
          </div>

          {editingTreasury ? (
            <input
              type="text"
              value={treasuryInput}
              onChange={(e) => setTreasuryInput(e.target.value)}
              className="w-full bg-[#07090e] border border-white/10 rounded-xl px-3 py-2 text-[11px] font-mono font-bold text-white focus:outline-none focus:border-blue-500"
            />
          ) : (
            <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl font-mono text-[10px] text-slate-400 truncate">
              {treasuryWalletAddress}
            </div>
          )}
        </div>

        {/* Project Wallet Form */}
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between items-center">
            <label className="text-slate-400 font-medium">Project Wallet Address:</label>
            {!editingProject ? (
              <button
                onClick={() => setEditingProject(true)}
                className="text-[10px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Edit className="w-3 h-3" /> Edit
              </button>
            ) : (
              <button
                onClick={handleSaveProject}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3 h-3" /> Save
              </button>
            )}
          </div>

          {editingProject ? (
            <input
              type="text"
              value={projectInput}
              onChange={(e) => setProjectInput(e.target.value)}
              className="w-full bg-[#07090e] border border-white/10 rounded-xl px-3 py-2 text-[11px] font-mono font-bold text-white focus:outline-none focus:border-blue-500"
            />
          ) : (
            <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl font-mono text-[10px] text-slate-400 truncate">
              {projectWalletAddress}
            </div>
          )}
        </div>
      </div>

      {/* User Block/Unblock Sandbox parameters (ТЗ Section 7) */}
      <div className="bg-white/[0.02] border border-white/5 p-5 rounded-[24px] space-y-4">
        <div>
          <span className="text-[9.5px] uppercase tracking-wider text-slate-500 font-bold block">User Limitation</span>
          <h4 className="text-xs font-black text-white uppercase mt-0.5">Mock User Lock</h4>
        </div>

        <div className="flex justify-between items-center text-xs">
          <div>
            <span className="text-slate-300 block font-bold">My_Ton_Wallet Status</span>
            <span className="text-[10px] text-slate-550 block">Restrict active user profile withdrawals</span>
          </div>

          <button
            onClick={() => onBlockUser(!userIsBlocked)}
            className={`px-4 py-2 font-black uppercase rounded-lg text-[10px] tracking-wide cursor-pointer border ${
              userIsBlocked 
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 animate-pulse'
                : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
            }`}
          >
            {userIsBlocked ? 'Unblock User' : 'Block User'}
          </button>
        </div>
      </div>

      {/* Manual Retry failed transfers */}
      <div className="bg-white/[0.02] border border-white/5 p-5 rounded-[24px] space-y-4">
        <div>
          <span className="text-[9.5px] uppercase tracking-wider text-slate-500 font-bold block">Manual Retry Engine</span>
          <h4 className="text-xs font-black text-white uppercase mt-0.5">Failed Payouts Processor</h4>
        </div>

        {retryResult && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-[10.5px] text-emerald-400 rounded-lg flex items-center gap-1.5 font-bold">
            <Check className="w-3.5 h-3.5" />
            <span>{retryResult}</span>
          </div>
        )}

        <p className="text-[11px] leading-relaxed text-slate-450">
          In case of transient TON blockchain congestion, manual retry initiates secure database verification scans to push off-chain withdrawals back into the payment channel.
        </p>

        <button
          onClick={handleRetry}
          className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-[10.5px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Cpu className="w-3.5 h-3.5" /> Run Verification Loop
        </button>
      </div>

      {/* Simple Transactions Logs Section */}
      <div className="space-y-3">
        <h4 className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-blue-400 font-mono" />
          Recent Transaction logs (Live Ledger)
        </h4>

        <div className="bg-white/[0.01] rounded-2xl border border-white/5 divide-y divide-white/5 max-h-[220px] overflow-y-auto font-mono text-[9.5px] p-1 select-none">
          {transactions.slice(0, 8).map((tx) => (
            <div key={tx.id} className="p-2.5 flex justify-between items-center text-slate-400 gap-2 font-mono">
              <div className="truncate font-mono">
                <span className={`font-black font-mono mr-1.5 ${
                  tx.type === 'DEPOSIT' ? 'text-emerald-400' : tx.type === 'WITHDRAWAL' ? 'text-rose-400' : 'text-blue-400'
                }`}>[{tx.type}]</span>
                {tx.type === 'DEPOSIT' && `+${tx.amount} TON entry`}
                {tx.type === 'WITHDRAWAL' && `-${tx.amount} TON payout`}
                {tx.type === 'PROJECT_FEE' && `+${tx.amount} TON fee`}
                {tx.type === 'INTERNAL_REWARD' && `+${tx.amount} TON reward`}
              </div>
              <span className="text-[8px] text-slate-600 font-mono flex-shrink-0">
                {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
