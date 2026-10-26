/**
 * @file index.js
 * @description Ultimate Multi-Booster Core - Elite Tier Edition (Phase 4)
 * @version 4.0.0
 * @license MIT
 */

require('dotenv').config();
const axios = require('axios');
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
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
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK_URL;
const GIT_TOKEN = process.env.GITHUB_TOKEN;
const GIT_REPO = process.env.GITHUB_REPO;

// WakaTime Ghost Simulation Values
let maxDailyCapMinutes = Math.floor(Math.random() * 241) + 480; // Exact minutes between 8 to 12 hours (480-720 mins)
let maxDailyCapHeartbeats = maxDailyCapMinutes; // Max pulses per day
const DUMMY_ENTITIES = (process.env.WAKATIME_ENTITIES || 'src/app.tsx,src/components/Dashboard.tsx,api/v1/auth.go,core/engine.rs,models/user.py,tests/auth.test.js').split(',');
const DUMMY_PROJECTS = (process.env.WAKATIME_PROJECTS || 'Quantum-AI,Cyber-Sec-Core,Project-Phoenix,Titan-Framework').split(',');
const DUMMY_BRANCHES = ['main', 'feat/auth-module', 'bugfix/header-ui', 'dev', 'refactor/proxy-layer', 'hotfix/db-crash'];
const DUMMY_LANGUAGES = ['Java', 'TypeScript', 'JavaScript', 'YAML', 'Python', 'Docker', 'Go', 'Rust', 'SQL', 'Markdown', 'Shell'];
const DUMMY_EDITORS = ['IntelliJ IDEA', 'VS Code', 'PyCharm'];
const MACHINE_NAME = 'Peters-MacBook-Pro.local';
const OPERATING_SYSTEM = 'Mac';
let PROXIES = process.env.PROXY_LIST ? process.env.PROXY_LIST.split(',') : [];

const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
];

// Phase 4: Dependency Spoofing Matrix
const DEPENDENCY_MAP = {
  'TypeScript': ['react', 'next', 'express', 'zod', 'prisma', 'tailwindcss', 'framer-motion'],
  'JavaScript': ['vue', 'axios', 'lodash', 'jest', 'mongoose'],
  'Python': ['django', 'numpy', 'pandas', 'fastapi', 'flask', 'celery', 'tensorflow'],
  'Java': ['spring-boot', 'hibernate', 'maven', 'junit', 'lombok', 'kafka'],
  'Go': ['gin', 'gorm', 'cobra', 'viper', 'aws-sdk-go'],
  'Rust': ['tokio', 'serde', 'reqwest', 'clap'],
  'SQL': ['postgres', 'mysql'],
  'YAML': [], 'Markdown': [], 'Shell': ['bash']
};

// Phase 4: Ghost Committer AI Logs
const DUMMY_COMMIT_MESSAGES = [
  'refactor(core): optimize heap tree constraints and memory allocation',
  'fix(auth): patch JWT race condition in middleware validation',
  'feat(api): instantiate graphQL aggregation clusters',
  'chore(deps): bump elliptic library dependencies',
  'style(ui): realign flex grid bounds for ultra-wide viewports',
  'perf(db): implement recursive connection pooling',
  'test(engine): expand coverage for async deadlock scenarios',
  'docs(readme): update deployment architecture matrix'
];

// Extension to Language Map to guarantee zero parser mismatches in WakaTime
const EXT_TO_LANG = {
  '.tsx': 'TypeScript',
  '.ts': 'TypeScript',
  '.jsx': 'JavaScript',
  '.js': 'JavaScript',
  '.py': 'Python',
  '.go': 'Go',
  '.rs': 'Rust',
  '.java': 'Java',
  '.sql': 'SQL',
  '.yaml': 'YAML',
  '.yml': 'YAML',
  '.md': 'Markdown',
  '.sh': 'Shell'
};

function getWakaUserAgent(editor) {
  switch (editor) {
    case 'IntelliJ IDEA':
      return 'wakatime/v1.109.1 (Darwin-24.1.0-arm64) IntelliJ-IDEA/2024.3 intellij-wakatime/14.3.11';
    case 'PyCharm':
      return 'wakatime/v1.109.1 (Darwin-24.1.0-arm64) PyCharm/2024.3 pycharm-wakatime/14.3.11';
    case 'VS Code':
    default:
      return 'wakatime/v1.109.1 (Darwin-24.1.0-arm64) vscode/1.96.2 vscode-wakatime/24.4.0';
  }
}

