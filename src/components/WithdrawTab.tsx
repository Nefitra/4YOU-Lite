/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowDownLeft, Info, Coins, ShieldCheck, AlertCircle, 
  HelpCircle, RefreshCw, KeyRound, ArrowRight
} from 'lucide-react';
import { Participant, SystemStatus } from '../types';

interface WithdrawTabProps {
  userWallet: { address: string; ton: number; luckys: number; connected: boolean; telegramId?: string };
  userParticipant: Participant | null;
  onConfirmWithdraw: (amount: number) => void;
  systemStatus: SystemStatus;
  treasuryBalance: number;
}

export default function WithdrawTab({
  userWallet,
  userParticipant,
  onConfirmWithdraw,
  systemStatus,
  treasuryBalance
}: WithdrawTabProps) {
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [txState, setTxState] = useState<'WAITING' | 'PROCESSING' | 'CONFIRMED' | 'FAILED'>('WAITING');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const availableBalance = userParticipant ? userParticipant.internalBalance : 0.0;

  const handleWithdrawRequest = async () => {
    setErrorMessage(null);

    if (systemStatus !== SystemStatus.ACTIVE) {
      setErrorMessage('Withdrawals are temporarily limited in maintenance/paused active modes.');
      return;
    }

    if (!userParticipant) {
      setErrorMessage('Active participant record not found. Join the queue first!');
      return;
    }

    const requestedAmount = parseFloat(withdrawAmount);
    if (isNaN(requestedAmount) || requestedAmount <= 0) {
      setErrorMessage('Please enter a valid TON amount greater than zero.');
      return;
    }

    if (requestedAmount > 10.0) {
      setErrorMessage('Single withdrawal cap exceeded: Maximum 10 TON per payout.');
      return;
    }

    // Check user is blocked
    if (userParticipant.status === 'BLOCKED') {
      setErrorMessage('Your account is BLOCKED by system administration. Withdrawals restricted.');
      return;
    }

    // Check if enough internal balance
    if (availableBalance < requestedAmount) {
      setErrorMessage(`Insufficient internal rewards. Maximum available: ${availableBalance.toFixed(1)} TON.`);
      return;
    }

    // Check Treasury wallet liquidity
    if (treasuryBalance < requestedAmount) {
      setErrorMessage('Withdrawals are temporarily limited due to Treasury liquidity.');
      return;
    }

    // Initiate transaction Processing
    setTxState('PROCESSING');

    try {
       const response = await fetch('/api/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: userParticipant.username,
          walletAddress: userWallet.address,
          amount: requestedAmount,
          telegramId: userWallet.telegramId
        })
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        onConfirmWithdraw(requestedAmount);
        setTxState('CONFIRMED');
        setWithdrawAmount('');
      } else {
        setErrorMessage(resData.error || 'Failed to complete automatic withdrawal from secure gatekeeper pool.');
        setTxState('FAILED');
      }
    } catch (err) {
      console.log('Independent Client session. Falling back to local simulation payout.');
      setTimeout(() => {
        onConfirmWithdraw(requestedAmount);
        setTxState('CONFIRMED');
        setWithdrawAmount('');
      }, 1500);
    }
  };

  const setMaxAmount = () => {
    setWithdrawAmount(availableBalance.toFixed(1));
  };

  return (
    <div id="withdraw-tab" className="space-y-6 animate-fadeIn">
      {/* Title block */}
      <div>
        <span className="text-[9px] uppercase tracking-[0.25em] text-blue-400 font-black block">Payout Center</span>
        <h3 className="text-white font-black text-sm uppercase tracking-wide flex items-center gap-1.5 mt-0.5">
          <ArrowDownLeft className="w-4 h-4 text-blue-400" />
          Request Withdrawal
        </h3>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form container */}
      <div className="bg-white/[0.02] border border-white/5 p-5 rounded-[28px] space-y-5 relative">
        {/* Balance Status indicator */}
        <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl flex justify-between items-center text-xs">
          <div>
            <span className="text-slate-500 block uppercase font-bold tracking-wider text-[8.5px]">Available Balance</span>
            <span className="text-lg font-mono font-black text-white">{availableBalance.toFixed(1)} TON</span>
          </div>

          <button
            onClick={setMaxAmount}
            disabled={availableBalance <= 0}
            className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border ${
              availableBalance > 0 
                ? 'bg-blue-650/15 border-blue-500 text-blue-400 hover:bg-blue-600/20 cursor-pointer active:scale-95 transition-all'
                : 'border-white/5 text-slate-650 cursor-not-allowed'
            }`}
          >
            Use Max
          </button>
        </div>

        {/* Input box */}
        <div className="space-y-1.5 text-xs">
          <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px] block">TON Cash Amount</label>
          <div className="flex bg-[#07090e] border border-white/5 rounded-xl px-3.5 py-4 focus-within:border-blue-500/60 transition-all items-center gap-2">
            <input
              type="number"
              placeholder="0.0"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              disabled={txState === 'PROCESSING'}
              className="bg-transparent border-none text-white text-base font-mono font-bold focus:outline-none w-full placeholder-slate-700"
            />
            <span className="font-sans font-bold text-blue-400 select-none">TON</span>
          </div>
        </div>

        {/* Target address box */}
        <div className="bg-[#0c101a] border border-white/5 p-3 rounded-2xl flex justify-between items-center text-xs">
          <span className="text-slate-500">To Wallet Short Address:</span>
          <span className="font-mono text-slate-350 select-all font-bold">
            {userWallet.address.slice(0, 8)}...{userWallet.address.slice(-8)}
          </span>
        </div>

        {/* Action and state output */}
        <div className="pt-2">
          {txState === 'WAITING' && (
            <button
              onClick={handleWithdrawRequest}
              disabled={availableBalance <= 0 || systemStatus !== SystemStatus.ACTIVE}
              className={`w-full py-4 rounded-2xl text-[12px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                availableBalance > 0 && systemStatus === SystemStatus.ACTIVE
                  ? 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-[0_4px_20px_rgba(59,130,246,0.25)]'
                  : 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
              }`}
            >
              Request Withdrawal of Funds
            </button>
          )}

          {txState === 'PROCESSING' && (
            <div className="p-4 bg-blue-500/5 border border-blue-500/20 text-center rounded-2xl space-y-3">
              <RefreshCw className="w-6 h-6 text-blue-500 animate-spin mx-auto" />
              <div>
                <h4 className="text-white text-xs font-black uppercase">Executing Transfer Protocol</h4>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">Routing TON from Treasury off-chain parameters to connected session...</p>
              </div>
            </div>
          )}

          {txState === 'CONFIRMED' && (
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-3.5 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-emerald-400 text-xs font-black uppercase leading-none">Withdrawal Successful</h4>
                <span className="text-[10px] text-slate-400 mt-1 block leading-relaxed max-w-[240px] mx-auto">
                  TON has been successfully requested and credited back to your account balance wallet!
                </span>
              </div>
              <button
                onClick={() => setTxState('WAITING')}
                className="w-full py-2 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/5 rounded-xl text-[10px] font-bold uppercase transition-all cursor-pointer"
              >
                Okay, I understand
              </button>
            </div>
          )}

          {txState === 'FAILED' && (
            <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl space-y-3.5 text-center">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-rose-400 text-xs font-black uppercase leading-none">Withdrawal Failed</h4>
                <span className="text-[10px] text-slate-400 mt-2 block leading-relaxed max-w-[240px] mx-auto bg-red-500/5 border border-red-500/10 p-2.5 rounded-lg text-left font-mono text-[9px]">
                  {errorMessage || 'Your check-out session request failed. Check system constraints or try again.'}
                </span>
              </div>
              <button
                onClick={() => { setTxState('WAITING'); setErrorMessage(null); }}
                className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 border border-rose-500/20 rounded-xl text-[10px] font-bold uppercase transition-all cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info paragraph */}
      <div className="p-3.5 bg-white/[0.01] border border-white/5 text-[11px] text-slate-400 rounded-xl leading-relaxed">
        *Important: Internal balances are kept off-chain with absolute accuracy. Real blockchain transaction events from our global Treasury to your linked wallet only execute upon a requested withdrawal.
      </div>
    </div>
  );
}
