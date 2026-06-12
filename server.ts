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

  // 1b. API: Fetch wallet balance safely from Toncenter
  app.get('/api/wallet/balance', async (req, res) => {
    const { address } = req.query;
    if (!address) {
      return res.status(400).json({ success: false, error: 'address parameter is required' });
    }

    try {
      const apiKey = process.env.TON_API_KEY || process.env.TONCENTER_API_KEY;
      const url = `${process.env.TON_API_BASE_URL || 'https://toncenter.com/api/v3'}/account?address=${encodeURIComponent(String(address))}`;
      const response = await fetch(url, {
        headers: apiKey ? { 'X-Api-Key': apiKey } : {}
      });

      if (!response.ok) {
        throw new Error(`Toncenter v3 returned HTTP status ${response.status}`);
      }

      const json: any = await response.json();
      const balanceNanoton = json.balance || '0';
      // nanotons in v3 accounts are usually standard 1e9 or 1e10, let's normalize
      const balanceTon = parseFloat(balanceNanoton) / 1000000000;
      res.json({ success: true, balance: balanceTon });
    } catch (err: any) {
      console.warn(`Wallet Balance inquiry failed: ${err.message}. Defaulting to 0.0`);
      res.json({ success: true, balance: 0.0, warning: err.message });
    }
  });

  // 2. API: Verify an on-chain deposit
  app.post('/api/deposit/verify', async (req, res) => {
    const { txHash, userAddress, username, telegramId } = req.body;

    if (!txHash || !userAddress || !username) {
      return res.status(400).json({ success: false, error: 'txHash, userAddress, and username parameters are required.' });
    }

    // Check pre-launch test limits (TEST_MODE=true & PUBLIC_LAUNCH=false)
    const adminTelegramIds = ['8618331744', '6228196481', '5314622858'];
    const isPublicLaunch = process.env.PUBLIC_LAUNCH === 'true';
    if (!isPublicLaunch) {
      if (!telegramId || !adminTelegramIds.includes(String(telegramId))) {
        return res.status(403).json({ 
          success: false, 
          error: `ACCESS_BLOCKED: Non-admin Telegram ID (${telegramId || 'None'}). This is an Internal Mainnet Test container. Non-admin users are strictly blocked during this test session.` 
        });
      }
    }

    try {
      const apiKey = process.env.TON_API_KEY || process.env.TONCENTER_API_KEY;
      const isDryRun = process.env.MAINNET_DRY_RUN === 'true';

      if (!isDryRun && !apiKey) {
        return res.status(400).json({ success: false, error: 'CONFIG_ERROR_MISSING_TON_API_KEY' });
      }

      const verification = await db.verifyOnChainDeposit(txHash, userAddress, username, apiKey || '');
      
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
    const { username, walletAddress, amount, telegramId } = req.body;

    if (!username || !walletAddress || !amount) {
      return res.status(400).json({ success: false, error: 'username, walletAddress, and amount are required.' });
    }

    // Check pre-launch test limits (TEST_MODE=true & PUBLIC_LAUNCH=false)
    const adminTelegramIds = ['8618331744', '6228196481', '5314622858'];
    const isPublicLaunch = process.env.PUBLIC_LAUNCH === 'true';
    if (!isPublicLaunch) {
      if (!telegramId || !adminTelegramIds.includes(String(telegramId))) {
        return res.status(403).json({ 
          success: false, 
          error: `ACCESS_BLOCKED: Non-admin Telegram ID (${telegramId || 'None'}). This is an Internal Mainnet Test container. Non-admin users are strictly blocked during this test session.` 
        });
      }
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

  // 7. API: Serve fallback high-contrast branding logo
  app.get('/logo.png', (req, res) => {
    // 64x64 blue & white circular visual logo
    const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5gYMDQYwLy8vLwAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLm0EAAAAbUlEQVRo3u3asQ0AIAwEsYf9d3YGFmDpHHIn96pS6vN9971D4gYgQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEDgscAAsbMD9zIK5fIAAAAASUVORK5CYII=';
    const imgBuf = Buffer.from(base64Png, 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': imgBuf.length
    });
    res.end(imgBuf);
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

    // Self-register webhook in production or configured modes
    const botToken = process.env.BOT_TOKEN;
    const appPublicUrl = process.env.APP_PUBLIC_URL;
    if (botToken && appPublicUrl) {
      const webhookUrl = `${appPublicUrl}/api/bot-updates`;
      console.log(`[TELEGRAM STARTUP HUB] Attempting auto-registration of bot webhook to: ${webhookUrl}`);
      fetch(`https://api.telegram.org/bot${botToken}/setWebhook?url=${encodeURIComponent(webhookUrl)}`)
        .then(res => res.json())
        .then((data: any) => {
          console.log('[TELEGRAM STARTUP HUB] Webhook status response:', JSON.stringify(data));
        })
        .catch(err => {
          console.error('[TELEGRAM STARTUP HUB] Auto-registration failed:', err.message);
        });
    } else {
      console.log('[TELEGRAM STARTUP HUB] Webhook registration skipped: BOT_TOKEN or APP_PUBLIC_URL is empty in environment.');
    }
  });
}

startServer();