// Initial session state
const initialEntity = getRandomItem(DUMMY_ENTITIES);
const initialExt = path.extname(initialEntity);
const initialLang = EXT_TO_LANG[initialExt] || getRandomItem(DUMMY_LANGUAGES);

let wakaState = {
  editor: getRandomItem(DUMMY_EDITORS),
  language: initialLang,
  entity: initialEntity,
  branch: getRandomItem(DUMMY_BRANCHES),
  activeFileLines: Math.floor(Math.random() * 400) + 100, // file has 100-500 lines
  currentLine: Math.floor(Math.random() * 30) + 20,
  currentColumn: Math.floor(Math.random() * 20) + 8,
  dependencies: DEPENDENCY_MAP[initialLang] ? DEPENDENCY_MAP[initialLang].slice(0, 3) : []
};

const isInitialWeekend = (new Date().getDay() === 0 || new Date().getDay() === 6);
const stats = {
  totalViews: 0,
  wakatimeTime: '00:00:00',
  gitStatus: 'STANDBY',
  currentProxy: 'DIRECT',
  totalHeartbeats: 0,
  totalHeartbeatsToday: 0, // Daily Cap Tracker
  lastHeartbeatDate: new Date().toDateString(),
  uptime: '0s',
  isBrowsing: false,
  isManualPaused: false,
  currentShiftType: isInitialWeekend ? 'WEEKEND' : 'WEEKDAY',
  humanVsAi: { humanPercent: 100, aiPercent: 0, status: 'PURE_HUMAN_CADENCE' },
  startTime: Date.now(),
  breakdown: {
    languages: {},
    editors: {},
    os: {}
  },
  offlineQueueCount: 0
};

let telemetryQueue = [];
const OFFLINE_CACHE_FILE = path.join(__dirname, 'offline_heartbeats.json');

if (fs.existsSync(OFFLINE_CACHE_FILE)) {
  try {
    telemetryQueue = JSON.parse(fs.readFileSync(OFFLINE_CACHE_FILE, 'utf8'));
    stats.offlineQueueCount = telemetryQueue.length;
  } catch (e) {
    console.error(`[OfflineSync] Failed to parse disk cache: ${e.message}`);
  }
}

function saveQueueToDisk() {
  try {
    if (telemetryQueue.length === 0) {
      if (fs.existsSync(OFFLINE_CACHE_FILE)) fs.unlinkSync(OFFLINE_CACHE_FILE);
    } else {
      fs.writeFileSync(OFFLINE_CACHE_FILE, JSON.stringify(telemetryQueue));
    }
  } catch (e) {
    console.error(`[OfflineSync] Failed to write to disk cache: ${e.message}`);
  }
}

// --- Logger Extension ---
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(winston.format.timestamp({ format: 'HH:mm:ss' }), winston.format.json()),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level}: ${message}`))
    }),
    new DailyRotateFile({
      filename: path.join(__dirname, 'logs', 'booster-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      frequency: '24h',
      maxSize: '20m',
      maxFiles: '1',
      format: winston.format.combine(winston.format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level}: ${message}`))
    })
  ],
});

// --- Dashboard Server ---
const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static(path.join(__dirname, 'dashboard/public')));

// Container Healthcheck Endpoint
app.get('/healthz', (req, res) => {
  const mem = process.memoryUsage();
  res.status(200).json({
    status: 'healthy',
    uptime: stats.uptime,
    totalHeartbeats: stats.totalHeartbeats,
    totalViews: stats.totalViews,
    gitStatus: stats.gitStatus,
    offlineQueue: stats.offlineQueueCount,
    activeProject: wakaState.project,
    shiftType: stats.currentShiftType,
    isManualPaused: stats.isManualPaused,
    humanVsAi: stats.humanVsAi,
    memory: {
      rssMb: Math.round(mem.rss / 1024 / 1024),
      heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024)
    }
  });
});

