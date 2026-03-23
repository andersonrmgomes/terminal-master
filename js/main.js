/* ═══════════════════════════════════════════════════
   TERMINAL::MASTER — MAIN.JS
   Desktop Environment + Window Manager + Game Logic
   ═══════════════════════════════════════════════════ */
'use strict';

// ─── MATRIX RAIN ───────────────────────────────────
(function () {
  const canvas = document.getElementById('matrix-canvas');
  const ctx = canvas.getContext('2d');
  const chars = '01アイウエオカキクケコサシスセソタチツテト'.split('');
  let cols, drops;
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cols = Math.floor(canvas.width / 18);
    drops = Array(cols).fill(1);
  }
  function draw() {
    ctx.fillStyle = 'rgba(13,17,23,0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff41';
    ctx.font = '14px Fira Code';
    drops.forEach((y, i) => {
      ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 18, y * 18);
      if (y * 18 > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    });
  }
  resize();
  window.addEventListener('resize', resize);
  setInterval(draw, 45);
})();

// ─── HELPERS ───────────────────────────────────────
const $ = id => document.getElementById(id);

// ─── AUDIO ENGINE ──────────────────────────────────
const AudioEngine = {
  ctx: null,
  init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === 'suspended') this.ctx.resume();
  },
  tone(freq, type, dur, vol = 0.04) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(); osc.stop(this.ctx.currentTime + dur);
    } catch (e) { }
  },
  keypress() { this.tone(700, 'sine', 0.04, 0.018); },
  success() { this.tone(520, 'triangle', 0.1, 0.04); setTimeout(() => this.tone(780, 'triangle', 0.15, 0.04), 90); },
  error() { this.tone(140, 'sawtooth', 0.25, 0.08); },
  open() { this.tone(440, 'sine', 0.12, 0.05); setTimeout(() => this.tone(660, 'sine', 0.1, 0.04), 80); }
};

// ─── GAME STATE ────────────────────────────────────
let G = {
  grubOs: null,
  pack: null,
  os: null,
  missionIndex: 0,
  xp: 0, level: 1,
  correct: 0, attempts: 0,
  hintShown: false, failCount: 0,
  unlockedAchievements: new Set(),
  progress: {},
  history: [], historyIdx: -1,
};

const XP_LEVELS = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200];
const RANKS = ['ROOKIE', 'INFILTRADO', 'EXPLORADOR', 'HACKER', 'ESPECIALISTA', 'ELITE', 'FANTASMA', 'MESTRE'];
const termState = { cwd: '~', prompt: 'infiltrado@server:~$' };

// ─── STATIC DATA (from missions.js) ────────────────
const ACHIEVEMENTS = window.GameData.ACHIEVEMENTS;
const RANKING_DATA = window.GameData.RANKING_DATA;
const QUICK_REF = window.GameData.QUICK_REF;

// ─── DESKTOP FOLDER DEFINITIONS ────────────────────
const PACKS = {
  linux: [
    { id: 'linux', icon: '📁', name: 'HACKING', badge: 'BASH', desc: 'Infiltração Unix/Linux — Operação Phantom Key' },
    { id: 'linux_network', icon: '📡', name: 'NET_DIAG', badge: 'NETWORK', desc: 'Diagnóstico de redes TCP/IP e interfaces' },
    { id: 'linux_web', icon: '🌐', name: 'SRV_WEB', badge: 'SYSADMIN', desc: 'Administração de servidores Nginx/Apache' },
    { id: 'linux_server', icon: '🖥️', name: 'SYS_ADMIN', badge: 'SYSADMIN', desc: 'Gerenciamento de processos e discos' },
  ],
  windows: [
    { id: 'windows', icon: '📁', name: 'HACKING_WIN', badge: 'CMD', desc: 'Infiltração Windows — CMD/PowerShell' },
    { id: 'windows_network', icon: '📡', name: 'WIN_NET', badge: 'INFRAESTRUTURA', desc: 'Mapeamento de interfaces e roteamento' },
  ],
};

// ─── SAVE / LOAD ────────────────────────────────────
function saveState() {
  if (G.pack) {
    G.progress[G.pack] = { missionIndex: G.missionIndex, correct: G.correct, attempts: G.attempts, os: G.os };
  }
  const data = {
    progress: G.progress,
    xp: G.xp, level: G.level,
    grubOs: G.grubOs,
    achievements: [...G.unlockedAchievements],
  };
  // Firebase (principal) + localStorage (fallback offline)
  if (window.fbSave && window.FB && window.FB.user) {
    window.fbSave(data);
  }
  try { localStorage.setItem('tm_save', JSON.stringify(data)); } catch(e) {}
}

let fbLoadedOnce = false;

async function loadState() {
  let s = null;
  // 1. One-Time Fetch (Somente viaja à nuvem no primeiro carregamento do Perfil, poupando Firebase Reads absurdos)
  if (!fbLoadedOnce && window.fbLoad && window.FB && window.FB.user) {
    try { 
      s = await window.fbLoad(); 
      if (s) {
        fbLoadedOnce = true;
        localStorage.setItem('tm_save', JSON.stringify(s));
      }
    } catch(e) {}
  }
  // 2. Cache Primário Engine-Host do Navegador (99% mais rápido e custo ZERO para Nuvem)
  if (!s) {
    try {
      const raw = localStorage.getItem('tm_save');
      if (raw) s = JSON.parse(raw);
    } catch(e) {}
  }
  if (!s) return;
  G.progress             = s.progress || {};
  G.xp                   = s.xp || 0;
  G.level                = s.level || 1;
  G.grubOs               = s.grubOs || null;
  G.unlockedAchievements = new Set(s.achievements || []);
}

// ─── BOOT ──────────────────────────────────────────
const BOOT_LINES = [
  '[  OK  ] Iniciando KERNEL PHANTOM v3.1.7...',
  '[  OK  ] Carregando módulos de infiltração...',
  '[  OK  ] Estabelecendo conexão segura (TOR)...',
  '[  OK  ] Criptografia AES-256 ativa.',
  '[  OK  ] Identidade mascarada: GHOST.',
  '[  OK  ] Servidor alvo localizado: 10.0.0.37',
  '[ WARN ] Sistemas de detecção ativos. Cuidado.',
  '[  OK  ] Ambiente isolado. Pronto para iniciar.',
  '',
  '> Bem-vindo ao TERMINAL::MASTER',
  '> Aguardando seleção de kernel...',
];

function boot() {
  const log = $('boot-log'), bar = $('boot-bar');
  let i = 0;
  const iv = setInterval(() => {
    if (i >= BOOT_LINES.length) { clearInterval(iv); setTimeout(afterBoot, 400); return; }
    const d = document.createElement('div');
    d.className = 'log-line';
    d.textContent = BOOT_LINES[i];
    d.style.color = BOOT_LINES[i].includes('WARN') ? 'var(--yellow)'
      : BOOT_LINES[i].startsWith('>') ? 'var(--cyan)'
        : 'var(--green-dim)';
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    bar.style.width = ((i + 1) / BOOT_LINES.length * 100) + '%';
    i++;
  }, 150);
}

function afterBoot() {
  const bs = $('boot-screen');
  bs.style.opacity = '0';
  bs.style.transition = 'opacity 0.4s ease';
  setTimeout(() => {
    bs.classList.remove('active');
    bs.style.display = 'none';
    bs.style.opacity = '';
    bs.style.transition = '';
    loadState().then(() => {
      if (G.grubOs) {
        showDesktop();
      } else {
        showGrub();
      }
    });
  }, 400);
}

// ─── GRUB ──────────────────────────────────────────
let grubIdx = 0, grubTimer = 10, grubIv = null;

function showGrub() {
  const s = $('grub-screen');
  s.style.display = 'flex'; s.classList.add('active');
  initGrub();
}

function initGrub() {
  grubIdx = 0; grubTimer = 10;
  updateGrubUI();
  const span = $('grub-timer'), msg = $('grub-timer-msg');
  if (span) span.textContent = grubTimer;
  if (msg) msg.style.display = 'block';
  clearInterval(grubIv);
  grubIv = setInterval(() => {
    grubTimer--;
    if (span) span.textContent = grubTimer;
    if (grubTimer <= 0) { clearInterval(grubIv); bootGrubOS(); }
  }, 1000);
  document.addEventListener('keydown', handleGrubKey);
}

