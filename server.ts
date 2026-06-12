/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { DbStore } from './src/serverStore';
import { SystemStatus } from './src/types';

// Process environment loading support
import dotenv from 'dotenv';
dotenv.config();

const port = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Instantiate persistent JSON Database store
  const db = new DbStore();

  // 1. API: Get full live state of the queue
  app.get('/api/state', (req, res) => {
    try {
      const state = db.getState();
      res.json({
        success: true,
        participants: state.participants,
        transactions: state.transactions,
        systemStatus: state.systemStatus,
        treasuryBalance: state.treasuryBalance,
        projectBalance: state.projectBalance,
        withdrawalLimit: state.withdrawalLimit,
        autoWithdrawalsEnabled: state.autoWithdrawalsEnabled,
        treasuryWalletAddress: state.treasuryWalletAddress,
        projectWalletAddress: state.projectWalletAddress,
        withdrawalSignerAddress: state.withdrawalSignerAddress
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. API: Verify an on-chain deposit
  app.post('/api/deposit/verify', async (req, res) => {
    const { txHash, userAddress, username } = req.body;

    if (!txHash || !userAddress || !username) {
      return res.status(400).json({ success: false, error: 'txHash, userAddress, and username parameters are required.' });
    }

    try {
      const apiKey = process.env.TON_API_KEY || 'a88e8289de44544087b3701067bd8eb2f610eaabd75c3c526ac13fd0092ccc42';
      const verification = await db.verifyOnChainDeposit(txHash, userAddress, username, apiKey);
      
      if (verification.success) {
        res.json({ success: true, message: verification.message, state: db.getState() });
      } else {
        res.status(400).json({ success: false, error: verification.message });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. API: Request high-limit payout
  app.post('/api/withdraw', (req, res) => {
    const { username, walletAddress, amount } = req.body;

    if (!username || !walletAddress || !amount) {
      return res.status(400).json({ success: false, error: 'username, walletAddress, and amount are required.' });
    }

    try {
      const numericAmount = parseFloat(amount.toString());
      const result = db.executeUserWithdrawal(username, walletAddress, numericAmount);

      if (result.success) {
        res.json({ success: true, message: result.message, state: db.getState() });
      } else {
        res.status(400).json({ success: false, error: result.message });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. API: Update admin config options
  app.post('/api/admin/config', (req, res) => {
    const { systemStatus, treasuryAddress, projectAddress, autoWithdrawals } = req.body;
    try {
      db.updateSystemConfig({ systemStatus, treasuryAddress, projectAddress, autoWithdrawals });
      res.json({ success: true, message: 'Settings modified.', state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. API: Reset DB to defaults
  app.post('/api/admin/reset', (req, res) => {
    try {
      db.resetDb();
      res.json({ success: true, message: 'Database reset succeeded.', state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6. Webhook route: /api/bot-updates
  app.post('/api/bot-updates', (req, res) => {
    const payload = req.body;
    console.log('[TELEGRAM WEBHOOK LOG]: Received update:', JSON.stringify(payload, null, 2));
    
    // Core bot message matching logic for simulation/webhook processing
    if (payload && payload.message) {
      const { text, chat, from } = payload.message;
      const chatId = chat ? chat.id : 'unknown';
      const senderName = from ? from.username || from.first_name : 'User';

      console.log(`[BOT MESSAGE]: "${text}" from ${senderName} (ChatID: ${chatId})`);

      // Mock automated reply context internally
      return res.json({
        success: true,
        reply: {
          chat_id: chatId,
          text: `Welcome, ${senderName}! 4YOU Lite Queue system is active. Your Telegram ID matches webhook indices.`
        }
      });
    }

    res.json({ success: true, message: 'Webhook event received successfully but contained no message body.' });
  });

  // Integrates Vite Middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`4YOU Lite full-stack system listening on port ${port} in ${process.env.NODE_ENV || 'development'} mode.`);
  });
}

startServer();