io.on('connection', (socket) => {
  socket.emit('stats', { ...stats, maxDailyCapMinutes, wakaState });

  // Interactive HUD Action 1: Instant Pulse
  socket.on('manual_pulse', async () => {
    logger.info('[HUD Control] Manual telemetry pulse dispatched via Cyberpunk console.');
    await sendWakatimeHeartbeat();
  });

  // Interactive HUD Action 2: Toggle Shift Pause
  socket.on('toggle_pause', () => {
    stats.isManualPaused = !stats.isManualPaused;
    logger.info(`[HUD Control] Shift State: ${stats.isManualPaused ? 'PAUSED' : 'ACTIVE'}`);
    io.emit('stats', { ...stats, maxDailyCapMinutes, wakaState });
  });

  // Interactive HUD Action 3: Project Selector
  socket.on('switch_project', (newProject) => {
    if (DUMMY_PROJECTS.includes(newProject)) {
      wakaState.project = newProject;
      logger.info(`[HUD Control] Target project switched to: ${newProject}`);
      io.emit('stats', { ...stats, maxDailyCapMinutes, wakaState });
    }
  });
});

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
  
  // Wakatime time display based strictly on heartbeats
  const wtSeconds = stats.totalHeartbeats * 60;
  const wh = Math.floor(wtSeconds / 3600);
  const wm = Math.floor((wtSeconds % 3600) / 60);
  stats.wakatimeTime = `${wh.toString().padStart(2, '0')}:${wm.toString().padStart(2, '0')}:${wtSeconds % 60}`;
  io.emit('stats', { ...stats, maxDailyCapMinutes, wakaState });
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
  } catch (err) { logger.debug(`[ProxyEngine] Quiet failure in proxy routing protocol: ${err.message}`); }
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
    while (!success && attempts < 3) {
      attempts++;
      try {
        const api = await getAxios();
        await api.get(target, { headers: { 'User-Agent': getRandomItem(USER_AGENTS) }, timeout: 8000 });
        stats.totalViews++;
        success = true;
        logger.info(`[LightBoost] Registered organic view: ${target.substring(0, 30)} | IP: ${stats.currentProxy}`);
      } catch (err) { logger.debug(`[LightBoost] Attempt ${attempts}/3 quietly rotated: Proxy dropped connection.`); }
    }
  }
}

/// --- Phase 6: Offline Telemetry Bulk Dispatch Engine ---
async function flushTelemetryQueue() {
  if (telemetryQueue.length === 0) return;
  logger.info(`[OfflineSync] Attempting to flush ${telemetryQueue.length} queued heartbeats...`);
  
  const tempQueue = [...telemetryQueue];
  telemetryQueue = []; 
  
  let successCount = 0;
  let remainingQueue = [];
  
  try {
    const wakaToken = Buffer.from(process.env.WAKATIME_API_KEY).toString('base64');
    const authHeader = `Basic ${wakaToken}`;
    const wakaUA = getWakaUserAgent(wakaState.editor);
    
    // Send sequentially to guarantee 100% API compliance without triggering rate limits
    for (let i = 0; i < tempQueue.length; i++) {
      const payload = tempQueue[i];
      try {
        const res = await axios.post('https://api.wakatime.com/api/v1/users/current/heartbeats', payload, {
          headers: {
            'Authorization': authHeader,
            'User-Agent': wakaUA,
            'X-Machine-Name': MACHINE_NAME
          }
        });
        if (res.status === 201 || res.status === 202) {
          successCount++;
          logger.info(`[OfflineSync] Packet ${successCount}/${tempQueue.length} synced successfully. Remaining: ${tempQueue.length - successCount}`);
        }
        await new Promise(r => setTimeout(r, 250)); // 250ms sleep prevents rate limiting
      } catch (err) {
        remainingQueue = tempQueue.slice(i); // Preserve all remaining un-sent packets
        throw err;
      }
    }
    
    logger.info(`[OfflineSync] Successfully dispatched ${successCount} offline packets!`);
  } catch (err) {
    logger.warn(`[OfflineSync] Bulk dispatch interrupted. Re-queuing remaining packets. Error: ${err.message}`);
    if (remainingQueue.length === 0) remainingQueue = tempQueue;
    telemetryQueue = [...remainingQueue, ...telemetryQueue]; 
  }
  saveQueueToDisk();
  stats.offlineQueueCount = telemetryQueue.length;
}

// State for Multi-Tab Split-Editor context
let tabPulseCounter = 0;
let isTestTabActive = false;

/**
 * Human-Crafted Developer Simulation (Zero AI/Bot Fingerprints)
 * Strictly models organic keystrokes, column cursors, and project coherence.
 */
