/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, Award, Store, Calendar, Terminal, Wifi, Battery, 
  Sparkles, Coins, Clock, Info, ShieldAlert, Cpu, Heart,
  ArrowUpRight, ArrowDownLeft, Sliders, Home
} from 'lucide-react';

import { Participant, Transaction, ParticipantStatus, SystemStatus, TransactionType } from './types';
import { 
  generateInitialParticipants, generateTxHash, generateRandomUsername 
} from './lib/mockData';

// Component Tabs imports
import HomeTab from './components/HomeTab';
import DepositTab from './components/DepositTab';
import MyBalanceTab from './components/MyBalanceTab';
import QueueTab from './components/QueueTab';
import WithdrawTab from './components/WithdrawTab';
import AdminTab from './components/AdminTab';

export default function App() {
  const [activeTab, setActiveTab] = useState<'HOME' | 'DEPOSIT' | 'BALANCE' | 'QUEUE' | 'WITHDRAW' | 'ADMIN'>('HOME');

  // Simulated User Wallet (TON Connect Integration simulation)
  const [userWallet, setUserWallet] = useState({
    address: 'UQBt8f3G9aK8cRe7Vw2bNpXs9qZ4y3m5dL1t6u7v8w9xY',
    ton: 60.0, // starts with 60 TON so the sandbox user can make multiple deposits easily
    luckys: 150, // bonus placeholder coins
    connected: true // connected by default for a stellar Instant trial preview
  });

  // State parameter settings (Section 8 database equivalence)
  const [treasuryWalletAddress, setTreasuryWalletAddress] = useState('EQBv4YOUTreasuryMainPoolX98c76Z54y3r2w1q0pOl9b');
  const [projectWalletAddress, setProjectWalletAddress] = useState('EQA6p8oZ_ProjectAdminFeeSupport9px9fGd7K9qM');
  const [systemStatus, setSystemStatus] = useState<SystemStatus>(SystemStatus.ACTIVE);

  // Financial central database totals
  const [treasuryBalance, setTreasuryBalance] = useState<number>(73.5); // base pool starts on 73.5 TON
  const [projectBalance, setProjectBalance] = useState<number>(1.5); // 1.5 TON project fee starts in admin wallet

  // Queue of participants list
  const [participants, setParticipants] = useState<Participant[]>(() => generateInitialParticipants());

  // Automatic simulation configuration
  const [autoSimulate, setAutoSimulate] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(6); // seconds per deposit

  // Transactions database logs
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    return [
      {
        id: `tx-init-1`,
        type: TransactionType.DEPOSIT,
        fromUsername: 'ChainBoss_501',
        amount: 10,
        txHash: generateTxHash(),
        status: 'CONFIRMED' as const,
        createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
      },
      {
        id: `tx-init-2`,
        type: TransactionType.PROJECT_FEE,
        amount: 0.1,
        txHash: generateTxHash(),
        status: 'CONFIRMED' as const,
        createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
      },
      {
        id: `tx-init-3`,
        type: TransactionType.WITHDRAWAL,
        toUsername: 'SonicTon_823',
        amount: 5.0,
        txHash: generateTxHash(),
        status: 'CONFIRMED' as const,
        createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
      }
    ];
  });

  const [currentTime, setCurrentTime] = useState<string>('');

  // Clock Update for iOS Dynamic Simulation bar
  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      setCurrentTime(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Getter for retrieving active user record inside queue
  const userParticipant = participants.find(p => p.username === 'My_Ton_Wallet');

  // Trigger deposit logic for user or simulation
  const addParticipantDeposit = (username: string, walletAddress: string, depositAmount: number, isCurrentUser?: boolean) => {
    if (systemStatus === SystemStatus.PAUSED) return;

    const mainTxHash = generateTxHash();
    const feeTxHash = generateTxHash();
    const nextPosition = participants.length + 1;

    // 1. Create the new participant entity
    const newParticipant: Participant = {
      id: `p-${Date.now()}`,
      userId: isCurrentUser ? 'user-current-id' : `mock-user-${Math.floor(2000 + Math.random() * 8000)}`,
      username: username,
      walletAddress: walletAddress,
      position: nextPosition,
      depositAmount: depositAmount,
      internalBalance: 0.0,
      totalRewardsReceived: 0.0,
      status: ParticipantStatus.ACTIVE,
      createdAt: new Date().toISOString(),
      withdrawnTotal: 0.0,
      txHashDeposit: mainTxHash
    };

    // 2. Main mathematical loop: Give +0.1 TON to ALL previous eligible ACTIVE participants in queue
    setParticipants(prevParticipants => {
      return prevParticipants.map(member => {
        // Eligibility constraint: ACTIVE, internal_balance < 15 TON, position before new entry
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
    });

    // 3. Increment Central Financial balances
    // Treasury receives 10 TON, projects gets 0.1 TON Project fee (net treasury is +9.9 TON)
    setTreasuryBalance(prev => parseFloat((prev + depositAmount - 0.1).toFixed(2)));
    setProjectBalance(prev => parseFloat((prev + 0.1).toFixed(2)));

    // 4. Create Transactions records
    const depositTx: Transaction = {
      id: `tx-dep-${Date.now()}-1`,
      type: TransactionType.DEPOSIT,
      fromUsername: username,
      amount: depositAmount,
      txHash: mainTxHash,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    };

    const feeTx: Transaction = {
      id: `tx-fee-${Date.now()}-2`,
      type: TransactionType.PROJECT_FEE,
      amount: 0.1,
      txHash: feeTxHash,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    };

    // Also populate some internal reward logs for the visual chain tracking of active members
    const rewardsList: Transaction[] = [];
    participants.forEach((member, i) => {
      if (
        member.status === ParticipantStatus.ACTIVE &&
        member.internalBalance < 15.0 &&
        member.position < nextPosition &&
        rewardsList.length < 5 // limit to 5 logs per deposit to avoid flooding UI space
      ) {
        rewardsList.push({
          id: `tx-rew-${Date.now()}-rew-${member.id}`,
          type: TransactionType.INTERNAL_REWARD,
          toUsername: member.username,
          amount: 0.1,
          txHash: `0x${Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')}`,
          status: 'CONFIRMED',
          createdAt: new Date(Date.now() + i * 50).toISOString()
        });
      }
    });

    setTransactions(prev => [depositTx, feeTx, ...rewardsList, ...prev]);

    // Append new member record to queue list
    setParticipants(prev => [...prev, newParticipant]);
  };

  // User trigger deposit helper
  const handleUserConfirmDeposit = (amount: number) => {
    addParticipantDeposit('My_Ton_Wallet', userWallet.address, amount, true);
  };

  // User trigger withdrawal logic
  const handleUserConfirmWithdraw = (amount: number) => {
    if (!userParticipant) return;

    // Deduct Treasury Balance and user wallet change
    setTreasuryBalance(prev => parseFloat((prev - amount).toFixed(2)));
    
    setUserWallet(prev => ({
      ...prev,
      ton: parseFloat((prev.ton + amount).toFixed(2))
    }));

    // Clear user row's off-chain balance in queue
    setParticipants(prev => prev.map(p => {
      if (p.username === 'My_Ton_Wallet') {
        const nextBalance = parseFloat((p.internalBalance - amount).toFixed(1));
        const hasCompleted = p.status === ParticipantStatus.COMPLETED;
        return {
          ...p,
          internalBalance: nextBalance,
          withdrawnTotal: parseFloat((p.withdrawnTotal + amount).toFixed(1)),
          status: hasCompleted ? ParticipantStatus.COMPLETED : ParticipantStatus.WITHDRAWN
        };
      }
      return p;
    }));

    // Generate withdrawal transaction
    const withdrawTx: Transaction = {
      id: `tx-with-${Date.now()}`,
      type: TransactionType.WITHDRAWAL,
      toUsername: 'My_Ton_Wallet',
      amount: amount,
      txHash: generateTxHash(),
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    };

    setTransactions(prev => [withdrawTx, ...prev]);
  };

  // Admin simulation actions
  const handleBlockUser = (isBlocked: boolean) => {
    setParticipants(prev => prev.map(p => {
      if (p.username === 'My_Ton_Wallet') {
        return {
          ...p,
          status: isBlocked ? ParticipantStatus.BLOCKED : ParticipantStatus.ACTIVE
        };
      }
      return p;
    }));
  };

  const isUserBlocked = userParticipant?.status === ParticipantStatus.BLOCKED;

  const handleResetSimulation = () => {
    if (window.confirm('Are you sure you want to reset the entire Queue simulation back to initial seed data?')) {
      const origs = generateInitialParticipants();
      setParticipants(origs);
      setTreasuryBalance(73.5);
      setProjectBalance(1.5);
      setSystemStatus(SystemStatus.ACTIVE);
      setAutoSimulate(true);
      setUserWallet({
        address: 'UQBt8f3G9aK8cRe7Vw2bNpXs9qZ4y3m5dL1t6u7v8w9xY',
        ton: 60.0,
        luckys: 150,
        connected: true
      });
      setActiveTab('HOME');
    }
  };

  const handleRetryFailedWithdrawals = () => {
    // Simulated background admin verification checks
    console.log('Admin triggered verification scan of failed transactions.');
  };

  // Auto Inflow Simulation Loop (Section 13)
  useEffect(() => {
    if (!autoSimulate || systemStatus !== SystemStatus.ACTIVE) return;

    const timer = setInterval(() => {
      const randomUser = generateRandomUsername();
      const mockTONAddress = `EQD${generateTxHash().slice(2, 42)}`;
      
      addParticipantDeposit(randomUser, mockTONAddress, 10.0, false);
    }, simulationSpeed * 1000);

    return () => clearInterval(timer);
  }, [autoSimulate, systemStatus, simulationSpeed, participants.length]);

  return (
    <div id="app-workspace" className="min-h-screen bg-[#04060a] text-slate-200 flex flex-col justify-center items-center font-sans py-6 px-4 relative overflow-hidden select-none">
      
      {/* Immersive glow effects */}
      <div className="absolute top-[-15%] left-[-15%] w-[450px] h-[450px] bg-blue-600/10 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[130px] pointer-events-none" />

      {/* Main glass card wrapper layout */}
      <div className="w-full max-w-md bg-[#0a0d14]/80 backdrop-blur-2xl rounded-[38px] border border-white/10 p-3 shadow-[0_20px_50px_rgba(59,130,246,0.12)] relative z-10 overflow-hidden flex flex-col min-h-[685px]">
        
        {/* iOS bar */}
        <div id="ios-status-bar" className="px-5 pt-2 pb-1.5 flex justify-between items-center text-[10px] text-slate-500 font-mono select-none">
          <span className="font-bold">{currentTime}</span>
          <div className="px-3 py-0.5 bg-white/5 border border-white/5 rounded-full text-[8.5px] font-black text-slate-400 tracking-widest font-sans">
            4YOU LITE TMA
          </div>
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>

        {/* Telegram App Nav Header */}
        <div id="applet-nav-header" className="px-4 py-3 flex justify-between items-center bg-white/[0.02] border border-white/5 rounded-2xl mx-1 select-none">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.4)]">
              <span className="text-base font-black text-white">4Y</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs font-black tracking-widest uppercase text-white font-display">4YOU Lite</h1>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              </div>
              <span className="text-[8px] uppercase tracking-wider text-blue-400 font-extrabold block mt-0.5">
                TON Blockchain Connected
              </span>
            </div>
          </div>

          <div className="flex gap-1.5">
            {autoSimulate && (
              <span className="text-[9px] bg-white/5 border border-white/10 rounded px-1.5 py-1 text-slate-400 font-mono font-bold flex items-center gap-1">
                <Clock className="w-2.5 h-2.5 text-blue-500" />
                {simulationSpeed}s
              </span>
            )}
            <span className={`text-[9px] font-bold border rounded px-2 py-1 flex items-center gap-1 uppercase ${
              systemStatus === SystemStatus.ACTIVE
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400'
                : 'bg-rose-950/40 border-rose-800 text-rose-300'
            }`}>
              {systemStatus}
            </span>
          </div>
        </div>

        {/* Mini Balance Quick Panel */}
        <div className="grid grid-cols-2 gap-2 mt-2 px-1">
          <div className="bg-white/[0.02] border border-white/5 px-3 py-2 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-[9px] text-white font-extrabold shadow-md">T</div>
              <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider leading-none">Wallet</span>
            </div>
            <strong className="text-[12.5px] font-black text-white font-mono">
              {userWallet.connected ? `${userWallet.ton.toFixed(1)} TON` : '—'}
            </strong>
          </div>

          <div className="bg-white/[0.02] border border-white/5 px-3 py-2 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-[9px] text-black font-extrabold shadow-md">S</div>
              <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider leading-none">Pending rewards</span>
            </div>
            <strong className="text-[12.5px] font-black text-amber-500 font-mono">
              {userParticipant ? `${userParticipant.internalBalance.toFixed(1)} TON` : '0.0'}
            </strong>
          </div>
        </div>

        {/* Viewport viewport */}
        <div id="tma-screens-viewport" className="px-1.5 pt-4 pb-20 min-h-[480px] max-h-[520px] overflow-y-auto mt-2 scrollbar-none flex-1">
          {activeTab === 'HOME' && (
            <HomeTab
              systemStatus={systemStatus}
              userWallet={userWallet}
              onConnectWallet={() => setUserWallet(prev => ({ ...prev, connected: true }))}
              onDisconnectWallet={() => setUserWallet(prev => ({ ...prev, connected: false }))}
              setActiveTab={setActiveTab}
              hasActivePosition={!!userParticipant}
            />
          )}

          {activeTab === 'DEPOSIT' && (
            <DepositTab
              systemStatus={systemStatus}
              userWallet={userWallet}
              setUserWallet={setUserWallet}
              treasuryWalletAddress={treasuryWalletAddress}
              onConfirmDeposit={handleUserConfirmDeposit}
              onSetStatusMessage={(msg) => console.log(msg)}
            />
          )}

          {activeTab === 'BALANCE' && (
            <MyBalanceTab
              userWallet={userWallet}
              userParticipant={userParticipant || null}
              onWithdraw={() => handleUserConfirmWithdraw(userParticipant?.internalBalance || 0)}
              systemStatus={systemStatus}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'QUEUE' && (
            <QueueTab
              participants={participants}
              userWallet={userWallet}
              userParticipant={userParticipant || null}
              transactions={transactions}
            />
          )}

          {activeTab === 'WITHDRAW' && (
            <WithdrawTab
              userWallet={userWallet}
              userParticipant={userParticipant || null}
              onConfirmWithdraw={handleUserConfirmWithdraw}
              systemStatus={systemStatus}
              treasuryBalance={treasuryBalance}
            />
          )}

          {activeTab === 'ADMIN' && (
            <AdminTab
              treasuryBalance={treasuryBalance}
              projectBalance={projectBalance}
              transactions={transactions}
              participants={participants}
              systemStatus={systemStatus}
              setSystemStatus={setSystemStatus}
              treasuryWalletAddress={treasuryWalletAddress}
              setTreasuryWalletAddress={setTreasuryWalletAddress}
              projectWalletAddress={projectWalletAddress}
              setProjectWalletAddress={setProjectWalletAddress}
              onBlockUser={handleBlockUser}
              userIsBlocked={isUserBlocked}
              onResetSimulation={handleResetSimulation}
              onRetryFailedWithdrawals={handleRetryFailedWithdrawals}
              autoSimulate={autoSimulate}
              setAutoSimulate={setAutoSimulate}
            />
          )}
        </div>

        {/* Global Bottom Tab Bar Panel */}
        <div id="bottom-pax-rail" className="absolute bottom-2.5 inset-x-3 bg-[#080a10]/95 backdrop-blur-lg rounded-[24px] border border-white/10 p-1.5 flex justify-between gap-1 z-30 shadow-2xl">
          <button
            onClick={() => setActiveTab('HOME')}
            className={`flex-1 py-2 rounded-xl flex flex-col items-center justify-center transition-all ${
              activeTab === 'HOME'
                ? 'bg-blue-650/15 text-blue-400 font-bold border border-blue-500/10 shadow-md'
                : 'text-slate-450 hover:text-slate-200'
            }`}
          >
            <Home className="w-4 h-4 mb-0.5" />
            <span className="text-[8.5px] font-black uppercase tracking-tight">Home</span>
          </button>

          <button
            onClick={() => setActiveTab('DEPOSIT')}
            className={`flex-1 py-2 rounded-xl flex flex-col items-center justify-center transition-all ${
              activeTab === 'DEPOSIT'
                ? 'bg-blue-650/15 text-blue-400 font-bold border border-blue-500/10 shadow-md'
                : 'text-slate-450 hover:text-slate-200'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 mb-0.5" />
            <span className="text-[8.5px] font-black uppercase tracking-tight">Deposit</span>
          </button>

          <button
            onClick={() => setActiveTab('BALANCE')}
            className={`flex-1 py-2 rounded-xl flex flex-col items-center justify-center transition-all ${
              activeTab === 'BALANCE'
                ? 'bg-blue-650/15 text-blue-400 font-bold border border-blue-500/10 shadow-md'
                : 'text-slate-450 hover:text-slate-200'
            }`}
          >
            <Coins className="w-4 h-4 mb-0.5" />
            <span className="text-[8.5px] font-black uppercase tracking-tight">Balance</span>
          </button>

          <button
            onClick={() => setActiveTab('QUEUE')}
            className={`flex-1 py-2 rounded-xl flex flex-col items-center justify-center transition-all ${
              activeTab === 'QUEUE'
                ? 'bg-blue-650/15 text-blue-400 font-bold border border-blue-500/10 shadow-md'
                : 'text-slate-450 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4 mb-0.5" />
            <span className="text-[8.5px] font-black uppercase tracking-tight">Queue</span>
          </button>

          <button
            onClick={() => setActiveTab('WITHDRAW')}
            className={`flex-1 py-2 rounded-xl flex flex-col items-center justify-center transition-all ${
              activeTab === 'WITHDRAW'
                ? 'bg-blue-650/15 text-blue-400 font-bold border border-blue-500/10 shadow-md'
                : 'text-slate-450 hover:text-slate-200'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 mb-0.5" />
            <span className="text-[8.5px] font-black uppercase tracking-tight">Claim</span>
          </button>

          <button
            onClick={() => setActiveTab('ADMIN')}
            className={`flex-1 py-2 rounded-xl flex flex-col items-center justify-center transition-all ${
              activeTab === 'ADMIN'
                ? 'bg-blue-650/15 text-blue-400 font-bold border border-blue-500/10 shadow-md'
                : 'text-slate-450 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4 mb-0.5" />
            <span className="text-[8.5px] font-black uppercase tracking-tight">Admin</span>
          </button>
        </div>
      </div>

      <div className="text-center mt-5 text-[10.5px] text-slate-500 max-w-sm space-y-1 relative z-10 pointer-events-none select-none">
        <p className="flex items-center justify-center gap-1.5 text-slate-500 font-black uppercase tracking-[0.2em] text-[9px]">
          <Cpu className="w-3.5 h-3.5 text-blue-500" />
          <span>4YOU GameFi Sandbox System</span>
        </p>
        <p className="leading-relaxed text-slate-400 font-sans">
          This system is optimized for Telegram Mini App contexts. Simulated values map onto standard TON blockchain off-chain transaction databases.
        </p>
      </div>
    </div>
  );
}