function handleGrubKey(e) {
  const s = $('grub-screen');
  if (!s || !s.classList.contains('active')) return;
  if (['ArrowUp', 'ArrowDown', 'Enter'].includes(e.key)) {
    clearInterval(grubIv);
    const msg = $('grub-timer-msg'); if (msg) msg.style.display = 'none';
  }
  const items = document.querySelectorAll('.grub-item');
  if (e.key === 'ArrowDown') { grubIdx = (grubIdx + 1) % items.length; updateGrubUI(); }
  else if (e.key === 'ArrowUp') { grubIdx = (grubIdx - 1 + items.length) % items.length; updateGrubUI(); }
  else if (e.key === 'Enter') { bootGrubOS(); }
}

function selectGrubMouse(idx) {
  grubIdx = idx; updateGrubUI();
  clearInterval(grubIv);
  const msg = $('grub-timer-msg'); if (msg) msg.style.display = 'none';
}

function updateGrubUI() {
  document.querySelectorAll('.grub-item').forEach((el, i) => {
    el.classList.toggle('active', i === grubIdx);
    el.querySelector('.grub-arrow').textContent = i === grubIdx ? '*' : ' ';
  });
}

function bootGrubOS() {
  clearInterval(grubIv);
  document.removeEventListener('keydown', handleGrubKey);
  const items = document.querySelectorAll('.grub-item');
  if (!items.length) return;
  G.grubOs = items[grubIdx].getAttribute('data-os');
  // Fade out grub
  const gs = $('grub-screen');
  gs.style.opacity = '0';
  gs.style.transition = 'opacity 0.5s ease';
  saveState();
  setTimeout(() => {
    gs.classList.remove('active');
    gs.style.display = 'none';
    gs.style.opacity = '';
    gs.style.transition = '';
    // Show OS boot animation, then go to desktop
    if (window.showOSBoot) {
      showOSBoot(G.grubOs, showDesktop);
    } else {
      showDesktop();
    }
  }, 500);
}

// ─── DESKTOP ───────────────────────────────────────
function showDesktop() {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
  document.getElementById('game-window').style.display = 'none';

  const desk = $('desktop-screen');
  desk.className = 'screen'; // reset
  desk.classList.add('active', 'os-' + G.grubOs);
  desk.style.display = 'flex';
  desk.setAttribute('data-os-label', G.grubOs === 'linux' ? 'Fedora Linux 41' : 'Windows 11');
  // Fade in desktop
  desk.style.opacity = '0';
  setTimeout(() => { desk.style.transition = 'opacity 0.6s ease'; desk.style.opacity = '1'; }, 30);
  setTimeout(() => { desk.style.transition = ''; }, 700);

  // Taskbar branding
  $('taskbar-logo').textContent = G.grubOs === 'linux' ? '' : '';
  $('taskbar-os-name').textContent = G.grubOs === 'linux' ? 'Fedora' : 'Iniciar';
  $('taskbar-os-name').style.color = G.grubOs === 'linux' ? 'rgba(255,255,255,.75)' : 'rgba(255,255,255,.75)';
  setupStartMenu();
  $('taskbar-xp').textContent = 'XP: ' + G.xp;
  $('taskbar-rank').textContent = RANKS[Math.min(G.level - 1, RANKS.length - 1)];
  $('taskbar-windows').innerHTML = '';

  buildDesktopIcons();
  startClock();
}

function buildDesktopIcons() {
  const container = $('desktop-icons');
  container.innerHTML = '';

  const packs = PACKS[G.grubOs] || [];
  let col = 0, row = 0;
  const COL_W = 100, ROW_H = 110;
  const PAD_L = 24, PAD_T = 16;
  // Linux has dock at bottom (52px), Windows has taskbar at bottom (48px)
  const dockH = G.grubOs === 'linux' ? 52 : 48;
  const MAX_ROWS = Math.floor((window.innerHeight - dockH - 16) / ROW_H);

  packs.forEach(p => {
    const el = createFolderIcon(p);
    el.style.left = (PAD_L + col * COL_W) + 'px';
    el.style.top = (PAD_T + row * ROW_H) + 'px';
    container.appendChild(el);
    makeDraggable(el);

    row++;
    if (row >= MAX_ROWS) { row = 0; col++; }
  });


}

function createFolderIcon(p) {
  const el = document.createElement('div');
  el.className = 'folder';
  el.title = p.desc;

  const prog = G.progress[p.id];
  const done = prog ? prog.missionIndex : 0;
  const total = (window.GameData.MISSIONS[p.id] || []).length;
  const pct = total > 0 ? Math.round(done / total * 100) : 0;

  el.innerHTML = `
    <span class="folder-icon">${p.icon}</span>
    <span class="folder-name">${p.name}</span>
    <span class="folder-badge ${G.grubOs}">${p.badge}</span>
    ${total > 0 ? `<span style="font-size:9px;color:var(--text-dim);letter-spacing:1px">${pct}%</span>` : ''}
  `;

  // Single click → select
  el.addEventListener('click', e => {
    document.querySelectorAll('.folder.selected').forEach(f => f.classList.remove('selected'));
    el.classList.add('selected');
    e.stopPropagation();
  });

  // Double click → open
  let lastClick = 0;
  el.addEventListener('click', () => {
    const now = Date.now();
    if (now - lastClick < 400) openGameWindow(p.id, G.grubOs);
    lastClick = now;
  });

  return el;
}

// Deselect on desktop click
document.addEventListener('click', e => {
  if (e.target.id === 'desktop-area' || e.target.id === 'desktop-icons') {
    document.querySelectorAll('.folder.selected').forEach(f => f.classList.remove('selected'));
  }
});

// ─── TASKBAR CLOCK ─────────────────────────────────
function startClock() {
  function tick() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const el = $('taskbar-clock');
    if (el) el.textContent = h + ':' + m;
  }
  tick();
  setInterval(tick, 10000);
}

// ─── WINDOW MANAGER ────────────────────────────────
function makeDraggable(el, handle) {
  handle = handle || el;
  let dragging = false, ox = 0, oy = 0;
  handle.addEventListener('mousedown', e => {
    if (e.target.classList.contains('titlebar-dot')) return;
    dragging = true;
    ox = e.clientX - el.offsetLeft;
    oy = e.clientY - el.offsetTop;
    el.style.zIndex = 300;
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const x = Math.max(0, Math.min(window.innerWidth - 50, e.clientX - ox));
    const y = Math.max(0, Math.min(window.innerHeight - 50, e.clientY - oy));
    el.style.left = x + 'px';
    el.style.top = y + 'px';
  });
  document.addEventListener('mouseup', () => { dragging = false; });
}

function initWindowResize() {
  const win = $('game-window');
  const handle = $('resize-handle');
  if (!win || !handle) return;
  let resizing = false;
  handle.addEventListener('mousedown', e => { resizing = true; e.preventDefault(); e.stopPropagation(); });
  document.addEventListener('mousemove', e => {
    if (!resizing) return;
    win.style.width = Math.max(620, e.clientX - win.offsetLeft) + 'px';
    win.style.height = Math.max(400, e.clientY - win.offsetTop) + 'px';
  });
  document.addEventListener('mouseup', () => { resizing = false; });
}

let windowMinimized = false;

function openGameWindow(pack, os) {
  AudioEngine.init(); AudioEngine.open();
  const win = $('game-window');

  // Center window on screen
  const W = Math.min(960, window.innerWidth - 80);
  const H = Math.min(680, window.innerHeight - 90);
  win.style.width = W + 'px';
  win.style.height = H + 'px';
  win.style.left = Math.max(20, (window.innerWidth - W) / 2) + 'px';
  win.style.top = Math.max(40, (window.innerHeight - H) / 2 - 10) + 'px';
  win.style.display = 'flex';
  win.classList.remove('minimized');
  windowMinimized = false;

  // Update title
  const p = (PACKS[os] || []).find(x => x.id === pack) || {};
  $('window-title-text').textContent = (p.name || pack) + ' — Terminal';

  // Add/update taskbar button
  updateTaskbarButton(pack, p.name || pack, true);

  // Load mission pack
  selectOS(pack, os);
}

function closeGameWindow() {
  saveState();
  $('game-window').style.display = 'none';
  $('taskbar-windows').innerHTML = '';
  document.querySelectorAll('.folder.selected').forEach(f => f.classList.remove('selected'));
}

function minimizeGameWindow() {
  $('game-window').classList.add('minimized');
  $('game-window').style.display = 'none';
  windowMinimized = true;
  const btn = $('taskbar-windows').querySelector('.tb-window-btn');
  if (btn) btn.classList.remove('active');
}

function maximizeGameWindow() {
  const win = $('game-window');
  const desk = $('desktop-area');
  const taskbarH = 38;
  win.style.left = '0px';
  win.style.top = taskbarH + 'px';
  win.style.width = window.innerWidth + 'px';
  win.style.height = (window.innerHeight - taskbarH) + 'px';
}