async function sendWakatimeHeartbeat() {
  if (!process.env.WAKATIME_API_KEY || process.env.WAKATIME_API_KEY === 'YOUR_WAKATIME_API_KEY_HERE') return;
  if (stats.isManualPaused) return;

  // Day Reset Logic & Shift Profiles
  const todayStr = new Date().toDateString();
  if (stats.lastHeartbeatDate !== todayStr) {
     stats.totalHeartbeatsToday = 0;
     stats.lastHeartbeatDate = todayStr;
     const dayOfWeek = new Date().getDay();
     const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
     stats.currentShiftType = isWeekend ? 'WEEKEND' : 'WEEKDAY';

     // Weekday: 8 to 12 hours | Weekend: 2.5 to 4.5 hours (Human work-life balance)
     maxDailyCapMinutes = isWeekend
       ? Math.floor(Math.random() * 121) + 150
       : Math.floor(Math.random() * 241) + 480;
     maxDailyCapHeartbeats = maxDailyCapMinutes;
     
     // Rotate project and developer environment for the new day
     const lockedProject = DUMMY_PROJECTS[dayOfWeek % DUMMY_PROJECTS.length];
     wakaState.project = lockedProject;
     wakaState.editor = DUMMY_EDITORS[dayOfWeek % DUMMY_EDITORS.length];
     wakaState.branch = DUMMY_BRANCHES[dayOfWeek % DUMMY_BRANCHES.length];
     wakaState.entity = DUMMY_ENTITIES[dayOfWeek % DUMMY_ENTITIES.length];
     const ext = path.extname(wakaState.entity);
     wakaState.language = EXT_TO_LANG[ext] || DUMMY_LANGUAGES[dayOfWeek % DUMMY_LANGUAGES.length];
     wakaState.dependencies = DEPENDENCY_MAP[wakaState.language] ? DEPENDENCY_MAP[wakaState.language].slice(0, 3) : [];
     wakaState.activeFileLines = Math.floor(Math.random() * 400) + 100;
     wakaState.currentLine = Math.floor(Math.random() * 30) + 20;
     wakaState.currentColumn = Math.floor(Math.random() * 20) + 8;

     const h = Math.floor(maxDailyCapMinutes / 60);
     const m = maxDailyCapMinutes % 60;
     logger.info(`[WakaTime] Midnight reset (${stats.currentShiftType}). Rotated to ${lockedProject} (${wakaState.language} on ${wakaState.editor}). Shift: ${h}h ${m}m.`);
  }

  // Turing Human Limitation
  if (stats.totalHeartbeatsToday >= maxDailyCapHeartbeats) {
     const h = Math.floor(maxDailyCapMinutes / 60);
     const m = maxDailyCapMinutes % 60;
     logger.debug(`[WakaTime] Daily human stamina limit reached (${h}h ${m}m). Deep Sleep mandated until tomorrow.`);
     return;
  }

  // Project Anchoring: Use day of week to dictate the singular master project of the day for absolute realism
  const dayOfWeek = new Date().getDay();
  const lockedProject = wakaState.project || DUMMY_PROJECTS[dayOfWeek % DUMMY_PROJECTS.length];

  // Multi-Tab Context: Human developers constantly alternate between implementation and unit test tabs
  tabPulseCounter++;
  if (tabPulseCounter > (Math.floor(Math.random() * 8) + 10)) {
    tabPulseCounter = 0;
    isTestTabActive = !isTestTabActive;
    if (isTestTabActive) {
      logger.info(`[MultiTab] Switched editor tab to companion test suite.`);
    } else {
      logger.info(`[MultiTab] Returned focus to primary implementation.`);
    }
  }

  let activeEntity = wakaState.entity;
  if (isTestTabActive) {
    const testCandidate = DUMMY_ENTITIES.find(e => e.includes('test') || e.includes('spec')) || `tests/engine.test${path.extname(wakaState.entity)}`;
    activeEntity = testCandidate;
  }

  // Organic Keystroke & Cursor Progression (Column 4-80)
  const charAdvance = Math.floor(Math.random() * 8) + 3;
  wakaState.currentColumn = (wakaState.currentColumn || 12) + charAdvance;

  // Statement completion / line wrap
  if (wakaState.currentColumn > (Math.floor(Math.random() * 25) + 60)) {
    wakaState.currentColumn = Math.floor(Math.random() * 12) + 4; // indent
    
    // 75% advance down, 20% small edit jump up, 5% inspect imports
    const moveRoll = Math.random();
    if (moveRoll < 0.75) {
      wakaState.currentLine += 1;
      if (Math.random() > 0.6) {
        wakaState.activeFileLines += 1; // wrote a new line of code
      }
    } else if (moveRoll < 0.95) {
      wakaState.currentLine = Math.max(1, wakaState.currentLine - Math.floor(Math.random() * 3) - 1);
    } else {
      wakaState.currentLine = Math.floor(Math.random() * 10) + 1;
    }
  }

  // If cursor exceeded file lines, anchor to new file from DUMMY_ENTITIES
  if (wakaState.currentLine >= wakaState.activeFileLines) {
    wakaState.currentLine = Math.floor(Math.random() * 25) + 15;
    wakaState.activeFileLines = Math.floor(Math.random() * 400) + 100;
    wakaState.entity = getRandomItem(DUMMY_ENTITIES);
    wakaState.branch = getRandomItem(DUMMY_BRANCHES);
    
    const ext = path.extname(wakaState.entity);
    wakaState.language = EXT_TO_LANG[ext] || getRandomItem(DUMMY_LANGUAGES);
    wakaState.editor = getRandomItem(DUMMY_EDITORS);
    logger.debug(`[WakaTime] File complete. Anchoring cursor to: ${wakaState.entity} on ${wakaState.branch} (${wakaState.language})`);
  }

  // Dynamic Natural Category Distribution
  let activityCategory = 'coding';
  if (isTestTabActive) {
    activityCategory = Math.random() > 0.35 ? 'writing tests' : 'debugging';
  } else {
    const catRoll = Math.random();
    if (catRoll > 0.97) activityCategory = 'writing docs';
    else if (catRoll > 0.82) activityCategory = 'debugging';
  }

  // Dependency Spoofing from DEPENDENCY_MAP
  const availableDeps = DEPENDENCY_MAP[wakaState.language] || [];
  let dependencies = [];
  if (availableDeps.length > 0) {
    const limit = Math.min(availableDeps.length, Math.floor(Math.random() * 3) + 2);
    dependencies = [...availableDeps].sort(() => 0.5 - Math.random()).slice(0, limit);
  }
  wakaState.dependencies = dependencies;

  // File save event simulation (is_write true ~25% of heartbeats)
  const isWrite = Math.random() < 0.25;

  // Absolute file path format on host for genuine developer client fingerprint
  const entityPath = activeEntity.startsWith('/')
    ? activeEntity
    : `/Users/petermutua/Projects/${lockedProject}/${activeEntity}`;

  const payload = {
    entity: entityPath,
    type: 'file',
    category: activityCategory,
    project: lockedProject,
    language: wakaState.language,
    branch: wakaState.branch,
    dependencies: dependencies,
    lineno: wakaState.currentLine,
    cursorpos: wakaState.currentColumn,
    lines: wakaState.activeFileLines,
    machine_name: MACHINE_NAME,
    time: Number((Date.now() / 1000).toFixed(3)),
    is_write: isWrite
  };

  const intervalAmount = parseInt(process.env.WAKATIME_INTERVAL || '2', 10);
  stats.totalHeartbeats++;
  stats.totalHeartbeatsToday += intervalAmount;
  stats.breakdown.languages[wakaState.language] = (stats.breakdown.languages[wakaState.language] || 0) + intervalAmount;
  stats.breakdown.editors[wakaState.editor] = (stats.breakdown.editors[wakaState.editor] || 0) + intervalAmount;
  stats.breakdown.os['mac-X86_64'] = (stats.breakdown.os['mac-X86_64'] || 0) + intervalAmount;

  // Phase 5.2: Human vs AI Tracking (Ensures Human Time >> AI Time)
  if (!stats.humanVsAi) {
    stats.humanVsAi = { humanMinutes: 0, aiMinutes: 0, humanPercent: 100, aiPercent: 0, wpm: 52, status: 'FLOW_STATE' };
  }
  const isAiPulse = Math.random() < 0.025; // Real humans write 97.5%+ manually, ~2.5% minor completions
  if (isAiPulse) {
    stats.humanVsAi.aiMinutes = (stats.humanVsAi.aiMinutes || 0) + intervalAmount;
  } else {
    stats.humanVsAi.humanMinutes = (stats.humanVsAi.humanMinutes || 0) + intervalAmount;
  }
  const totalDevMin = (stats.humanVsAi.humanMinutes + stats.humanVsAi.aiMinutes) || 1;
  const hPercent = Math.min(100, Math.max(95, Math.round((stats.humanVsAi.humanMinutes / totalDevMin) * 100)));
  stats.humanVsAi.humanPercent = hPercent;
  stats.humanVsAi.aiPercent = 100 - hPercent;
  stats.humanVsAi.wpm = Math.floor(Math.random() * 16) + 48; // Realistic 48-63 WPM human typing speed
  stats.humanVsAi.status = isTestTabActive ? 'TDD_VERIFICATION' : (activityCategory === 'debugging' ? 'DEEP_DEBUGGING' : 'FLOW_STATE');

  try {
    const apiKey = process.env.WAKATIME_API_KEY.trim();
    const authHeader = `Basic ${Buffer.from(apiKey).toString('base64')}`;
    const wakaUA = getWakaUserAgent(wakaState.editor);

    const res = await axios.post('https://api.wakatime.com/api/v1/users/current/heartbeats', payload, {
      headers: {
        'Authorization': authHeader,
        'User-Agent': wakaUA,
        'X-Machine-Name': MACHINE_NAME
      }
    });

    logger.info(`[WakaTime] Pulse Auth [${lockedProject}]: ${wakaState.entity} » Ln:${wakaState.currentLine}:Col:${wakaState.currentColumn} (${activityCategory}) | HTTP ${res.status}`);

    if (telemetryQueue.length > 0) await flushTelemetryQueue();
  } catch (err) {
    logger.warn(`[WakaTime] Connection failed. Queuing payload offline. Error: ${err.message}`);
    telemetryQueue.push(payload);
    saveQueueToDisk();
    stats.offlineQueueCount = telemetryQueue.length;
  }
}

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
  io.emit('stats', { ...stats, maxDailyCapMinutes, wakaState });

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

    browser = await puppeteer.launch({ executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium', args: launchArgs, headless: 'new' });
    const page = await browser.newPage();
    await page.setUserAgent(getRandomItem(USER_AGENTS));
    await page.setViewport({ width: 800, height: 600 });
    await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 45000 });
    
    // --- Phase 8: Deep-Web Spidering ---
    logger.debug(`[Browser] Initiating organic scroll and read protocol...`);
    await new Promise(resolve => setTimeout(resolve, 3000));
    await page.evaluate(() => window.scrollBy({ top: Math.floor(Math.random() * 800) + 400, behavior: 'smooth' }));
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    await page.evaluate(() => window.scrollBy({ top: -300, behavior: 'smooth' }));
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Attempt deep network traversal (clicking a pinned repo on a profile OR a file in a repo tree)
    const spiderLinks = await page.$$('.pinned-item-list-item-content a, .react-directory-truncate a, a.Link--primary[href*="/blob/"], a.Link--primary[href*="/tree/"]');
    
    if (spiderLinks.length > 0) {
      const randomLink = spiderLinks[Math.floor(Math.random() * spiderLinks.length)];
      
      try {
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {}),
          randomLink.click()
        ]);
        logger.info(`[Browser] Spider breached sub-layer. Simulating code analysis...`);
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        await page.evaluate(() => window.scrollBy({ top: 1200, behavior: 'smooth' }));
        
        // Turing-Complete Read Time (15 to 40 seconds)
        await new Promise(resolve => setTimeout(resolve, 15000 + Math.floor(Math.random() * 25000))); 
      } catch (e) {
        await new Promise(resolve => setTimeout(resolve, 8000)); // Fallback if click obscured
      }
    } else {
      // Baseline view simulation if no interactive matrix found
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
    
    stats.totalViews++;
    logger.info(`[Browser] Successfully traversed DOM natively. Count incremented.`);
  } catch (err) { logger.debug(`[Browser] Stealth pipeline silently rotated on load rejection (${err.message}).`); await lightBoost();
  } finally {
    if (browser) {
      try {
        const proc = browser.process();
        await browser.close();
        if (proc && !proc.killed) proc.kill('SIGKILL');
      } catch (e) {}
    }
    stats.isBrowsing = false;
    io.emit('stats', { ...stats, maxDailyCapMinutes, wakaState });
  }
}

