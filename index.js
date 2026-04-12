/**
 * @file index.js
 * @description Ultimate Multi-Booster Core - World-Class Edition
 * @version 2.0.0
 * @license MIT
 */

require('dotenv').config();
const axios = require('axios');
const winston = require('winston');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const simpleGit = require('simple-git');
const cron = require('node-cron');
const fs = require('fs');
const { HttpsProxyAgent } = require('https-proxy-agent');

// Stealth Integrations
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

// --- Configuration & Constants ---
const PORT = process.env.DASHBOARD_PORT || 3030;
const PROFILE_INTERVAL_MINUTES = parseInt(process.env.INTERVAL_MINUTES) || 3;
const WAKATIME_INTERVAL_MINUTES = parseInt(process.env.WAKATIME_INTERVAL_MINUTES) || 2;
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK_URL;
const GIT_TOKEN = process.env.GITHUB_TOKEN;
const GIT_REPO = process.env.GITHUB_REPO;

const DUMMY_ENTITIES = (process.env.WAKATIME_ENTITIES || 'src/app.tsx,src/components/Dashboard.tsx,api/v1/auth.go').split(',');
const DUMMY_PROJECTS = (process.env.WAKATIME_PROJECTS || 'Quantum-AI,Cyber-Sec-Core').split(',');
let PROXIES = process.env.PROXY_LIST ? process.env.PROXY_LIST.split(',') : [];
const DUMMY_LANGUAGES = ['Java', 'TypeScript', 'JavaScript', 'YAML', 'Python', 'Docker', 'Go', 'Rust', 'SQL', 'Markdown', 'Shell'];
const DUMMY_EDITORS = ['IntelliJ IDEA', 'VS Code', 'PyCharm'];
const DUMMY_CATEGORIES = ['coding', 'debugging', 'writing docs', 'writing tests'];
const MACHINE_NAME = 'Peters-MacBook-Pro.local';
const OPERATING_SYSTEM = 'Mac';

const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
];

const stats = {
  totalViews: 0,
  wakatimeTime: '00:00:00',
  gitStatus: 'STANDBY',
  currentProxy: 'DIRECT',
  totalHeartbeats: 0,
  uptime: '0s',
  isBrowsing: false,
  startTime: Date.now()
};

// --- Logger Extension ---
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level}: ${message}`)
      )
    }),
    new winston.transports.File({ filename: 'booster.log' })
  ],
});

// --- Dashboard Server ---
const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static(path.join(__dirname, 'dashboard/public')));

io.on('connection', (socket) => {
  socket.emit('stats', stats);
});

// Broadcast logs
const originalLog = logger.log.bind(logger);
logger.log = function (level, message, ...args) {
  io.emit('log', { level, message });
  return originalLog(level, message, ...args);
};

setInterval(() => {
  const diff = Math.floor((Date.now() - stats.startTime) / 1000);
  const d = Math.floor(diff / 86400);
  const h = Math.floor((diff % 86400) / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  stats.uptime = `${d}d ${h}h ${m}m ${s}s`;
  const wtSeconds = stats.totalHeartbeats * (WAKATIME_INTERVAL_MINUTES * 60);
  const wh = Math.floor(wtSeconds / 3600);
  const wm = Math.floor((wtSeconds % 3600) / 60);
  stats.wakatimeTime = `${wh.toString().padStart(2, '0')}:${wm.toString().padStart(2, '0')}:${wtSeconds % 60}`;
  io.emit('stats', stats);
}, 1000);

/**
 * Scrapes fresh free proxies and strictly pre-validates them via Github API bounds tests.
 */
async function updateProxies() {
  try {
    logger.info('[ProxyEngine] Initiating stealth fetch & validation protocol...');
    const res = await axios.get('https://api.proxyscrape.com/v2/?request=displayproxies&protocol=http&timeout=1500&ssl=all&anonymity=elite');
    const rawList = res.data.split('\n').map(p => p.trim()).filter(p => p.length > 5);
    
    logger.info(`[ProxyEngine] Raw IPs acquired: ${rawList.length}. Executing concurrent Github-Zen pings...`);
    const validProxies = [];
    const BATCH_SIZE = 50;

    for (let i = 0; i < rawList.length; i += BATCH_SIZE) {
      const batch = rawList.slice(i, i + BATCH_SIZE);
      await Promise.allSettled(batch.map(async (proxy) => {
        const url = proxy.startsWith('http') ? proxy : `http://${proxy}`;
        const agent = new HttpsProxyAgent(url);
        const testApi = axios.create({ httpsAgent: agent, proxy: false, timeout: 3000 });
        // Ultimate validation target
        const check = await testApi.get('https://api.github.com/zen');
        if (check.status === 200) validProxies.push(url);
      }));
    }

    if (validProxies.length > 0) {
      PROXIES = validProxies;
      logger.info(`[ProxyEngine] Defense Matrix Cleared: Locked onto ${PROXIES.length} elite validated proxy pipelines.`);
    } else {
      logger.warn(`[ProxyEngine] All acquired proxies failed Github ping validation. Standing by for next cycle...`);
    }
  } catch (err) {
    logger.debug(`[ProxyEngine] Quiet failure in proxy routing protocol: ${err.message}`);
  }
}