function toggleWindowFromTaskbar(pack) {
  const win = $('game-window');
  if (windowMinimized || win.style.display === 'none') {
    win.classList.remove('minimized');
    win.style.display = 'flex';
    windowMinimized = false;
    updateTaskbarButton(pack, '', true);
  } else {
    minimizeGameWindow();
  }
}

function updateTaskbarButton(packId, name, active) {
  let btn = $('taskbar-windows').querySelector('.tb-window-btn');
  if (!btn) {
    btn = document.createElement('button');
    btn.className = 'tb-window-btn';
    btn.onclick = () => toggleWindowFromTaskbar(packId);
    $('taskbar-windows').appendChild(btn);
  }
  btn.textContent = '📟 ' + (name || packId);
  btn.classList.toggle('active', !!active);
}

// ─── OS SELECTION ──────────────────────────────────
function selectOS(pack, os) {
  G.pack = pack;
  G.os = os;
  const prog = G.progress[pack] || {};
  G.missionIndex = prog.missionIndex || 0;
  G.correct = prog.correct || 0;
  G.attempts = prog.attempts || 0;
  G.hintShown = false;
  G.failCount = 0;
  G.history = []; G.historyIdx = -1;

  termState.cwd = os === 'linux' ? '~' : 'C:\\Users\\Infiltrado';
  termState.prompt = os === 'linux' ? 'infiltrado@server:~$' : 'C:\\Users\\Infiltrado>';

  $('hud-os-label').textContent = os === 'linux' ? 'LINUX/BASH' : 'WINDOWS/CMD';
  $('chrome-title').textContent = os === 'linux' ? 'bash — infiltrado@server:~' : 'cmd.exe — C:\\Users\\Infiltrado';

  buildQuickRef();
  buildAchievementsGrid();
  buildRanking();
  updateStatus();
  printWelcome();
  loadMission();
}

// ─── TERMINAL PRINT ────────────────────────────────
function print(text, type) {
  const out = $('terminal-output');
  const d = document.createElement('div');
  d.className = 't-line t-' + (type || 'out') + ' type-in';
  d.textContent = text;
  out.appendChild(d);
  $('terminal-body').scrollTop = $('terminal-body').scrollHeight;
}
function printSep() { print('', 'out'); }

function printWelcome() {
  $('terminal-output').innerHTML = '';
  print(G.os === 'linux'
    ? 'Last login: Wed Jun 12 03:41:22 2024 from 10.0.0.1'
    : 'Microsoft Windows [Version 10.0.22621.3296]', 'dim');
  printSep();
  print('╔═══════════════════════════════════════════════════════╗', 'sys');
  print('║        OPERAÇÃO PHANTOM KEY — BRIEFING INICIAL        ║', 'sys');
  print('╚═══════════════════════════════════════════════════════╝', 'sys');
  printSep();
  print('Agente GHOST, acesso ao servidor alvo confirmado.', 'out');
  print('Recupere os arquivos criptografados sem ser detectado.', 'out');
  printSep();
}

// ─── MISSION LOAD ──────────────────────────────────
function loadMission() {
  const missions = window.GameData.MISSIONS[G.pack] || window.GameData.MISSIONS[G.os] || [];
  if (G.missionIndex >= missions.length) { showVictory(); return; }

  const m = missions[G.missionIndex];
  G.hintShown = false;
  G.failCount = 0;

  $('mission-phase-badge').textContent = m.phase.split('—')[0].trim();
  $('mission-icon').textContent = m.icon;
  $('mission-title').textContent = m.title;
  $('mission-desc').textContent = m.desc;
  $('task-command').textContent = m.objective;
  $('learn-text').innerHTML = m.learn;
  $('hint-box').style.display = 'none';
  $('hint-text').textContent = m.hint;
  $('hud-mission-name').textContent = m.title;

  const total = missions.length;
  $('progress-fill').style.width = (G.missionIndex / total * 100) + '%';
  $('progress-missions').textContent = 'MISSÃO ' + (G.missionIndex + 1) + ' / ' + total;

  // Word-wrapped box
  const BOX = 60;
  const tag = 'MISSÃO ' + (G.missionIndex + 1) + '/' + total + ': ' + m.title;
  const words = m.desc.split(' ');
  const lines = []; let cur = '';
  for (const w of words) {
    const next = cur ? cur + ' ' + w : w;
    if (next.length > BOX) { lines.push(cur); cur = w; } else cur = next;
  }
  if (cur) lines.push(cur);
  const padR = Math.max(1, BOX - tag.length - 1);

  printSep();
  print('╔═ ' + tag + ' ' + '═'.repeat(padR) + '╗', 'sys');
  lines.forEach(l => print('║ ' + l.padEnd(BOX) + ' ║', 'sys'));
  print('╚' + '═'.repeat(BOX + 2) + '╝', 'sys');
  printSep();
  print('▸ OBJETIVO: ' + m.objective, 'warn');
  printSep();

  updatePrompt();
  focusInput();

  if (G.missionIndex === 4) unlockAchievement('phase2');
  if (G.missionIndex === 10) unlockAchievement('phase3');
}

// ─── INPUT ─────────────────────────────────────────
function focusInput() {
  const inp = $('terminal-input');
  if (inp) { inp.focus(); updateCursor(); }
}

function updateCursor() {
  const input = $('terminal-input');
  const ghost = $('input-ghost');
  const cursor = $('cursor-caret');
  if (!input || !ghost || !cursor) return;
  const pos = input.selectionStart !== null ? input.selectionStart : input.value.length;
  ghost.textContent = input.value.slice(0, pos);
  cursor.style.left = ghost.offsetWidth + 'px';
}