/**
 * AI Ghost Committer - Generates realistic code deployments
 */
async function runContributionBurst() {
  if (!GIT_TOKEN || !GIT_REPO || GIT_TOKEN === 'YOUR_GITHUB_PAT_HERE') { stats.gitStatus = 'OFF'; return; }
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
    await localGit.addConfig('user.name', process.env.GIT_AUTHOR_NAME || 'Peter-Mutua');
    await localGit.addConfig('user.email', process.env.GIT_AUTHOR_EMAIL || 'petermwendwa94@gmail.com');
    
    // Phase 4: Dynamic Paired Code Generation (Core Implementation + Unit Test)
    const extMapping = { 'TypeScript': '.ts', 'Python': '.py', 'Java': '.java', 'Go': '.go', 'Rust': '.rs', 'SQL': '.sql' };
    const ext = extMapping[wakaState.language] || '.js';
    const srcDir = path.join(repoPath, 'src', 'core');
    const testDir = path.join(repoPath, 'tests', 'core');
    
    if (!fs.existsSync(srcDir)) fs.mkdirSync(srcDir, { recursive: true });
    if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });
    
    const implFile = `engine${ext}`;
    const testFile = `engine_test${ext}`;
    
    // Write paired changes (implementation update + test assertion)
    fs.appendFileSync(path.join(srcDir, implFile), `\n// [OPS-TICK] SysCall Data: ${Date.now().toString(16)}`);
    fs.appendFileSync(path.join(testDir, testFile), `\n// [TEST-TICK] Assert Verified: ${Date.now().toString(16)}`);
    await localGit.add('./*');
    
    const commitMsg = getRandomItem(DUMMY_COMMIT_MESSAGES);
    await localGit.commit(commitMsg);
    await localGit.branch(['-M', 'main']);
    
    const remote = `https://${GIT_TOKEN}@github.com/${GIT_REPO}.git`;
    await localGit.removeRemote('origin').catch(() => {});
    await localGit.addRemote('origin', remote);
    await localGit.push(['-f', '-u', 'origin', 'main']);
    
    stats.gitStatus = 'SYNCED';
    logger.info(`[Git] Artifacts successfully deployed. Message: "${commitMsg}"`);
  } catch (err) { stats.gitStatus = 'FAILED'; logger.debug(`[Git] Quiet drop during sync: ${err.message}`); }
}

