/**
 * @file index.js
 * @description Ultimate Multi-Booster Core - A systematic automation suite for GitHub and WakaTime.
 * @version 1.0.0
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
const puppeteer = require('puppeteer-core');
const { HttpsProxyAgent } = require('https-proxy-agent');

// --- Configuration & Constants ---
const PORT = process.env.DASHBOARD_PORT || 3030;
const PROFILE_INTERVAL_MINUTES = parseInt(process.env.INTERVAL_MINUTES) || 3;
const WAKATIME_INTERVAL_MINUTES = parseInt(process.env.WAKATIME_INTERVAL_MINUTES) || 2;
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK_URL;
const GIT_TOKEN = process.env.GITHUB_TOKEN;
const GIT_REPO = process.env.GITHUB_REPO;

const DUMMY_ENTITIES = (process.env.WAKATIME_ENTITIES || 'src/app.tsx,src/components/Dashboard.tsx,api/v1/auth.go').split(',');
const DUMMY_PROJECTS = (process.env.WAKATIME_PROJECTS || 'Quantum-AI,Cyber-Sec-Core').split(',');
const PROXIES = process.env.PROXY_LIST ? process.env.PROXY_LIST.split(',') : [];
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

/**
 * @typedef {Object} SystemStats
 * @property {number} totalViews - Total GitHub profile views simulated.
 * @property {string} wakatimeTime - Formatted total simulated coding time.
 * @property {string} gitStatus - Current state of the GitHub contribution bot.
 * @property {string} currentProxy - Current active proxy or direct connection info.
 * @property {number} totalHeartbeats - Number of successful WakaTime API pulses.
 * @property {string} uptime - Human-readable system uptime.
 * @property {boolean} isBrowsing - Whether the headless browser is currently active.
 * @property {number} startTime - Timestamp when the core was initiated.
 */
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

// Update stats loop
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

// --- Lazy-loaded dependencies ---
let HttpsProxyAgentModule;
async function getProxyAgent(proxy) {
  if (!HttpsProxyAgentModule) {
    HttpsProxyAgentModule = require('https-proxy-agent');
  }
  return new HttpsProxyAgentModule.HttpsProxyAgent(proxy);
}

/**
 * Configures an Axios instance with a rotating proxy if available.
 * @async
 * @returns {Promise<import('axios').AxiosInstance>} Configured axios instance.
 */
async function getAxios() {
  if (PROXIES.length > 0) {
    const proxy = getRandomItem(PROXIES);
    stats.currentProxy = proxy;
    const agent = await getProxyAgent(proxy);
    return axios.create({ httpsAgent: agent, proxy: false });
  }
  stats.currentProxy = 'DIRECT_CONNECTION';
  return axios;
}

/**
 * Performs a lightweight HTTP-based boost. 
 * Hits the primary target and all extra targets using axois.
 * This is very light and reliable even under high system load.
 * @async
 */
async function lightBoost() {
  const targets = [];
  if (process.env.TARGET_URL) targets.push(process.env.TARGET_URL);
  if (process.env.EXTRA_TARGETS) {
    targets.push(...process.env.EXTRA_TARGETS.split(','));
  }

  if (targets.length === 0) return;

  logger.info(`[LightBoost] Initiating HTTP pulse for ${targets.length} targets...`);
  
  for (const target of targets) {
    try {
      const api = await getAxios();
      await api.get(target, {
        headers: { 'User-Agent': getRandomItem(USER_AGENTS) },
        timeout: 10000
      });
      stats.totalViews++;
      logger.info(`[LightBoost] Success: ${target.substring(0, 30)}...`);
    } catch (err) {
      logger.error(`[LightBoost] Fail: ${target.substring(0, 30)}... | ${err.message}`);
    }
  }
}

/**
 * Sends a simulated heartbeat to the WakaTime API to earn coding time.
 * Uses randomized project names and files to ensure organic simulation.
 * @async
 */