document.addEventListener('DOMContentLoaded', () => {
  const input = $('terminal-input');
  if (!input) return;

  input.addEventListener('keydown', e => {
    AudioEngine.keypress();
    if (e.key === 'Enter') {
      handleCommand();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const tok = input.value.split(/\s+/);
      const last = tok[tok.length - 1];
      if (last) {
        const inSec = termState.cwd.includes('secret');
        const files = inSec
          ? ['arquivo_criptografado.enc', 'chave.key', 'logs.txt', 'readme_hack.md', 'tools/']
          : ['readme.txt', 'secret/'];
        const match = files.find(f => f.toLowerCase().startsWith(last.toLowerCase()));
        if (match) { tok[tok.length - 1] = match; input.value = tok.join(' '); }
      }
      setTimeout(updateCursor, 0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (G.historyIdx < G.history.length - 1) {
        G.historyIdx++;
        input.value = G.history[G.history.length - 1 - G.historyIdx] || '';
      }
      setTimeout(updateCursor, 0);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (G.historyIdx > 0) { G.historyIdx--; input.value = G.history[G.history.length - 1 - G.historyIdx] || ''; }
      else { G.historyIdx = -1; input.value = ''; }
      setTimeout(updateCursor, 0);
    }
  });

  input.addEventListener('input', () => setTimeout(updateCursor, 0));
  input.addEventListener('click', () => setTimeout(updateCursor, 0));
  input.addEventListener('keyup', () => setTimeout(updateCursor, 0));
  input.addEventListener('select', () => setTimeout(updateCursor, 0));
});

// ─── FREE COMMAND SIMULATOR ────────────────────────
function simulateFreeCommand(raw) {
  const s = termState;
  const tok = raw.trim().split(/\s+/);
  const base = tok[0].toLowerCase();
  const args = tok.slice(1);
  const arg1 = args[0] || '';
  const mIdx = G.missionIndex;
  const inSec = s.cwd.includes('secret') || s.cwd.includes('Secret');

  const filesRoot = ['readme.txt', 'secret/'];
  const filesSecret = [
    'arquivo_criptografado.enc', 'chave.key', 'logs.txt', 'readme_hack.md',
    ...(mIdx >= 5 ? ['tools/'] : []),
    ...(mIdx >= 6 ? ['decoy.log'] : []),
  ];
  const cur = inSec ? filesSecret : filesRoot;

  if (raw.includes('|')) return simulatePipe(raw, mIdx);

  // ── LINUX ──
  if (G.os === 'linux') {
    if (base === 'pwd' && !args.length) return [{ t: 'out', text: inSec ? '/home/infiltrado/secret' : '/home/infiltrado' }];

    if (base === 'ls') {
      const fL = raw.includes('-l'), fA = raw.includes('-a');
      const tgt = args.find(a => !a.startsWith('-')) || '';
      if (tgt) {
        const found = cur.find(f => f === tgt || f === tgt + '/');
        if (!found) return [{ t: 'err', text: "ls: cannot access '" + tgt + "': No such file or directory" }];
        if (fL) return [{ t: 'out', text: '-rw-r--r-- 1 infiltrado root 156 Jun 12 03:40 ' + tgt }];
        return [{ t: 'out', text: tgt }];
      }
      const list = fA ? ['.', '..', '.bash_history', '.bashrc', ...cur] : cur;
      if (!fL) return [{ t: 'out', text: list.join('  ') }];
      const out = [{ t: 'out', text: 'total ' + list.length * 4 }];
      list.forEach(f => {
        const dir = f.endsWith('/') || f === '.' || f === '..';
        const prm = dir ? 'drwxr-xr-x' : (f === 'chave.key' && mIdx < 8 ? '-r--------' : '-rw-r--r--');
        const own = (f === 'chave.key' && mIdx < 8) ? 'admin admin' : 'infiltrado root';
        out.push({ t: 'out', text: prm + '  1 ' + own + ' 4096 Jun 12 03:41 ' + f });
      });
      return out;
    }

    if (base === 'cd') {
      if (!arg1 || arg1 === '~') { s.cwd = '~'; s.prompt = 'infiltrado@server:~$'; return [{ t: 'sys', text: '📁 ~' }]; }
      if (arg1 === '..') { if (inSec) { s.cwd = '~'; s.prompt = 'infiltrado@server:~$'; } return [{ t: 'sys', text: '📁 ' + s.cwd }]; }
      if (arg1 === 'secret' && !inSec) { s.cwd = '~/secret'; s.prompt = 'infiltrado@server:~/secret$'; return [{ t: 'sys', text: '📁 ~/secret' }]; }
      if (arg1 === 'tools' && inSec && mIdx >= 5) return [{ t: 'sys', text: '📁 ~/secret/tools (vazio)' }];
      return [{ t: 'err', text: 'bash: cd: ' + arg1 + ': No such file or directory' }];
    }

    if (base === 'cat') { if (!arg1) return [{ t: 'err', text: 'cat: missing operand' }]; return catFile(arg1, mIdx); }
    if (base === 'mkdir') return arg1 ? [{ t: 'suc', text: '✓ Diretório "' + arg1 + '" criado.' }] : [{ t: 'err', text: 'mkdir: missing operand' }];
    if (base === 'touch') return arg1 ? [{ t: 'suc', text: '✓ Arquivo "' + arg1 + '" criado.' }] : [{ t: 'err', text: 'touch: missing operand' }];
    if (base === 'rm') return arg1 ? [{ t: 'suc', text: '✓ "' + arg1 + '" removido.' }] : [{ t: 'err', text: 'rm: missing operand' }];

    if (base === 'echo') {
      const rest = args.join(' '), gi = rest.indexOf('>');
      if (gi !== -1) return [{ t: 'suc', text: '✓ "' + rest.slice(0, gi).trim().replace(/^["']|["']$/g, '') + '" escrito em ' + rest.slice(gi + 1).replace(/^>/, '').trim() }];
      return [{ t: 'out', text: rest.replace(/^["']|["']$/g, '') }];
    }
    if (base === 'chmod') {
      if (args.length < 2) return [{ t: 'err', text: 'chmod: missing operand' }];
      return [{ t: 'suc', text: '✓ Permissões de ' + args[1] + ' alteradas para ' + args[0] }];
    }
    if (base === 'ps') return [
      { t: 'out', text: 'USER       PID %CPU %MEM COMMAND' },
      { t: 'out', text: 'root         1  0.0  0.1 /sbin/init' },
      { t: 'out', text: 'root       234  0.0  0.5 /usr/sbin/sshd' },
      { t: 'out', text: 'admin      891  2.1  1.2 security-monitor' },
      { t: 'out', text: 'admin      892  0.1  0.8 log-watcher' },
      { t: 'out', text: 'infiltrado ' + (900 + mIdx) + '  0.0  0.1 bash' },
    ];
    if (base === 'grep') {
      const fC = args.includes('-c'), fI = args.includes('-i'), fN = args.includes('-n');
      const pA = args.filter(a => !a.startsWith('-'));
      const pat = (pA[0] || '').replace(/^["']|["']$/g, ''), file = pA[1] || 'logs.txt';
      if (!pat) return [{ t: 'err', text: 'grep: missing pattern' }];
      const lines = grepFile(file, pat, fI, mIdx);
      if (fC) return [{ t: 'out', text: String(lines.length) }];
      if (!lines.length) return [];
      return lines.map((l, i) => ({ t: 'out', text: (fN ? (i + 1) + ':' : '') + l }));
    }
    if (base === 'find') {
      const ni = args.indexOf('-name'), pat = ni !== -1 ? (args[ni + 1] || '').replace(/^["']|["']$/g, '') : '';
      if (!pat) return [{ t: 'err', text: 'find: missing -name argument' }];
      return findFilesLinux(pat, mIdx);
    }
    if (base === 'wc') {
      const fL = args.includes('-l'), file = args.find(a => !a.startsWith('-')) || '';
      if (!file) return [{ t: 'err', text: 'wc: missing operand' }];
      return fL ? [{ t: 'out', text: '     7 ' + file }] : [{ t: 'out', text: '   7  47 312 ' + file }];
    }
    if (base === 'clear' || base === 'cls') { clearTerminal(); return []; }
    if (base === 'history') return G.history.map((h, i) => ({ t: 'dim', text: '  ' + (i + 1) + '  ' + h }));
    if (base === 'whoami') return [{ t: 'out', text: 'infiltrado' }];
    if (base === 'uname') return [{ t: 'out', text: 'Linux server 5.15.0-phantom #1 SMP x86_64 GNU/Linux' }];
    if (base === 'date') return [{ t: 'out', text: 'Wed Jun 12 03:41:22 UTC 2024' }];
    if (base === 'man') return arg1 ? [{ t: 'sys', text: 'Manual: ' + arg1 + ' — use --help para sintaxe rápida.' }] : [{ t: 'err', text: 'man: missing operand' }];
    return null;
  }

  // ── WINDOWS ──
  if (G.os === 'windows') {
    if (base === 'cd' && !args.length) return [{ t: 'out', text: s.cwd }];
    if (base === 'cd') {
      if (arg1 === '..') { if (inSec) { s.cwd = 'C:\\Users\\Infiltrado'; s.prompt = 'C:\\Users\\Infiltrado>'; } return [{ t: 'sys', text: '📁 ' + s.cwd }]; }
      if (arg1.toLowerCase() === 'secret' && !inSec) { s.cwd = 'C:\\Users\\Infiltrado\\secret'; s.prompt = 'C:\\Users\\Infiltrado\\secret>'; return [{ t: 'sys', text: '📁 ' + s.cwd }]; }
      return [{ t: 'err', text: 'O sistema não pode encontrar o caminho especificado.' }];
    }
    if (base === 'dir') {
      const fA = raw.includes('/a'), fS = raw.includes('/s'), fB = raw.includes('/b');
      const pat = args.find(a => !a.startsWith('/')) || '';
      if (fS && pat) return findFilesWin(pat, mIdx);
      const list = fA ? ['.', '..', '.credentials', ...cur] : cur;
      if (fB) return list.map(f => ({ t: 'out', text: s.cwd + '\\' + f.replace('/', '') }));
      const out = [{ t: 'out', text: ' Directory of ' + s.cwd }, { t: 'out', text: '' }];
      list.forEach(f => { const d = f.endsWith('/') || f === '.' || f === '..'; out.push({ t: 'out', text: '12/06/2024  03:41    ' + (d ? '<DIR>         ' : '          2048') + ' ' + f.replace('/', '') }); });
      out.push({ t: 'out', text: '' }, { t: 'dim', text: '       ' + list.length + ' arquivo(s)' });
      return out;
    }
    if (base === 'type') { if (!arg1) return [{ t: 'err', text: 'O comando de sintaxe está incorreto.' }]; return catFile(arg1, mIdx); }
    if (base === 'echo') {
      const rest = args.join(' '), gi = rest.indexOf('>');
      if (gi !== -1) return [{ t: 'suc', text: '✓ "' + rest.slice(0, gi).trim().replace(/^["']|["']$/g, '') + '" escrito em ' + rest.slice(gi + 1).replace(/^>/, '').trim() }];
      return [{ t: 'out', text: rest }];
    }
    if (base === 'mkdir' || base === 'md') return arg1 ? [{ t: 'suc', text: '✓ Pasta "' + arg1 + '" criada.' }] : [{ t: 'err', text: 'Sintaxe incorreta.' }];
    if (base === 'tasklist') return [
      { t: 'out', text: 'Image Name              PID  Mem Usage' },
      { t: 'out', text: '====================== ==== ==========' },
      { t: 'out', text: 'System                   4      236 K' },
      { t: 'out', text: 'svchost.exe            892    8.412 K' },
      { t: 'out', text: 'SecurityMonitor.exe   1341   12.048 K' },
      { t: 'out', text: 'LogWatcher.exe        1342    6.128 K' },
      { t: 'out', text: 'cmd.exe              ' + (1400 + mIdx) + '    3.012 K' },
    ];
    if (base === 'findstr') {
      const cA = args.find(a => a.startsWith('/c:')), fI = raw.includes('/i'), fN = raw.includes('/n');
      let pat = '', file = '';
      if (cA) { pat = cA.slice(3).replace(/^["']|["']$/g, ''); file = args.find(a => !a.startsWith('/')) || ''; }
      else { const pA = args.filter(a => !a.startsWith('/')); pat = (pA[0] || '').replace(/^["']|["']$/g, ''); file = pA[1] || ''; }
      if (!pat) return [{ t: 'err', text: 'FINDSTR: sintaxe incorreta.' }];
      const lines = grepFile(file || 'logs.txt', pat, fI, mIdx);
      if (raw.includes('/c:')) return [{ t: 'out', text: (file || 'logs.txt') + ':' + lines.length }];
      if (!lines.length) return [];
      return lines.map((l, i) => ({ t: 'out', text: (fN ? (file || 'logs.txt') + ':' + (i + 1) + ':' : '') + l }));
    }
    if (base === 'icacls') {
      const tgt = args.find(a => !a.startsWith('/')) || '', gi = args.indexOf('/grant');
      if (gi !== -1) return [{ t: 'out', text: 'processed file: ' + tgt }, { t: 'suc', text: '✓ Permissão concedida para ' + (args[gi + 1] || 'Everyone') }];
      const perms = (tgt === 'chave.key' && mIdx < 8) ? 'NT AUTHORITY\\SYSTEM:(F)\n          BUILTIN\\Administrators:(R)' : 'Everyone:(R)\n          BUILTIN\\Administrators:(F)';
      const pp = perms.split('\n');
      return [{ t: 'out', text: tgt + ' ' + pp[0] }, { t: 'out', text: pp[1] }, { t: 'out', text: 'Successfully processed 1 files; Failed processing 0 files' }];
    }
    if (base === 'cls' || base === 'clear') { clearTerminal(); return []; }
    if (base === 'whoami') return [{ t: 'out', text: 'servidor\\infiltrado' }];
    if (base === 'date') return [{ t: 'out', text: 'Wed 06/12/2024' }];
    if (base === 'ver') return [{ t: 'out', text: 'Microsoft Windows [Version 10.0.22621.3296]' }];
    return null;
  }
  return null;
}

function simulatePipe(cmd, mIdx) {
  const parts = cmd.split('|').map(p => p.trim());
  const leftOut = simulateFreeCommand(parts[0]) || [];
  const textLines = leftOut.map(l => l.text || '');
  const right = (parts[1] || '').trim();
  const rTok = right.split(/\s+/);
  const rBase = rTok[0].toLowerCase();
  const rArgs = rTok.slice(1);

  if (rBase === 'grep' || rBase === 'findstr') {
    const cA = rArgs.find(a => a.startsWith('/c:')), fC = rArgs.includes('-c') || !!cA;
    const fI = rArgs.includes('-i') || rArgs.includes('/i');
    let pat = cA ? cA.slice(3) : rArgs.find(a => !a.startsWith('-') && !a.startsWith('/')) || '';
    pat = pat.replace(/^["']|["']$/g, '');
    if (!pat) return leftOut;
    const matches = textLines.filter(l => fI ? l.toLowerCase().includes(pat.toLowerCase()) : l.includes(pat));
    if (fC) return [{ t: 'out', text: String(matches.length) }];
    return matches.length ? matches.map(l => ({ t: 'out', text: l })) : [];
  }
  if (rBase === 'wc' && rArgs.includes('-l')) return [{ t: 'out', text: String(textLines.filter(l => l).length) }];
  if (rBase === 'sort') return [...textLines].sort().map(l => ({ t: 'out', text: l }));
  if (rBase === 'head') { const n = parseInt(rArgs.find(a => !isNaN(parseInt(a))) || '10'); return textLines.slice(0, n).map(l => ({ t: 'out', text: l })); }
  if (rBase === 'tail') { const n = parseInt(rArgs.find(a => !isNaN(parseInt(a))) || '10'); return textLines.slice(-n).map(l => ({ t: 'out', text: l })); }
  return leftOut;
}

function catFile(filename, mIdx) {
  const f = filename.toLowerCase().replace(/^[./\\]+/, '');
  const db = {
    'readme.txt': [{ t: 'out', text: 'SERVIDOR DE OPERAÇÕES — PHANTOM' }, { t: 'out', text: 'Acesso não autorizado será monitorado.' }],
    'readme_hack.md': [{ t: 'out', text: '# OPERAÇÃO PHANTOM KEY' }, { t: 'out', text: '' }, { t: 'out', text: 'Os arquivos .enc foram cifrados com AES-256.' }, { t: 'out', text: 'A chave está em chave.key — só "admin" pode ler.' }],
    'readme_hack.txt': [{ t: 'out', text: '# OPERACAO PHANTOM KEY' }, { t: 'out', text: '' }, { t: 'out', text: 'Os arquivos .enc foram cifrados com AES-256.' }, { t: 'out', text: 'A chave esta em chave.key — so SYSTEM tem acesso.' }],
    'chave.key': mIdx >= 8
      ? [{ t: 'out', text: '╔════════════════════════════════════════╗' }, { t: 'out', text: '║  PHANTOM KEY — AES-256 DECRYPTION     ║' }, { t: 'out', text: '╚════════════════════════════════════════╝' }, { t: 'out', text: 'KEY: 4f8a2b9c1e7d3f6a0b5c8d2e4f1a9b3c' }]
      : [{ t: 'err', text: G.os === 'linux' ? 'cat: chave.key: Permission denied' : 'Acesso negado.' }],
    'logs.txt': [
      { t: 'out', text: '[INFO]  Jun 12 01:00 Sistema iniciado.' },
      { t: 'out', text: '[INFO]  Jun 12 02:14 Backup concluído.' },
      { t: 'out', text: '[ERRO]  Jun 12 03:47 Tentativa de acesso não autorizado: 192.168.1.99' },
      { t: 'out', text: '[INFO]  Jun 12 03:50 Serviço reiniciado.' },
      { t: 'out', text: '[ERRO]  Jun 12 03:83 Falha de autenticação para "root"' },
      { t: 'out', text: '[WARN]  Jun 12 03:89 Múltiplas tentativas detectadas.' },
      { t: 'out', text: '[ERRO]  Jun 12 03:91 chave.key acessada — permissão modificada.' },
    ],
    'decoy.log': [{ t: 'out', text: 'Sistema normal' }],
    'arquivo_criptografado.enc': [{ t: 'out', text: '>>> PHANTOM ENCRYPTED PAYLOAD — OPERATION COMPLETE <<<' }, { t: 'out', text: 'ENCRYPTED BLOCK 0x01: a3f8b2c9d4e1f0a7b8c9d0e1f2a3b4c5' }, { t: 'out', text: 'CHECKSUM: 9f8e7d6c5b4a3928' }],
  };
  return db[f] || [{ t: 'err', text: (G.os === 'linux' ? 'cat' : 'type') + ': ' + filename + ': No such file or directory' }];
}

function grepFile(filename, pattern, ci, mIdx) {
  return catFile(filename || 'logs.txt', mIdx).map(l => l.text || '')
    .filter(l => ci ? l.toLowerCase().includes(pattern.toLowerCase()) : l.includes(pattern));
}

function findFilesLinux(pattern, mIdx) {
  const g = pattern.replace(/\*/g, '');
  const all = ['/home/infiltrado/readme.txt', '/home/infiltrado/secret/arquivo_criptografado.enc', '/home/infiltrado/secret/chave.key', '/home/infiltrado/secret/logs.txt', '/home/infiltrado/secret/readme_hack.md', ...(mIdx >= 6 ? ['/home/infiltrado/secret/decoy.log'] : []), '/var/backup/sistema_backup.enc', '/opt/phantom/dados_pessoais.enc'];
  const h = all.filter(f => f.includes(g));
  return h.length ? [{ t: 'dim', text: 'Buscando...' }, ...h.map(f => ({ t: 'out', text: f }))] : [];
}

function findFilesWin(pattern, mIdx) {
  const g = pattern.replace(/\*/g, '').toLowerCase();
  const all = ['C:\\Users\\Infiltrado\\readme.txt', 'C:\\Users\\Infiltrado\\secret\\arquivo_criptografado.enc', 'C:\\Users\\Infiltrado\\secret\\chave.key', 'C:\\Users\\Infiltrado\\secret\\logs.txt', 'C:\\Users\\Infiltrado\\secret\\readme_hack.txt', ...(mIdx >= 6 ? ['C:\\Users\\Infiltrado\\secret\\decoy.log'] : []), 'C:\\Windows\\Temp\\backup_sistema.enc', 'C:\\ProgramData\\phantom\\dados.enc'];
  const h = all.filter(f => f.toLowerCase().includes(g));
  return h.length ? [{ t: 'dim', text: 'Buscando...' }, ...h.map(f => ({ t: 'out', text: f }))] : [];
}

// ─── HANDLE COMMAND ────────────────────────────────
function handleCommand() {
  const input = $('terminal-input');
  const raw = input.value.trim();
  if (!raw) return;

  G.history.push(raw);
  G.historyIdx = -1;

  print(termState.prompt + ' ' + raw, 'cmd');
  input.value = '';
  setTimeout(updateCursor, 0);

  const norm = raw.replace(/\s+/g, ' ').trim().toLowerCase();

  // Built-in meta commands
  if (norm === 'save --cloud' || norm === 'save') {
    if (window.forceFbSave) {
      window.forceFbSave({
        progress: G.progress, xp: G.xp, level: G.level,
        grubOs: G.grubOs, achievements: [...G.unlockedAchievements]
      });
      print('✓ Payload enviado. Sincronização manual (Cloud-Sync) concluída com êxito.', 'suc');
    } else {
      print('Erro: A ponte com o Cloudflare/Firebase Hosting está offline.', 'err');
    }
    return;
  }
  if (norm === 'exit' || norm === 'menu') { closeGameWindow(); return; }
  if (norm === 'help') {
    print('Comandos disponíveis:', 'sys');
    (QUICK_REF[G.os] || []).forEach(r => print('  ' + r.cmd.padEnd(16) + '— ' + r.desc, 'out'));
    printSep();
    print('  exit / menu        — fechar terminal', 'dim');
    print('  clear / cls        — limpar tela', 'dim');
    print('  history            — histórico de comandos', 'dim');
    return;
  }
  if (norm === 'restart' || norm === 'reset') {
    if (G.pack) G.progress[G.pack] = { missionIndex: 0, correct: 0, attempts: 0 };
    G.missionIndex = 0; G.correct = 0; G.attempts = 0; G.failCount = 0; G.hintShown = false;
    G.history = []; G.historyIdx = -1;
    saveState(); clearTerminal();
    print('Progresso resetado. Reconstruindo ambiente...', 'sys');
    setTimeout(loadMission, 500);
    return;
  }

  const missions = window.GameData.MISSIONS[G.pack] || window.GameData.MISSIONS[G.os] || [];
  const m = missions[G.missionIndex];
  if (!m) return;
  const expected = m.command.replace(/\s+/g, ' ').trim().toLowerCase();
  const correct = isCorrect(norm, expected);

  const freeResult = simulateFreeCommand(raw);

  if (freeResult !== null) {
    freeResult.forEach((l, i) => setTimeout(() => print(l.text, l.t), i * 55));
    if (correct) {
      setTimeout(() => {
        G.attempts++; G.correct++;
        updateStatus(); updatePrompt();
        const bonus = G.hintShown ? 0 : Math.round(m.xp * 0.2);
        const gained = m.xp + bonus;
        addXP(gained);
        if (m.command.includes('|')) unlockAchievement('pipe_master');
        if (G.correct === 1) unlockAchievement('first_blood');
        if (G.xp >= 500) unlockAchievement('xp_500');
        AudioEngine.success();
        showMissionComplete(gained, m);
      }, freeResult.length * 55 + 280);
    } else {
      setTimeout(() => { updatePrompt(); focusInput(); }, freeResult.length * 55 + 60);
    }
    return;
  }

  G.attempts++;
  updateStatus();
  if (correct) handleCorrect(m);
  else handleWrong(m, raw);
}

function isCorrect(input, expected) {
  if (input === expected) return true;
  const strip = s => s.replace(/['"]/g, '').replace(/\/+(\s|$)/g, '$1').replace(/\s+/g, ' ').trim();
  if (strip(input) === strip(expected)) return true;
  const flex = [['ls -la', 'ls -al'], ['ps aux', 'ps -aux']];
  for (const [a, b] of flex) if ((input === a && expected === b) || (input === b && expected === a)) return true;
  return false;
}

function handleCorrect(m) {
  G.correct++;
  const lines = m.simulate(termState);
  lines.forEach((l, i) => setTimeout(() => print(l.text, l.t), i * 75));
  setTimeout(() => {
    printSep();
    const bonus = G.hintShown ? 0 : Math.round(m.xp * 0.2);
    const gained = m.xp + bonus;
    addXP(gained); updateStatus(); updatePrompt();
    if (m.command.includes('|')) unlockAchievement('pipe_master');
    if (G.correct === 1) unlockAchievement('first_blood');
    if (G.xp >= 500) unlockAchievement('xp_500');
    AudioEngine.success();
    showMissionComplete(gained, m);
  }, lines.length * 75 + 180);
}

function handleWrong(m, raw) {
  AudioEngine.error();
  G.failCount++;
  const cmd = raw.split(' ')[0];
  print(G.os === 'linux'
    ? 'bash: ' + cmd + ': command not found'
    : "'" + cmd + "' não é reconhecido como um comando interno ou externo.", 'err');
  printSep();
  const tw = document.querySelector('.terminal-wrapper');
  if (tw) { tw.classList.remove('shake'); void tw.offsetWidth; tw.classList.add('shake'); }
  if (G.failCount >= 2 && !G.hintShown) {
    G.hintShown = true;
    $('hint-box').style.display = 'block';
    print('💡 Dica desbloqueada — veja o painel esquerdo.', 'warn');
  }
  if (G.failCount >= 5) { unlockAchievement('persistent'); print('▸ Tente: ' + m.command, 'warn'); }
  updateStatus(); focusInput();
}

// ─── XP / LEVEL ────────────────────────────────────
function addXP(amount) {
  G.xp += amount;
  while (G.level < XP_LEVELS.length && G.xp >= XP_LEVELS[G.level]) {
    G.level++;
    print('⬆ LEVEL UP! Nível ' + G.level + ': ' + (RANKS[G.level - 1] || 'MESTRE'), 'ach');
  }
  $('hud-xp').textContent = G.xp;
  $('hud-rank').textContent = RANKS[Math.min(G.level - 1, RANKS.length - 1)];
  $('taskbar-xp').textContent = 'XP: ' + G.xp;
  $('taskbar-rank').textContent = RANKS[Math.min(G.level - 1, RANKS.length - 1)];
  updateXPBar();
  saveState();
}

function updateXPBar() {
  const xpS = XP_LEVELS[G.level - 1] || 0;
  const xpE = XP_LEVELS[G.level] || xpS + 500;
  const pct = Math.min(100, Math.round((G.xp - xpS) / (xpE - xpS) * 100));
  $('xp-bar-fill').style.width = pct + '%';
  $('xp-current').textContent = G.xp + ' XP';
  $('xp-next').textContent = xpE + ' XP';
  $('status-level').textContent = G.level;
}

function updateStatus() {
  $('status-correct').textContent = G.correct;
  $('status-attempts').textContent = G.attempts;
  $('status-accuracy').textContent = G.attempts > 0 ? Math.round(G.correct / G.attempts * 100) + '%' : '—';
  updateXPBar();
}

function updatePrompt() { $('prompt-text').textContent = termState.prompt; }

// ─── MISSION COMPLETE ──────────────────────────────
function showMissionComplete(xp, m) {
  const missions = window.GameData.MISSIONS[G.pack] || window.GameData.MISSIONS[G.os] || [];
  const isLast = G.missionIndex >= missions.length - 1;
  $('mc-subtitle').textContent = m.title;
  $('mc-xp').textContent = '+' + xp + ' XP';
  $('mc-next-btn').style.display = isLast ? 'none' : 'block';
  $('mc-finish-btn').style.display = isLast ? 'block' : 'none';
  const ov = $('mission-complete-overlay');
  ov.style.display = 'flex'; ov.classList.add('open');
  saveState();
}

function nextMission() {
  $('mission-complete-overlay').style.display = 'none';
  $('mission-complete-overlay').classList.remove('open');
  G.missionIndex++;
  saveState();
  loadMission();
}

// ─── ACHIEVEMENTS ──────────────────────────────────
function unlockAchievement(id) {
  if (G.unlockedAchievements.has(id)) return;
  G.unlockedAchievements.add(id);
  const a = ACHIEVEMENTS.find(x => x.id === id);
  if (!a) return;
  const card = document.getElementById('ach-' + id);
  if (card) { card.classList.remove('locked'); card.classList.add('unlocked'); card.querySelector('.ach-locked-label')?.remove(); }
  const ra = $('recent-achievements');
  ra.querySelector('.no-ach')?.remove();
  const d = document.createElement('div');
  d.className = 'ach-mini';
  d.textContent = a.icon + ' ' + a.name;
  ra.insertBefore(d, ra.firstChild);
  while (ra.children.length > 3) ra.removeChild(ra.lastChild);
  showToast(a);
  print('');
  print('🏅 CONQUISTA: "' + a.name + '" — ' + a.desc, 'ach');
  saveState();
}

function showToast(a) {
  $('toast-icon').textContent = a.icon;
  $('toast-name').textContent = a.name;
  const t = $('achievement-toast');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

function buildAchievementsGrid() {
  $('achievements-grid').innerHTML = ACHIEVEMENTS.map(a => `
    <div class="ach-card ${G.unlockedAchievements.has(a.id) ? 'unlocked' : 'locked'}" id="ach-${a.id}">
      <div class="ach-icon">${a.icon}</div>
      <div class="ach-name">${a.name}</div>
      <div class="ach-desc">${a.desc}</div>
      ${G.unlockedAchievements.has(a.id) ? '' : '<div class="ach-locked-label">[ BLOQUEADO ]</div>'}
    </div>`).join('');
}

function buildQuickRef() {
  $('quick-ref').innerHTML = (QUICK_REF[G.os] || []).map(r =>
    `<div class="qr-item"><span class="qr-cmd">${r.cmd}</span><span class="qr-desc">${r.desc}</span></div>`
  ).join('');
}

async function buildRanking() {
  const el = $('ranking-content');
  el.innerHTML = '<div class="ranking-loading"><span class="ranking-spinner"></span>Carregando ranking...</div>';

  if (window.fbFetchRanking && window.FB && window.FB.user) {
    // Busca estática (On-Demand) = Queima 1 Firestore Read apenas ao clicar no Ranking.
    const entries = await window.fbFetchRanking();
    renderRankingEntries(entries);
  } else {
    // Fallback local caso não logado
    const me = { uid: 'local', displayName: 'GHOST (você)', level: G.level, xpTotal: G.xp, xpWindows: 0, xpLinux: 0, achievements: G.unlockedAchievements.size, isMe: true };
    renderRankingEntries([me]);
  }
}

function renderRankingEntries(entries) {
  const el = $('ranking-content');
  if (!el) return;

  const myUid = (window.FB && window.FB.user) ? window.FB.user.uid : null;

  // Calcular XP local por OS para o usuário atual
  const myXpWin = window.calcOsXP ? window.calcOsXP(G.progress, 'windows') : 0;
  const myXpLin = window.calcOsXP ? window.calcOsXP(G.progress, 'linux')   : 0;

  // Merge: garantir que o usuário atual aparece com dados fresh
  let list = entries.map(r => ({
    ...r,
    isMe: r.uid === myUid,
    xpTotal:   r.uid === myUid ? G.xp   : (r.xpTotal   || 0),
    xpWindows: r.uid === myUid ? myXpWin : (r.xpWindows || 0),
    xpLinux:   r.uid === myUid ? myXpLin : (r.xpLinux   || 0),
    displayName: r.uid === myUid
      ? ((window.FB && window.FB.user && (window.FB.user.displayName || window.FB.user.email)) || r.displayName || 'Você')
      : (r.displayName || 'Agente'),
  }));

  // Re-ordenar pelo XP total atualizado
  list.sort((a, b) => b.xpTotal - a.xpTotal);

  const myPos = list.findIndex(r => r.isMe);

  el.innerHTML = `
    <div class="ranking-tabs">
      <button class="ranking-tab active" data-tab="total" onclick="switchRankTab(this,'total')">🏆 Total</button>
      <button class="ranking-tab" data-tab="windows"  onclick="switchRankTab(this,'windows')">🪟 Windows</button>
      <button class="ranking-tab" data-tab="linux"    onclick="switchRankTab(this,'linux')">🐧 Linux</button>
    </div>
    <div class="ranking-list" id="ranking-list"></div>
    <div class="ranking-mypos ${myPos < 0 ? 'hidden' : ''}">
      Sua posição: <strong>#${myPos + 1}</strong> de <strong>${list.length}</strong> agentes
    </div>
  `;

  window._rankingData = list;
  renderRankTab('total');
}

function switchRankTab(btn, tab) {
  document.querySelectorAll('.ranking-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderRankTab(tab);
}

function renderRankTab(tab) {
  const list = window._rankingData || [];
  const myUid = (window.FB && window.FB.user) ? window.FB.user.uid : null;
  const el = document.getElementById('ranking-list');
  if (!el) return;

  const field = tab === 'windows' ? 'xpWindows' : tab === 'linux' ? 'xpLinux' : 'xpTotal';
  const sorted = [...list].sort((a, b) => (b[field] || 0) - (a[field] || 0));

  el.innerHTML = sorted.map((r, i) => {
    const pos   = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
    const xp    = r[field] || 0;
    const rank  = RANKS[Math.min((r.level || 1) - 1, RANKS.length - 1)];
    const maxXp = sorted[0] ? (sorted[0][field] || 1) : 1;
    const pct   = Math.round((xp / maxXp) * 100);
    const ach   = r.achievements || 0;
    const osTag = tab === 'windows'
      ? '<span class="rtag win">WIN</span>'
      : tab === 'linux'
      ? '<span class="rtag lin">LIN</span>'
      : `<span class="rtag win">W:${r.xpWindows||0}</span><span class="rtag lin">L:${r.xpLinux||0}</span>`;

    return `<div class="ranking-item-v2 ${r.isMe ? 'current' : ''}">
      <div class="ri-pos">${pos}</div>
      <div class="ri-body">
        <div class="ri-top">
          <span class="ri-name">${escHtml(r.displayName)}${r.isMe ? ' <span class="ri-you">você</span>' : ''}</span>
          <span class="ri-xp">${xp.toLocaleString()} XP</span>
        </div>
        <div class="ri-bar-wrap">
          <div class="ri-bar" style="width:${pct}%"></div>
        </div>
        <div class="ri-meta">
          <span class="ri-rank">${rank}</span>
          ${osTag}
          <span class="ri-ach">🏆 ${ach}</span>
        </div>
      </div>
    </div>`;
  }).join('') || '<div class="ranking-empty">Nenhum agente registrado ainda.</div>';
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ─── PANELS ────────────────────────────────────────
function openPanel(name) {
  if (name === 'achievements') buildAchievementsGrid();
  if (name === 'ranking') buildRanking();
  const el = $(name + '-overlay');
  el.classList.add('open'); el.style.display = 'flex';
}
function closePanel(name) {
  if (name === 'ranking') {
    if (window.fbUnsubscribeRanking && window._rankingActiveSub) {
      window.fbUnsubscribeRanking();
      window._rankingActiveSub = false;
    }
  }
  const el = $(name + '-overlay');
  el.classList.remove('open'); el.style.display = 'none';
}

// ─── VICTORY ───────────────────────────────────────
function showVictory() {
  $('mission-complete-overlay').style.display = 'none';
  unlockAchievement('complete');
  $('game-window').style.display = 'none';
  const vs = $('victory-screen');
  vs.style.display = 'flex'; vs.classList.add('active');
  const acc = G.attempts > 0 ? Math.round(G.correct / G.attempts * 100) + '%' : '100%';
  $('v-xp').textContent = G.xp + ' XP';
  $('v-acc').textContent = acc;
  $('v-rank').textContent = RANKS[Math.min(G.level - 1, RANKS.length - 1)];
  $('victory-achievements').innerHTML = [...G.unlockedAchievements].map(id => {
    const a = ACHIEVEMENTS.find(x => x.id === id);
    return a ? `<div class="ach-mini" title="${a.desc}">${a.icon} ${a.name}</div>` : '';
  }).join('');
  saveState();
}

function restartGame() {
  if (G.pack) G.progress[G.pack] = { missionIndex: 0, correct: 0, attempts: 0 };
  G.missionIndex = 0; G.correct = 0; G.attempts = 0; G.hintShown = false; G.failCount = 0; G.history = []; G.historyIdx = -1;
  termState.cwd = '~'; termState.prompt = 'infiltrado@server:~$';
  $('victory-screen').style.display = 'none'; $('victory-screen').classList.remove('active');
  saveState();
  showDesktop();
}

// ─── START MENU ────────────────────────────────────
function setupStartMenu() {
  const logo = $('taskbar-logo');
  // Remove old listeners by cloning
  const newLogo = logo.cloneNode(true);
  logo.parentNode.replaceChild(newLogo, logo);
  newLogo.addEventListener('click', toggleStartMenu);

  // Also remove power button onclick attr, wire it
  const pwrBtn = document.querySelector('.taskbar-btn[title="Reiniciar sistema"]');
  if (pwrBtn) {
    const nb = pwrBtn.cloneNode(true);
    nb.removeAttribute('onclick');
    nb.addEventListener('click', () => {
      closeStartMenu();
      rebootSystem();
    });
    pwrBtn.parentNode.replaceChild(nb, pwrBtn);
  }
}

function toggleStartMenu() {
  const existing = document.getElementById('start-menu');
  if (existing) { closeStartMenu(); return; }
  openStartMenu();
}

function openStartMenu() {
  closeStartMenu();
  const menu = document.createElement('div');
  menu.id = 'start-menu';
  menu.className = 'start-menu os-' + G.grubOs;

  if (G.grubOs === 'windows') {
    menu.innerHTML = buildWin11Menu();
  } else {
    menu.innerHTML = buildFedoraMenu();
  }

  document.getElementById('desktop-screen').appendChild(menu);

  // Inject username from Firebase
  requestAnimationFrame(() => {
    menu.classList.add('open');
    const uname = (window.FB && window.FB.user)
      ? (window.FB.user.displayName || window.FB.user.email || 'Agente GHOST')
      : 'Agente GHOST';
    const winEl = menu.querySelector('#sm-win-username');
    const fedEl = menu.querySelector('#sm-fed-username');
    if (winEl) winEl.textContent = uname;
    if (fedEl) fedEl.textContent = uname;
  });

  // Close on outside click
  setTimeout(() => {
    document.addEventListener('click', outsideMenuClose, { once: true });
  }, 10);
}

function outsideMenuClose(e) {
  if (!e.target.closest('#start-menu') && !e.target.closest('#taskbar-logo')) {
    closeStartMenu();
  }
}

function closeStartMenu() {
  const m = document.getElementById('start-menu');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(() => m.remove(), 220);
}

function buildWin11Menu() {
  const packs = PACKS['windows'] || [];
  const packItems = packs.map(p => {
    const prog = G.progress[p.id];
    const done = prog ? prog.missionIndex : 0;
    const total = (window.GameData.MISSIONS[p.id] || []).length;
    const pct = total > 0 ? Math.round(done / total * 100) : 0;
    return `<div class="sm-app-item" onclick="closeStartMenu();openGameWindow('${p.id}','windows')">
      <span class="sm-app-icon">${p.icon}</span>
      <span class="sm-app-label">${p.name}<span class="sm-app-pct">${pct}%</span></span>
    </div>`;
  }).join('');

  return `
    <div class="sm-win11-header">
      <input class="sm-search" type="text" placeholder="Pesquisar..." disabled />
    </div>
    <div class="sm-section-label">Fixados</div>
    <div class="sm-apps-grid">
      ${packItems}
      <div class="sm-app-item" onclick="closeStartMenu()">
        <span class="sm-app-icon">⚙️</span>
        <span class="sm-app-label">Configurações</span>
      </div>
      <div class="sm-app-item" onclick="closeStartMenu()">
        <span class="sm-app-icon">📂</span>
        <span class="sm-app-label">Explorador</span>
      </div>
    </div>
    <div class="sm-divider"></div>
    <div class="sm-section-label">Recomendados</div>
    <div class="sm-rec-list">
      <div class="sm-rec-item"><span>📄</span><span>missao_briefing.txt</span></div>
      <div class="sm-rec-item"><span>🔐</span><span>phantom_key.enc</span></div>
      <div class="sm-rec-item"><span>📡</span><span>network_scan.log</span></div>
    </div>
    <div class="sm-win11-footer">
      <div class="sm-user" title="Sair da conta" onclick="closeStartMenu();fbLogout()">
        <span class="sm-user-icon">👤</span>
        <span class="sm-user-name" id="sm-win-username">Agente GHOST</span>
      </div>
      <div class="sm-power-group">
        <button class="sm-power-btn" title="Sair da conta" onclick="closeStartMenu();fbLogout()">🚪 Sair</button>
        <button class="sm-power-btn" title="Reiniciar" onclick="closeStartMenu();rebootSystem()">⏻ Reiniciar</button>
      </div>
    </div>`;
}

function buildFedoraMenu() {
  const packs = PACKS['linux'] || [];
  const packItems = packs.map(p => {
    const prog = G.progress[p.id];
    const done = prog ? prog.missionIndex : 0;
    const total = (window.GameData.MISSIONS[p.id] || []).length;
    const pct = total > 0 ? Math.round(done / total * 100) : 0;
    return `<div class="sm-fedora-item" onclick="closeStartMenu();openGameWindow('${p.id}','linux')">
      <span class="sm-app-icon">${p.icon}</span>
      <div class="sm-fedora-item-info">
        <span class="sm-fedora-item-name">${p.name}</span>
        <span class="sm-fedora-item-sub">${p.desc} — ${pct}%</span>
      </div>
    </div>`;
  }).join('');

  return `
    <div class="sm-fedora-header">
      <div class="sm-fedora-search-wrap">
        <span class="sm-fedora-search-icon">🔍</span>
        <input class="sm-fedora-search" type="text" placeholder="Pesquisar aplicativos..." disabled />
      </div>
    </div>
    <div class="sm-fedora-apps">
      ${packItems}
      <div class="sm-fedora-item" onclick="closeStartMenu()">
        <span class="sm-app-icon">⚙️</span>
        <div class="sm-fedora-item-info">
          <span class="sm-fedora-item-name">Configurações</span>
          <span class="sm-fedora-item-sub">Sistema GNOME</span>
        </div>
      </div>
      <div class="sm-fedora-item" onclick="closeStartMenu()">
        <span class="sm-app-icon">📁</span>
        <div class="sm-fedora-item-info">
          <span class="sm-fedora-item-name">Arquivos</span>
          <span class="sm-fedora-item-sub">Nautilus</span>
        </div>
      </div>
    </div>
    <div class="sm-divider"></div>
    <div class="sm-fedora-footer">
      <div class="sm-user" title="Sair da conta" onclick="closeStartMenu();fbLogout()">
        <span class="sm-user-icon">👤</span>
        <span class="sm-user-name" id="sm-fed-username">ghost</span>
      </div>
      <div class="sm-power-group">
        <button class="sm-power-btn" title="Sair da conta" onclick="closeStartMenu();fbLogout()">🚪 Sair</button>
        <button class="sm-power-btn" title="Reiniciar" onclick="closeStartMenu();rebootSystem()">⏻ Reiniciar</button>
      </div>
    </div>`;
}

function rebootSystem() {
  G.grubOs = null; G.os = null; G.pack = null;
  if (window.fbDeleteSave) {
    window.fbDeleteSave().finally(() => {
      try { localStorage.removeItem('tm_save'); } catch(e) {}
      location.reload();
    });
  } else {
    try { localStorage.removeItem('tm_save'); } catch(e) {}
    location.reload();
  }
}

function clearTerminal() { $('terminal-output').innerHTML = ''; focusInput(); }

// ─── KEYBOARD SHORTCUTS ────────────────────────────
document.addEventListener('keydown', e => {
  const mc = $('mission-complete-overlay');
  const vs = $('victory-screen');
  if (e.key === 'Enter') {
    if (mc && mc.style.display === 'flex') {
      e.preventDefault();
      const missions = window.GameData.MISSIONS[G.pack] || window.GameData.MISSIONS[G.os] || [];
      if (G.missionIndex >= missions.length - 1) showVictory(); else nextMission();
      return;
    }
    if (vs && vs.style.display === 'flex') { e.preventDefault(); restartGame(); return; }
  }
  if (e.key === 'Escape') {
    if (mc && mc.style.display === 'flex') return;
    closePanel('achievements'); closePanel('ranking');
  }
});

// ─── INIT ──────────────────────────────────────────
initWindowResize();

// Titlebar drag for game window
document.addEventListener('DOMContentLoaded', () => {
  const win = $('game-window'), bar = $('window-titlebar');
  if (win && bar) makeDraggable(win, bar);
});