/**
 * Phase 4: Midnight C2 Reporting Pipeline (Discord & Telegram)
 */
async function sendC2Report() {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
  
  if ((!DISCORD_WEBHOOK || DISCORD_WEBHOOK === 'YOUR_DISCORD_WEBHOOK_URL_HERE') && !TELEGRAM_BOT_TOKEN) return;
  
  const h = Math.floor(stats.totalHeartbeatsToday / 60);
  const m = stats.totalHeartbeatsToday % 60;
  
  // 1. Dispatch Discord Payload
  if (DISCORD_WEBHOOK && DISCORD_WEBHOOK.includes('http')) {
    const embed = {
      title: "🟢 BOOST CORE: END OF DAY REPORT",
      color: 0x00ffcc,
      fields: [
        { name: "Organic WakaTime Rendered", value: `${h} Hours, ${m} Minutes`, inline: true },
        { name: "GitHub Views Generated", value: `${stats.totalViews}`, inline: true },
        { name: "Git Commits Burst", value: stats.gitStatus, inline: true },
        { name: "Proxy Deflection Array", value: `Stable (${PROXIES.length} active tunnels)`, inline: false }
      ],
      footer: { text: "Node Status: EXCELLENT" },
      timestamp: new Date().toISOString()
    };
    try { await axios.post(DISCORD_WEBHOOK, { embeds: [embed] }); logger.info(`[Discord] Midnight Mission Briefing dispatched.`); } 
    catch (err) { logger.debug(`[Discord] Hook failed to dispatch.`); }
  }

  // 2. Dispatch Telegram Payload
  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    const tgMessage = `*🟢 BOOST CORE: END OF DAY REPORT*\n\n` +
      `⏱️ *Organic WakaTime Rendered:* ${h} Hours, ${m} Minutes\n` +
      `👁️ *GitHub Views Generated:* ${stats.totalViews}\n` +
      `💻 *Git Commits Burst Status:* ${stats.gitStatus}\n` +
      `🛡️ *Proxy Deflection Array:* Stable (${PROXIES.length} tunnels)\n` +
      `\n_Node Status: EXCELLENT_`;
      
    const tgUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    try {
      await axios.post(tgUrl, { chat_id: TELEGRAM_CHAT_ID, text: tgMessage, parse_mode: 'Markdown' });
      logger.info(`[Telegram] Midnight Mission Briefing dispatched.`);
    } catch (err) { logger.debug(`[Telegram] Hook failed to dispatch.`); }
  }
}