async function getAxios() {
  if (PROXIES.length > 0) {
    const proxy = getRandomItem(PROXIES);
    stats.currentProxy = proxy.replace('http://', '');
    const agent = new HttpsProxyAgent(proxy);
    return axios.create({ httpsAgent: agent, proxy: false });
  }
  stats.currentProxy = 'DIRECT';
  return axios;
}

/**
 * World-class LightBoost featuring a Silent Recursive 3-Strike Retry sequence.
 */
async function lightBoost() {
  const targets = [];
  if (process.env.TARGET_URL) targets.push(process.env.TARGET_URL);
  if (process.env.EXTRA_TARGETS) targets.push(...process.env.EXTRA_TARGETS.split(','));
  if (targets.length === 0) return;

  logger.info(`[LightBoost] Pulsing ${targets.length} targets...`);
  
  for (const target of targets) {
    let success = false;
    let attempts = 0;
    const MAX_RETRIES = 3;

    while (!success && attempts < MAX_RETRIES) {
      attempts++;
      try {
        const api = await getAxios();
        await api.get(target, {
          headers: { 'User-Agent': getRandomItem(USER_AGENTS) },
          timeout: 8000
        });
        stats.totalViews++;
        success = true;
        logger.info(`[LightBoost] Registered organic view: ${target.substring(0, 30)} | IP: ${stats.currentProxy}`);
      } catch (err) {
        // Suppress expected proxy failure stack traces natively to debug console
        logger.debug(`[LightBoost] Attempt ${attempts}/${MAX_RETRIES} quietly rotated: Proxy dropped connection.`);
      }
    }
  }
}

async function sendWakatimeHeartbeat() {
  if (!process.env.WAKATIME_API_KEY || process.env.WAKATIME_API_KEY === 'YOUR_WAKATIME_API_KEY_HERE') return;
  const apiKey = process.env.WAKATIME_API_KEY.trim();
  const authHeader = `Basic ${Buffer.from(apiKey).toString('base64')}`;
  const entity = getRandomItem(DUMMY_ENTITIES);
  const project = getRandomItem(DUMMY_PROJECTS);
  const editor = getRandomItem(DUMMY_EDITORS);
  const language = getRandomItem(DUMMY_LANGUAGES);
  const category = getRandomItem(DUMMY_CATEGORIES);
  const payload = {
    entity, type: 'file', category, project, language, editor,
    operating_system: OPERATING_SYSTEM, machine_name: MACHINE_NAME,
    time: Math.floor(Date.now() / 1000), is_write: Math.random() > 0.5
  };
  try {
    const api = axios; // Unconditionally bypass proxies for 100% WakaTime hit reliability
    const wakaUA = `wakatime/1.93.0 (${OPERATING_SYSTEM}) ${editor.replace(/\s/g, '')}/1.0.0`;
    const res = await api.post('https://api.wakatime.com/api/v1/users/current/heartbeats', payload, {
      headers: { 'Authorization': authHeader, 'User-Agent': wakaUA }
    });
    stats.totalHeartbeats++;
    logger.info(`[WakaTime] Pulse: ${project} | Lang: ${language} | Ed: ${editor} | Status: ${res.status}`);
  } catch (err) {
    logger.debug(`[WakaTime] Quiet rejection: ${err.message}`);
  }
}

/**
 * Puppeteer deep simulation configured with Stealth Plugin bypass variables
 */