async function sendWakatimeHeartbeat() {
  if (!process.env.WAKATIME_API_KEY || process.env.WAKATIME_API_KEY === 'YOUR_WAKATIME_API_KEY_HERE') return;
  const apiKey = process.env.WAKATIME_API_KEY;
  const authHeader = `Basic ${Buffer.from(apiKey).toString('base64')}`;
  const entity = getRandomItem(DUMMY_ENTITIES);
  const project = getRandomItem(DUMMY_PROJECTS);
  const editor = getRandomItem(DUMMY_EDITORS);
  const language = getRandomItem(DUMMY_LANGUAGES);
  const category = getRandomItem(DUMMY_CATEGORIES);
  
  const payload = {
    entity: entity,
    type: 'file',
    category: category,
    project: project,
    language: language,
    editor: editor,
    operating_system: OPERATING_SYSTEM,
    machine_name: MACHINE_NAME,
    time: Math.floor(Date.now() / 1000),
    is_write: Math.random() > 0.5
  };

  try {
    const api = await getAxios();
    // Simulate a WakaTime-specific plugin User-Agent for better dashboard icons
    const wakaUA = `wakatime/1.93.0 (${OPERATING_SYSTEM}) ${editor.replace(/\s/g, '')}/1.0.0`;
    
    const res = await api.post('https://api.wakatime.com/api/v1/users/current/heartbeats', payload, {
      headers: { 
        'Authorization': authHeader,
        'User-Agent': wakaUA
      }
    });
    stats.totalHeartbeats++;
    logger.info(`[WakaTime] Pulse: ${project} | Lang: ${language} | Ed: ${editor} | Status: ${res.status}`);
  } catch (err) {
    logger.error(`[WakaTime] Fail: ${err.message}`);
  }
}

/**
 * Orchestrates a headless browser visit to the target profile URLs.
 * Fallback to LightBoost on failure to ensure statistics are updated.
 * @async
 */
async function boostProfile() {
  const targets = [];
  if (process.env.TARGET_URL) targets.push(process.env.TARGET_URL);
  if (process.env.EXTRA_TARGETS) {
    targets.push(...process.env.EXTRA_TARGETS.split(','));
  }
  if (targets.length === 0) return;

  const target = getRandomItem(targets);

  logger.info(`[Browser] Initiating deep visit to: ${target}`);
  stats.isBrowsing = true;
  io.emit('stats', stats);

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-site-isolation-trials',
        '--no-zygote',
        '--disable-extensions',
        '--disable-background-networking',
        '--disable-default-apps',
        '--disable-sync',
        '--disable-translate',
        '--metrics-recording-only',
        '--no-first-run',
        '--safebrowsing-disable-auto-update',
        '--window-size=800,600'
      ],
      headless: 'new'
    });

    const page = await browser.newPage();
    await page.setUserAgent(getRandomItem(USER_AGENTS));
    await page.setViewport({ width: 800, height: 600 });
    
    // Attempt deep visit
    await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await new Promise(resolve => setTimeout(resolve, 8000));
    
    stats.totalViews++;
    logger.info(`[Browser] Successfully loaded profile. Count incremented.`);
  } catch (err) {
    logger.error(`[Browser] Deep visit failed: ${err.message}. Triggering LightBoost fallback...`);
    await lightBoost(); // Fallback to ensure stats update
  } finally {
    if (browser) await browser.close();
    stats.isBrowsing = false;
    io.emit('stats', stats);
  }
}

/**
 * Executes a 'contribution burst' by committing to a dummy repository.
 * This maintains the GitHub contribution graph (green dots).
 * @async
 */
async function runContributionBurst() {
  if (!GIT_TOKEN || !GIT_REPO || GIT_TOKEN === 'YOUR_GITHUB_PAT_HERE') {
    stats.gitStatus = 'OFF';
    return;
  }

  const repoPath = path.join(__dirname, 'activity-repo');
  try {
    const git = simpleGit();
    const isInstalled = await git.checkIsRepo().catch(() => true);
    if (!isInstalled && isInstalled !== true) throw new Error('Git missing');

    logger.info('[Git] Initiating activity sync...');
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
    
    const remote = `https://${GIT_TOKEN}@github.com/${GIT_REPO}.git`;
    await localGit.removeRemote('origin').catch(() => {});
    await localGit.addRemote('origin', remote);
    await localGit.push('origin', 'main');
    
    stats.gitStatus = 'SYNCED';
    logger.info('[Git] Green box registered.');
  } catch (err) {
    stats.gitStatus = 'FAILED';
    logger.error(`[Git] Fail: ${err.message}`);
  }
}

// --- Orchestration ---

// Light Boost Loop (Every 2 minutes) - Primary reliable driver
setInterval(lightBoost, 2 * 60 * 1000);

// Browser Loop (Every 10 minutes) - Secondary deep visit
setInterval(boostProfile, 10 * 60 * 1000);

// WakaTime Loop (Every 2 minutes)
setInterval(sendWakatimeHeartbeat, WAKATIME_INTERVAL_MINUTES * 60 * 1000);

// Schedulers
cron.schedule('0 */12 * * *', runContributionBurst);

// Boot
server.listen(PORT, () => {
  logger.info(`🚀 ULTIMATE BOOST CORE LIVE | http://localhost:${PORT}`);
  lightBoost();
  sendWakatimeHeartbeat();
  boostProfile();
  runContributionBurst();
});

function getRandomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