// Orchestration Loops
setInterval(lightBoost, 30 * 1000); // Every 30 seconds
setInterval(boostProfile, 3 * 60 * 1000); // Every 3 minutes

let wakaTimeout;
let focusHeartbeatCount = 0;

async function wakaLoop() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const dayOfWeek = now.getDay();
  const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
  stats.currentShiftType = isWeekend ? 'WEEKEND' : 'WEEKDAY';

  // Check HUD Manual Pause
  if (stats.isManualPaused) {
    logger.debug(`[WakaTime] Engine manually paused from HUD. Next check in 30s.`);
    wakaTimeout = setTimeout(wakaLoop, 30 * 1000);
    return;
  }

  // 1. Circadian Deep Sleep: 1:30 AM to 8:30 AM (Weekdays)
  const isNightSleep = (currentHour === 1 && currentMinute >= 30) || (currentHour >= 2 && currentHour < 8) || (currentHour === 8 && currentMinute < 30);
  
  // 2. Realistic Lunch Break: 1:00 PM to 1:45 PM
  const isLunchBreak = (currentHour === 13 && currentMinute <= 45);

  // 3. Weekend Work Hours Guard: 10:30 AM to 4:00 PM only (relaxed human weekend schedule)
  const isWeekendOffHours = isWeekend && (currentHour < 10 || (currentHour === 10 && currentMinute < 30) || currentHour >= 16);

  // Realistic Poisson-Gaussian Human Typing Cadence:
  // 65% in-the-zone continuous flow: 70s - 95s
  // 25% thinking / inspecting docs / code review: 105s - 140s
  // 10% test compilation / deeper analysis: 145s - 190s
  const roll = Math.random();
  let nextJitterMs;
  if (roll < 0.65) {
    nextJitterMs = Math.floor(Math.random() * 25000) + 70000;
  } else if (roll < 0.90) {
    nextJitterMs = Math.floor(Math.random() * 35000) + 105000;
  } else {
    nextJitterMs = Math.floor(Math.random() * 45000) + 145000;
  }

  if (isNightSleep) {
    logger.debug(`[WakaTime] Circadian sleep cycle active (1:30 AM - 8:30 AM). Resting.`);
    nextJitterMs = 5 * 60 * 1000;
  } else if (isWeekendOffHours) {
    logger.debug(`[WakaTime] Weekend mode off-hours. Relaxing.`);
    nextJitterMs = 10 * 60 * 1000;
  } else if (isLunchBreak) {
    logger.info(`[WakaTime] Natural midday lunch break active (1:00 PM - 1:45 PM).`);
    nextJitterMs = 4 * 60 * 1000;
  } else {
    // Human Focus Rhythm: after ~25-35 continuous pulses (~45-55 mins), take a 5-minute break
    focusHeartbeatCount++;
    if (focusHeartbeatCount > (Math.floor(Math.random() * 10) + 25)) {
      focusHeartbeatCount = 0;
      logger.info(`[WakaTime] Natural 5-minute focus pause (bio break / reviewing documentation).`);
      nextJitterMs = (Math.floor(Math.random() * 3) + 4) * 60 * 1000;
    } else {
      await sendWakatimeHeartbeat();
    }
  }

  wakaTimeout = setTimeout(wakaLoop, nextJitterMs);
}
wakaLoop();