async function boostProfile() {
  const targets = [];
  if (process.env.TARGET_URL) targets.push(process.env.TARGET_URL);
  if (process.env.EXTRA_TARGETS) targets.push(...process.env.EXTRA_TARGETS.split(','));
  if (targets.length === 0) return;

  const target = getRandomItem(targets);
  const proxyUrl = PROXIES.length > 0 ? getRandomItem(PROXIES) : null;
  const proxyHost = proxyUrl ? proxyUrl.replace('http://', '').replace('/', '') : 'DIRECT';
  stats.currentProxy = proxyHost;

  logger.info(`[Browser] Submitting stealth Chromium instance to: ${target}`);
  stats.isBrowsing = true;
  io.emit('stats', stats);

  let browser;
  try {
    const launchArgs = [
      '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas', '--disable-gpu',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-background-networking', '--disable-default-apps', '--disable-sync',
      '--disable-translate', '--metrics-recording-only', '--no-first-run',
      '--safebrowsing-disable-auto-update', '--window-size=800,600'
    ];
    if (proxyUrl) launchArgs.push(`--proxy-server=${proxyUrl}`);

    browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
      args: launchArgs,
      headless: 'new'
    });

    const page = await browser.newPage();
    await page.setUserAgent(getRandomItem(USER_AGENTS));
    await page.setViewport({ width: 800, height: 600 });
    await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await new Promise(resolve => setTimeout(resolve, 8000));
    stats.totalViews++;
    logger.info(`[Browser] Successfully traversed DOM natively. Count incremented.`);
  } catch (err) {
    // Suppressed to debug standard view sequence logging
    logger.debug(`[Browser] Stealth pipeline silently rotated on load rejection (${err.message}).`);
    await lightBoost();
  } finally {
    if (browser) await browser.close();
    stats.isBrowsing = false;
    io.emit('stats', stats);
  }
}

async function runContributionBurst() {
  if (!GIT_TOKEN || !GIT_REPO || GIT_TOKEN === 'YOUR_GITHUB_PAT_HERE') {
    stats.gitStatus = 'OFF';
    return;
  }
  const repoPath = path.join(__dirname, 'activity-repo');
  try {
    const git = simpleGit();
    const isInstalled = await git.checkIsRepo().catch(() => true);
    if (!isInstalled && isInstalled !== true) throw new Error('Git payload missing');

    logger.info('[Git] Initiating master synchronization...');
    stats.gitStatus = 'BURSTING';
    
    if (!fs.existsSync(repoPath)) {
      fs.mkdirSync(repoPath);
      await simpleGit(repoPath).init();
      await simpleGit(repoPath).checkoutLocalBranch('main').catch(() => {});
    }

    const localGit = simpleGit(repoPath);
    await localGit.addConfig('user.name', 'Booster Bot');
    await localGit.addConfig('user.email', 'bot@ultimate.booster');
    const fileName = 'activity.log';
    fs.appendFileSync(path.join(repoPath, fileName), `Bump: ${new Date().toISOString()}\n`);
    await localGit.add(fileName);
    await localGit.commit('chore: update activity log [bot]');
    await localGit.branch(['-M', 'main']);
    
    const remote = `https://${GIT_TOKEN}@github.com/${GIT_REPO}.git`;
    await localGit.removeRemote('origin').catch(() => {});
    await localGit.addRemote('origin', remote);
    await localGit.push(['-f', '-u', 'origin', 'main']);
    
    stats.gitStatus = 'SYNCED';
    logger.info('[Git] Payload successfully transmitted to upstream branch.');
  } catch (err) {
    stats.gitStatus = 'FAILED';
    logger.debug(`[Git] Quiet drop during sync: Authorization or Target repository mismatch.`);
  }
}

// Orchestration Loops
setInterval(lightBoost, 2 * 60 * 1000);
setInterval(boostProfile, 10 * 60 * 1000);
setInterval(sendWakatimeHeartbeat, WAKATIME_INTERVAL_MINUTES * 60 * 1000);
cron.schedule('0 */12 * * *', runContributionBurst);

// Core Initialization
server.listen(PORT, async () => {
  logger.info(`🚀 ULTIMATE BOOST CORE LIVE | http://localhost:${PORT}`);
  await updateProxies();
  setInterval(updateProxies, 3 * 60 * 60 * 1000); // Re-validate strictly every 3 hours
  
  lightBoost();
  sendWakatimeHeartbeat();
  boostProfile();
  runContributionBurst();
});

function getRandomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