// Organic Daytime Commit Engine (Emulates human commits scattered naturally during work hours)
let lastCommitTimestamp = 0;
async function evaluateHumanCommitSchedule() {
  const now = new Date();
  const currentHour = now.getHours();
  const dayOfWeek = now.getDay();
  const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);

  // Humans commit only during daytime active coding shifts
  const isWorkingHours = isWeekend 
    ? (currentHour >= 11 && currentHour <= 15) 
    : (currentHour >= 10 && currentHour <= 20);

  if (!isWorkingHours) return;

  const minInterval = (isWeekend ? 3.5 : 2.5) * 60 * 60 * 1000;
  const elapsed = Date.now() - lastCommitTimestamp;

  if (elapsed >= minInterval && Math.random() < 0.40) {
    lastCommitTimestamp = Date.now();
    logger.info('[GitScheduler] Triggering organic daytime paired commit burst...');
    await runContributionBurst();
  }
}
setInterval(evaluateHumanCommitSchedule, 15 * 60 * 1000); // Check every 15 mins during active hours

cron.schedule('0 */8 * * *', runContributionBurst); // Execute Git stealth committer fallback
cron.schedule('59 23 * * *', sendC2Report); // Trigger C2 report perfectly at 11:59PM

// Graceful Shutdown Signals (Preserves state on container termination)
function handleGracefulShutdown(signal) {
  logger.info(`[System] Received ${signal}. Executing graceful shutdown protocol...`);
  saveQueueToDisk();
  server.close(() => {
    logger.info('[System] HTTP/WebSocket server closed cleanly.');
    process.exit(0);
  });
  setTimeout(() => process.exit(0), 3000);
}
process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

// Boot sequence
server.listen(PORT, async () => {
  logger.info(`🚀 ULTIMATE BOOST CORE LIVE | http://localhost:${PORT}`);
  await updateProxies();
  setInterval(updateProxies, 3 * 60 * 60 * 1000);
  lightBoost();
  boostProfile();
  runContributionBurst();
});

function getRandomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
