/* ═══════════════════════════════════════════════════
   TERMINAL::MASTER — GAME LOGIC
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

// ─── GAME STATE ────────────────────────────────────

const AudioEngine = {
  ctx: null,
  init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === 'suspended') this.ctx.resume();
  },
  playTone(freq, type, duration, vol=0.05) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch(e) {}
  },
  keypress() { this.playTone(800, 'sine', 0.05, 0.02); },
  success() { this.playTone(600, 'triangle', 0.1, 0.05); setTimeout(() => this.playTone(800, 'triangle', 0.15, 0.05), 100); },
  error() { this.playTone(150, 'sawtooth', 0.3, 0.1); }
};

function saveGameState() {
  if (G.pack) {
    if (!G.progress) G.progress = {};
    G.progress[G.pack] = {
      missionIndex: G.missionIndex,
      correct: G.correct,
      attempts: G.attempts,
      os: G.os
    };
  }
  const state = {
    progress: G.progress || {},
    global_xp: G.xp,
    level: G.level,
    unlockedAchievements: [...G.unlockedAchievements]
  };
  localStorage.setItem('terminal_master_save', JSON.stringify(state));
}

function loadGameState() {
  const saved = localStorage.getItem('terminal_master_save');
  if (saved) {
    try {
      const state = JSON.parse(saved);
      G.progress = state.progress || {};
      G.xp = state.global_xp || state.xp || 0;
      G.level = state.level || 1;
      G.unlockedAchievements = new Set(state.unlockedAchievements || []);
    } catch(e){}
  } else {
    G.progress = {};
  }
}

const G = {
  pack: null,
  os: null,
  missionIndex: 0,
  xp: 0, level: 1,
  correct: 0, attempts: 0,
  hintShown: false, failCount: 0,
  unlockedAchievements: new Set(),
  history: [], historyIdx: -1,
  progress: {}
};

const XP_LEVELS = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200];
const RANKS = ['ROOKIE', 'INFILTRADO', 'EXPLORADOR', 'HACKER', 'ESPECIALISTA', 'ELITE', 'FANTASMA', 'MESTRE'];

const termState = { cwd: '~', prompt: 'infiltrado@server:~$' };

// ─── MISSIONS ──────────────────────────────────────

// ─── ACHIEVEMENTS ──────────────────────────────────
const ACHIEVEMENTS = window.GameData.ACHIEVEMENTS;

const RANKING_DATA = window.GameData.RANKING_DATA;

const QUICK_REF = window.GameData.QUICK_REF;

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
  '> Selecione seu protocolo para começar.',
];


function boot() {
  // Alias the hacks if missing
  if (window.GameData.MISSIONS.linux && !window.GameData.MISSIONS.linux_hacking) {
    window.GameData.MISSIONS.linux_hacking = window.GameData.MISSIONS.linux;
  }
  if (window.GameData.MISSIONS.windows && !window.GameData.MISSIONS.windows_hacking) {
    window.GameData.MISSIONS.windows_hacking = window.GameData.MISSIONS.windows;
  }
  const log = $('boot-log');
  const bar = $('boot-bar');
  let i = 0;
  const iv = setInterval(() => {
    if (i >= BOOT_LINES.length) {
      clearInterval(iv);
      setTimeout(showOsScreen, 600);
      return;
    }
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
  }, 180);
}

function showHubScreen() {
  loadGameState();
  $('os-screen').classList.add('active');
  $('os-screen').style.display = 'flex';
  
  const packsDef = [
    { id: 'linux_hacking', os: 'linux', icon: '💻', name: 'HACKING LINUX', desc: 'Infiltração básica (Bash)' },
    { id: 'windows_hacking', os: 'windows', icon: '🪟', name: 'HACKING WIN', desc: 'Infiltração Padrão (CMD/PS)' },
    { id: 'linux_network', os: 'linux', icon: '🌐', name: 'REDES LINUX', desc: 'Diagnóstico TCP/IP Moderno' },
    { id: 'windows_network', os: 'windows', icon: '📡', name: 'REDES WIN', desc: 'Troubleshooting nativo Windows' },
    { id: 'linux_server', os: 'linux', icon: '⚙️', name: 'ADMIN SERVER', desc: 'Gerência de discos, processos e logs' }
  ];

  let html = '';
  packsDef.forEach(p => {
    let prog = G.progress[p.id] || { missionIndex: 0 };
    let total = (window.GameData.MISSIONS[p.id] || []).length;
    let pct = total > 0 ? Math.floor((prog.missionIndex / total) * 100) : 0;
    if (prog.missionIndex >= total && total > 0) pct = 100;
    
    html += `
      <div class="os-card" onclick="selectOS('${p.id}', '${p.os}')">
        <div class="os-card-icon">${p.icon}</div>
        <div class="os-card-name">${p.name}</div>
        <div class="os-card-shell">${pct}% CONCLUÍDO</div>
        <div style="height:4px;width:100%;background:#1b2128;border-radius:4px;margin-bottom:12px;overflow:hidden;">
            <div style="height:100%;width:${pct}%;background:var(--cyan);box-shadow: 0 0 10px var(--cyan);"></div>
        </div>
        <div class="os-card-desc">${p.desc}</div>
        <div class="os-card-btn">▶ CESSAR</div>
      </div>
    `;
  });
  
  const cardsContainer = document.querySelector('.os-cards');
  if (cardsContainer) cardsContainer.innerHTML = html;
  
  const headerTitle = document.querySelector('.os-title');
  if (headerTitle) headerTitle.innerHTML = 'HUB <span class="accent">CENTRAL</span>';
  const headerDesc = document.querySelector('.os-desc');
  if (headerDesc) headerDesc.innerText = 'Selecione uma trilha / módulo para iniciar ou continuar.';
}

function showOsScreen() {
  $('boot-screen').classList.remove('active');
  showHubScreen();
}

// ─── OS SELECTION ──────────────────────────────────
function selectOS(pack, os) {
  loadGameState();
  G.pack = pack;
  G.os = os;
  const p = G.progress[pack] || { missionIndex: 0, correct: 0, attempts: 0 };
  G.missionIndex = p.missionIndex || 0;
  G.correct = p.correct || 0;
  G.attempts = p.attempts || 0;
  
  G.unlockedAchievements = new Set(G.unlockedAchievements);
  G.history = []; G.historyIdx = -1;
  AudioEngine.init();
  AudioEngine.keypress();

  if (os === 'linux') {
    termState.cwd = '~';
    termState.prompt = 'infiltrado@server:~$';
  } else {
    termState.cwd = 'C:\\Users\\Infiltrado';
    termState.prompt = 'C:\\Users\\Infiltrado>';
  }

  $('os-screen').classList.remove('active');
  $('os-screen').style.display = 'none';
  $('game-screen').style.display = 'flex';
  $('game-screen').classList.add('active');

  $('hud-os-label').textContent = os === 'linux' ? 'LINUX/BASH' : 'WINDOWS/CMD';
  $('chrome-title').textContent = os === 'linux'
    ? 'bash — infiltrado@server:~'
    : 'cmd.exe — C:\\Users\\Infiltrado';

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
  if (G.os === 'linux') {
    print('Last login: Wed Jun 12 03:41:22 2024 from 10.0.0.1', 'dim');
  } else {
    print('Microsoft Windows [Version 10.0.22621.3296]', 'dim');
  }
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
  const missions = window.GameData.MISSIONS[G.pack || G.os];
  if (G.missionIndex >= missions.length) { showVictory(); return; }

  const m = missions[G.missionIndex];
  G.hintShown = false;
  G.failCount = 0;

  // Panel
  $('mission-phase-badge').textContent = m.phase.split('—')[0].trim();
  $('mission-icon').textContent = m.icon;
  $('mission-title').textContent = m.title;
  $('mission-desc').textContent = m.desc;
  $('task-command').textContent = m.objective;
  $('learn-text').innerHTML = m.learn;
  $('hint-box').style.display = 'none';
  $('hint-text').textContent = m.hint;
  $('hud-mission-name').textContent = m.title;

  // Progress
  const total = missions.length;
  $('progress-fill').style.width = (G.missionIndex / total * 100) + '%';
  $('progress-missions').textContent = `MISSÃO ${G.missionIndex + 1} / ${total}`;

  // Terminal box — 60-char wide with word-wrapped description
  const BOX = 60;
  const tag = 'MISSÃO ' + (G.missionIndex + 1) + '/' + total + ': ' + m.title;
  // word-wrap desc
  const words = m.desc.split(' ');
  const descLines = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? cur + ' ' + w : w;
    if (next.length > BOX) { descLines.push(cur); cur = w; }
    else cur = next;
  }
  if (cur) descLines.push(cur);

  const padR = Math.max(1, BOX - tag.length - 1);
  const top = '╔═ ' + tag + ' ' + '═'.repeat(padR) + '╗';
  const bot = '╚' + '═'.repeat(BOX + 2) + '╝';

  printSep();
  print(top, 'sys');
  for (const dl of descLines) print('║ ' + dl.padEnd(BOX) + ' ║', 'sys');
  print(bot, 'sys');
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
  $('terminal-input').focus();
  updateCursor();
}

function updateCursor() {
  const input = $('terminal-input');
  const ghost = $('input-ghost');
  const cursor = $('cursor-caret');
  if (!input || !ghost || !cursor) return;
  const pos = (input.selectionStart !== null) ? input.selectionStart : input.value.length;
  ghost.textContent = input.value.slice(0, pos);
  cursor.style.left = ghost.offsetWidth + 'px';
}

// Wire up events AFTER DOM ready — safe because script is at bottom of body
document.addEventListener('DOMContentLoaded', () => {
  const input = $('terminal-input');
  if (!input) return;

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      handleCommand();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const raw = input.value;
      const tok = raw.split(/\s+/);
      const lastTok = tok[tok.length - 1];
      if (lastTok) {
        const inSecret = termState.cwd.includes('secret') || termState.cwd.includes('Secret');
        const currentFiles = inSecret ? ['arquivo_criptografado.enc', 'chave.key', 'logs.txt', 'readme_hack.md', 'tools/'] : ['readme.txt', 'secret/', 'access.log', 'index.html']; 
        const match = currentFiles.find(f => f.toLowerCase().startsWith(lastTok.toLowerCase()));
        if (match) {
          tok[tok.length - 1] = match;
          input.value = tok.join(' ');
          setTimeout(updateCursor, 0);
        }
      }
    
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (G.historyIdx < G.history.length - 1) {
        G.historyIdx++;
        input.value = G.history[G.history.length - 1 - G.historyIdx] || '';
      }
      setTimeout(updateCursor, 0);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (G.historyIdx > 0) {
        G.historyIdx--;
        input.value = G.history[G.history.length - 1 - G.historyIdx] || '';
      } else {
        G.historyIdx = -1;
  AudioEngine.init();
  AudioEngine.keypress();
        input.value = '';
      }
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
  const inSecret = s.cwd.includes('secret') || s.cwd.includes('Secret');

  const filesRoot = ['readme.txt', 'secret/'];
  const filesSecret = [
    'arquivo_criptografado.enc', 'chave.key', 'logs.txt', 'readme_hack.md',
    ...(mIdx >= 5 ? ['tools/'] : []),
    ...(mIdx >= 6 ? ['decoy.log'] : []),
  ];
  const currentFiles = inSecret ? filesSecret : filesRoot;

  // handle pipes first
  if (raw.includes('|')) return simulatePipe(raw, mIdx);

  if (G.os === 'linux') {
    if (base === 'pwd' && args.length === 0)
      return [{ t: 'out', text: inSecret ? '/home/infiltrado/secret' : '/home/infiltrado' }];

    if (base === 'ls') {
      const flagL = raw.includes('-l'), flagA = raw.includes('-a');
      const target = args.find(a => !a.startsWith('-')) || '';
      if (target) {
        const found = currentFiles.find(f => f === target || f === target + '/');
        if (!found) return [{ t: 'err', text: "ls: cannot access '" + target + "': No such file or directory" }];
        if (flagL) return [{ t: 'out', text: '-rw-r--r-- 1 infiltrado root 156 Jun 12 03:40 ' + target }];
        return [{ t: 'out', text: target }];
      }
      const list = flagA ? ['.', '..', '.bash_history', '.bashrc', ...currentFiles] : currentFiles;
      if (!flagL) return [{ t: 'out', text: list.join('  ') }];
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
      if (arg1 === '..') {
        if (inSecret) { s.cwd = '~'; s.prompt = 'infiltrado@server:~$'; }
        return [{ t: 'sys', text: '📁 ' + s.cwd }];
      }
      if (arg1 === 'secret' && !inSecret) { s.cwd = '~/secret'; s.prompt = 'infiltrado@server:~/secret$'; return [{ t: 'sys', text: '📁 ~/secret' }]; }
      if (arg1 === 'tools' && inSecret && mIdx >= 5) return [{ t: 'sys', text: '📁 ~/secret/tools (vazio)' }];
      return [{ t: 'err', text: "bash: cd: " + arg1 + ": No such file or directory" }];
    }

    if (base === 'cat') {
      if (!arg1) return [{ t: 'err', text: 'cat: missing operand' }];
      return catFile(arg1, mIdx);
    }
    if (base === 'mkdir') return arg1 ? [{ t: 'suc', text: '✓ Diretório "' + arg1 + '" criado.' }] : [{ t: 'err', text: 'mkdir: missing operand' }];
    if (base === 'touch') return arg1 ? [{ t: 'suc', text: '✓ Arquivo "' + arg1 + '" criado.' }] : [{ t: 'err', text: 'touch: missing operand' }];
    if (base === 'rm') return arg1 ? [{ t: 'suc', text: '✓ "' + arg1 + '" removido.' }] : [{ t: 'err', text: 'rm: missing operand' }];

    if (base === 'echo') {
      const rest = args.join(' ');
      const gtIdx = rest.indexOf('>');
      if (gtIdx !== -1) {
        const txt = rest.slice(0, gtIdx).trim().replace(/^["']|["']$/g, '');
        const file = rest.slice(gtIdx + 1).replace(/^>/, '').trim();
        return [{ t: 'suc', text: '✓ "' + txt + '" escrito em ' + file }];
      }
      return [{ t: 'out', text: rest.replace(/^["']|["']$/g, '') }];
    }

    if (base === 'chmod') {
      if (args.length < 2) return [{ t: 'err', text: 'chmod: missing operand' }];
      return [{ t: 'suc', text: '✓ Permissões de ' + args[1] + ' alteradas para ' + args[0] }];
    }

    if (base === 'ps')
      return [
        { t: 'out', text: 'USER       PID %CPU %MEM COMMAND' },
        { t: 'out', text: 'root         1  0.0  0.1 /sbin/init' },
        { t: 'out', text: 'root       234  0.0  0.5 /usr/sbin/sshd' },
        { t: 'out', text: 'admin      891  2.1  1.2 security-monitor' },
        { t: 'out', text: 'admin      892  0.1  0.8 log-watcher' },
        { t: 'out', text: 'infiltrado ' + (900 + mIdx) + '  0.0  0.1 bash' },
      ];

    if (base === 'grep') {
      const flagC = args.includes('-c'), flagI = args.includes('-i'), flagN = args.includes('-n');
      const pArgs = args.filter(a => !a.startsWith('-'));
      const pat = (pArgs[0] || '').replace(/^["']|["']$/g, '');
      const file = pArgs[1] || 'logs.txt';
      if (!pat) return [{ t: 'err', text: 'grep: missing pattern' }];
      const lines = grepFile(file, pat, flagI, mIdx);
      if (flagC) return [{ t: 'out', text: String(lines.length) }];
      if (!lines.length) return [];
      return lines.map((l, i) => ({ t: 'out', text: (flagN ? (i + 1) + ':' : '') + l }));
    }

    if (base === 'find') {
      const ni = args.indexOf('-name');
      const pat = ni !== -1 ? (args[ni + 1] || '').replace(/^["']|["']$/g, '') : '';
      if (!pat) return [{ t: 'err', text: 'find: missing -name argument' }];
      return findFilesLinux(pat, mIdx);
    }

    if (base === 'wc') {
      const flagL = args.includes('-l');
      const file = args.find(a => !a.startsWith('-')) || '';
      if (!file) return [{ t: 'err', text: 'wc: missing operand' }];
      if (flagL) return [{ t: 'out', text: '     7 ' + file }];
      return [{ t: 'out', text: '   7  47 312 ' + file }];
    }

    if (base === 'clear' || base === 'cls') { clearTerminal(); return []; }
    if (base === 'history') return G.history.map((h, i) => ({ t: 'dim', text: '  ' + (i + 1) + '  ' + h }));
    if (base === 'whoami') return [{ t: 'out', text: 'infiltrado' }];
    if (base === 'uname') return [{ t: 'out', text: 'Linux server 5.15.0-phantom #1 SMP x86_64 GNU/Linux' }];
    if (base === 'date') return [{ t: 'out', text: 'Wed Jun 12 03:41:22 UTC 2024' }];

    return null;
  }

  // ─── WINDOWS ───
  if (G.os === 'windows') {
    if (base === 'cd' && args.length === 0) return [{ t: 'out', text: s.cwd }];
    if (base === 'cd') {
      if (arg1 === '..') {
        if (inSecret) { s.cwd = 'C:\\Users\\Infiltrado'; s.prompt = 'C:\\Users\\Infiltrado>'; }
        return [{ t: 'sys', text: '📁 ' + s.cwd }];
      }
      if (arg1.toLowerCase() === 'secret' && !inSecret) {
        s.cwd = 'C:\\Users\\Infiltrado\\secret'; s.prompt = 'C:\\Users\\Infiltrado\\secret>';
        return [{ t: 'sys', text: '📁 ' + s.cwd }];
      }
      return [{ t: 'err', text: 'O sistema não pode encontrar o caminho especificado.' }];
    }

    if (base === 'dir') {
      const flagA = raw.includes('/a'), flagS = raw.includes('/s'), flagB = raw.includes('/b');
      const pat = args.find(a => !a.startsWith('/')) || '';
      if (flagS && pat) return findFilesWin(pat, mIdx);
      const list = flagA ? ['.', '..', '.credentials', ...currentFiles] : currentFiles;
      if (flagB) return list.map(f => ({ t: 'out', text: s.cwd + '\\' + f.replace('/', '') }));
      const out = [{ t: 'out', text: ' Directory of ' + s.cwd }, { t: 'out', text: '' }];
      list.forEach(f => {
        const dir = f.endsWith('/') || f === '.' || f === '..';
        out.push({ t: 'out', text: '12/06/2024  03:41    ' + (dir ? '<DIR>         ' : '          2048') + ' ' + f.replace('/', '') });
      });
      out.push({ t: 'out', text: '' });
      out.push({ t: 'dim', text: '       ' + list.length + ' arquivo(s)' });
      return out;
    }

    if (base === 'type') {
      if (!arg1) return [{ t: 'err', text: 'O comando de sintaxe está incorreto.' }];
      return catFile(arg1, mIdx);
    }

    if (base === 'echo') {
      const rest = args.join(' ');
      const gtIdx = rest.indexOf('>');
      if (gtIdx !== -1) {
        const txt = rest.slice(0, gtIdx).trim().replace(/^["']|["']$/g, '');
        const file = rest.slice(gtIdx + 1).replace(/^>/, '').trim();
        return [{ t: 'suc', text: '✓ "' + txt + '" escrito em ' + file }];
      }
      return [{ t: 'out', text: rest }];
    }

    if (base === 'mkdir' || base === 'md')
      return arg1 ? [{ t: 'suc', text: '✓ Pasta "' + arg1 + '" criada.' }] : [{ t: 'err', text: 'Sintaxe incorreta.' }];

    if (base === 'tasklist')
      return [
        { t: 'out', text: 'Image Name              PID  Mem Usage' },
        { t: 'out', text: '====================== ==== ==========' },
        { t: 'out', text: 'System                   4      236 K' },
        { t: 'out', text: 'svchost.exe            892    8.412 K' },
        { t: 'out', text: 'SecurityMonitor.exe   1341   12.048 K' },
        { t: 'out', text: 'LogWatcher.exe        1342    6.128 K' },
        { t: 'out', text: 'cmd.exe              ' + (1400 + mIdx) + '    3.012 K' },
      ];

    if (base === 'findstr') {
      const cArg = args.find(a => a.startsWith('/c:'));
      const flagI = raw.includes('/i'), flagN = raw.includes('/n');
      let pat = '', file = '';
      if (cArg) {
        pat = cArg.slice(3).replace(/^["']|["']$/g, '');
        file = args.find(a => !a.startsWith('/')) || '';
      } else {
        const pA = args.filter(a => !a.startsWith('/'));
        pat = (pA[0] || '').replace(/^["']|["']$/g, '');
        file = pA[1] || '';
      }
      if (!pat) return [{ t: 'err', text: 'FINDSTR: sintaxe incorreta.' }];
      const lines = grepFile(file || 'logs.txt', pat, flagI, mIdx);
      if (raw.includes('/c:')) return [{ t: 'out', text: (file || 'logs.txt') + ':' + lines.length }];
      if (!lines.length) return [];
      return lines.map((l, i) => ({ t: 'out', text: (flagN ? (file || 'logs.txt') + ':' + (i + 1) + ':' : '') + l }));
    }

    if (base === 'icacls') {
      const target = args.find(a => !a.startsWith('/')) || '';
      const gi = args.indexOf('/grant');
      if (gi !== -1) return [
        { t: 'out', text: 'processed file: ' + target },
        { t: 'suc', text: '✓ Permissão concedida para ' + (args[gi + 1] || 'Everyone') },
      ];
      const perms = (target === 'chave.key' && mIdx < 8)
        ? 'NT AUTHORITY\\SYSTEM:(F)\n          BUILTIN\\Administrators:(R)'
        : 'Everyone:(R)\n          BUILTIN\\Administrators:(F)';
      return [
        { t: 'out', text: target + ' ' + perms.split('\\n')[0] },
        { t: 'out', text: '          ' + perms.split('\\n')[1] },
        { t: 'out', text: 'Successfully processed 1 files; Failed processing 0 files' },
      ];
    }

    if (base === 'cls' || base === 'clear') { clearTerminal(); return []; }
    if (base === 'whoami') return [{ t: 'out', text: 'servidor\\infiltrado' }];
    if (base === 'date') return [{ t: 'out', text: 'Wed 06/12/2024' }];
    if (base === 'ver') return [{ t: 'out', text: 'Microsoft Windows [Version 10.0.22621.3296]' }];

    return null;
  }
  return null;
}

// ─── PIPE SIMULATOR ────────────────────────────────
function simulatePipe(cmd, mIdx) {
  const parts = cmd.split('|').map(p => p.trim());
  const leftOut = simulateFreeCommand(parts[0]) || [];
  const textLines = leftOut.map(l => l.text || '');
  const right = parts[1] ? parts[1].trim() : '';
  const rTok = right.split(/\s+/);
  const rBase = rTok[0].toLowerCase();
  const rArgs = rTok.slice(1);

  if (rBase === 'grep' || rBase === 'findstr') {
    const cArg = rArgs.find(a => a.startsWith('/c:'));
    const flagC = rArgs.includes('-c') || !!cArg;
    const flagI = rArgs.includes('-i') || rArgs.includes('/i');
    let pat = cArg ? cArg.slice(3) : rArgs.find(a => !a.startsWith('-') && !a.startsWith('/')) || '';
    pat = pat.replace(/^["']|["']$/g, '');
    if (!pat) return leftOut;
    const matches = textLines.filter(l => flagI ? l.toLowerCase().includes(pat.toLowerCase()) : l.includes(pat));
    if (flagC) return [{ t: 'out', text: String(matches.length) }];
    return matches.length ? matches.map(l => ({ t: 'out', text: l })) : [];
  }
  if (rBase === 'wc' && rArgs.includes('-l'))
    return [{ t: 'out', text: String(textLines.filter(l => l).length) }];
  if (rBase === 'sort')
    return [...textLines].sort().map(l => ({ t: 'out', text: l }));
  if (rBase === 'head') {
    const n = parseInt(rArgs.find(a => !isNaN(parseInt(a))) || '10');
    return textLines.slice(0, n).map(l => ({ t: 'out', text: l }));
  }
  if (rBase === 'tail') {
    const n = parseInt(rArgs.find(a => !isNaN(parseInt(a))) || '10');
    return textLines.slice(-n).map(l => ({ t: 'out', text: l }));
  }
  return leftOut;
}

// ─── HELPER: file contents DB ──────────────────────
function catFile(filename, mIdx) {
  const f = filename.toLowerCase().replace(/^.[\/\\]/, '');
  const db = {
    'readme.txt': [
      { t: 'out', text: 'SERVIDOR DE OPERAÇÕES — PHANTOM' },
      { t: 'out', text: 'Este servidor contém dados classificados.' },
      { t: 'out', text: 'Acesso não autorizado será monitorado.' },
    ],
    'readme_hack.md': [
      { t: 'out', text: '# OPERAÇÃO PHANTOM KEY' },
      { t: 'out', text: '' },
      { t: 'out', text: 'Os arquivos .enc foram cifrados com AES-256.' },
      { t: 'out', text: 'A chave está em chave.key — só "admin" pode ler.' },
      { t: 'out', text: 'Modifique as permissões para prosseguir.' },
    ],
    'readme_hack.txt': [
      { t: 'out', text: '# OPERACAO PHANTOM KEY' },
      { t: 'out', text: '' },
      { t: 'out', text: 'Os arquivos .enc foram cifrados com AES-256.' },
      { t: 'out', text: 'A chave esta em chave.key — so SYSTEM tem acesso.' },
    ],
    'chave.key': mIdx >= 8 ? [
      { t: 'out', text: '╔════════════════════════════════════════╗' },
      { t: 'out', text: '║  PHANTOM KEY — AES-256 DECRYPTION     ║' },
      { t: 'out', text: '╚════════════════════════════════════════╝' },
      { t: 'out', text: 'KEY: 4f8a2b9c1e7d3f6a0b5c8d2e4f1a9b3c' },
    ] : [{ t: 'err', text: G.os === 'linux' ? 'cat: chave.key: Permission denied' : 'Acesso negado.' }],
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
    'arquivo_criptografado.enc': [
      { t: 'out', text: '>>> PHANTOM ENCRYPTED PAYLOAD — OPERATION COMPLETE <<<' },
      { t: 'out', text: 'ENCRYPTED BLOCK 0x01: a3f8b2c9d4e1f0a7b8c9d0e1f2a3b4c5' },
      { t: 'out', text: 'ENCRYPTED BLOCK 0x02: d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1' },
      { t: 'out', text: 'CHECKSUM: 9f8e7d6c5b4a3928' },
    ],
  };
  return db[f] || [{ t: 'err', text: (G.os === 'linux' ? 'cat' : 'type') + ': ' + filename + ': No such file or directory' }];
}

function grepFile(filename, pattern, caseInsensitive, mIdx) {
  const lines = catFile(filename || 'logs.txt', mIdx).map(l => l.text || '');
  return lines.filter(l => caseInsensitive ? l.toLowerCase().includes(pattern.toLowerCase()) : l.includes(pattern));
}

function findFilesLinux(pattern, mIdx) {
  const glob = pattern.replace(/\*/g, '');
  const all = [
    '/home/infiltrado/readme.txt',
    '/home/infiltrado/secret/arquivo_criptografado.enc',
    '/home/infiltrado/secret/chave.key',
    '/home/infiltrado/secret/logs.txt',
    '/home/infiltrado/secret/readme_hack.md',
    ...(mIdx >= 6 ? ['/home/infiltrado/secret/decoy.log'] : []),
    '/var/backup/sistema_backup.enc',
    '/opt/phantom/dados_pessoais.enc',
  ];
  const hits = all.filter(f => f.includes(glob));
  return hits.length ? [{ t: 'dim', text: 'Buscando...' }, ...hits.map(f => ({ t: 'out', text: f }))] : [];
}

function findFilesWin(pattern, mIdx) {
  const glob = pattern.replace(/\*/g, '').toLowerCase();
  const all = [
    'C:\\Users\\Infiltrado\\readme.txt',
    'C:\\Users\\Infiltrado\\secret\\arquivo_criptografado.enc',
    'C:\\Users\\Infiltrado\\secret\\chave.key',
    'C:\\Users\\Infiltrado\\secret\\logs.txt',
    'C:\\Users\\Infiltrado\\secret\\readme_hack.txt',
    ...(mIdx >= 6 ? ['C:\\Users\\Infiltrado\\secret\\decoy.log'] : []),
    'C:\\Windows\\Temp\\backup_sistema.enc',
    'C:\\ProgramData\\phantom\\dados.enc',
  ];
  const hits = all.filter(f => f.toLowerCase().includes(glob));
  return hits.length ? [{ t: 'dim', text: 'Buscando...' }, ...hits.map(f => ({ t: 'out', text: f }))] : [];
}

function handleCommand() {
  const input = $('terminal-input');
  const raw = input.value.trim();
  if (!raw) return;

  G.history.push(raw);
  G.historyIdx = -1;
  AudioEngine.init();
  AudioEngine.keypress();

  print(termState.prompt + ' ' + raw, 'cmd');
  input.value = '';
  setTimeout(updateCursor, 0);

  const m = window.GameData.MISSIONS[G.pack || G.os][G.missionIndex];
  const norm = raw.replace(/\s+/g, ' ').trim().toLowerCase();
  
  if (norm === 'exit' || norm === 'menu') {
    saveGameState();
    $('game-screen').classList.remove('active');
    setTimeout(() => {
        $('game-screen').style.display = 'none';
        clearTerminal();
        showHubScreen();
    }, 400);
    return;
  }
  
  if (norm === 'help') {
    print('Comandos Úteis (Atalhos do Sistema):', 'sys');
    (QUICK_REF[G.os] || []).forEach(r => print(`  ${r.cmd.padEnd(15)} - ${r.desc}`, 'out'));
    return;
  }
  
  if (norm === 'restart' || norm === 'reset') {
    if (G.pack) {
      G.progress[G.pack] = { missionIndex: 0, correct: 0, attempts: 0 };
    }
    G.missionIndex = 0; G.correct = 0; G.attempts = 0; G.failCount = 0; G.hintShown = false;
    G.history = []; G.historyIdx = -1;
    saveGameState();
    clearTerminal();
    print('Progresso nativo da trilha resetado. Reconstruindo ambiente base...', 'sys');
    setTimeout(loadMission, 600);
    return;
  }

  const expected = m.command.replace(/\s+/g, ' ').trim().toLowerCase();
  const correct = isCorrect(norm, expected);

  // Try free simulation
  const freeResult = simulateFreeCommand(raw);

  if (freeResult !== null) {
    // Show simulated output (no attempt counted unless it is the mission answer)
    freeResult.forEach((l, i) => setTimeout(() => print(l.text, l.t), i * 60));
    if (correct) {
      // It IS the mission command — advance after output finishes
      setTimeout(() => {
        G.attempts++; G.correct++;
        updateStatus();
        updatePrompt();
        const bonus = G.hintShown ? 0 : Math.round(m.xp * 0.2);
        const gained = m.xp + bonus;
        addXP(gained);
        if (m.command.includes('|')) unlockAchievement('pipe_master');
        if (G.correct === 1) unlockAchievement('first_blood');
        if (G.xp >= 500) unlockAchievement('xp_500');
        showMissionComplete(gained, m);
      }, freeResult.length * 60 + 300);
    } else {
      setTimeout(() => { updatePrompt(); focusInput(); }, freeResult.length * 60 + 80);
    }
    return;
  }

  // Unknown command — count as attempt, shake, show hint
  G.attempts++;
  updateStatus();
  if (correct) {
    handleCorrect(m);
  } else {
    handleWrong(m, raw);
  }
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
  lines.forEach((l, i) => setTimeout(() => print(l.text, l.t), i * 80));

  setTimeout(() => {
    printSep();
    const bonus = G.hintShown ? 0 : Math.round(m.xp * 0.2);
    const gained = m.xp + bonus;
    addXP(gained);
    updateStatus();
    updatePrompt();

    if (m.command.includes('|')) unlockAchievement('pipe_master');
    if (G.correct === 1) unlockAchievement('first_blood');
    if (G.xp >= 500) unlockAchievement('xp_500');

    showMissionComplete(gained, m);
  }, lines.length * 80 + 200);
}

function handleWrong(m, raw) {
  AudioEngine.error();
  G.failCount++;

  const cmd = raw.split(' ')[0];
  if (G.os === 'linux') {
    print(`bash: ${cmd}: command not found`, 'err');
  } else {
    print(`'${cmd}' não é reconhecido como um comando interno ou externo.`, 'err');
  }
  printSep();

  // Shake
  const tw = document.querySelector('.terminal-wrapper');
  tw.classList.remove('shake');
  void tw.offsetWidth;
  tw.classList.add('shake');

  if (G.failCount >= 2 && !G.hintShown) {
    G.hintShown = true;
    $('hint-box').style.display = 'block';
    print('💡 Dica desbloqueada — veja o painel esquerdo.', 'warn');
  }
  if (G.failCount >= 5) {
    unlockAchievement('persistent');
    print('▸ Tente: ' + m.command, 'warn');
  }

  updateStatus();
  focusInput();
}

// ─── XP / LEVEL ────────────────────────────────────
function addXP(amount) {
  saveGameState();
  G.xp += amount;
  while (G.level < XP_LEVELS.length && G.xp >= XP_LEVELS[G.level]) {
    G.level++;
    print('⬆ LEVEL UP! Nível ' + G.level + ': ' + (RANKS[G.level - 1] || 'MESTRE'), 'ach');
  }
  $('hud-xp').textContent = G.xp;
  $('hud-rank').textContent = RANKS[Math.min(G.level - 1, RANKS.length - 1)];
  updateXPBar();
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
  $('status-accuracy').textContent = G.attempts > 0
    ? Math.round(G.correct / G.attempts * 100) + '%' : '—';
  updateXPBar();
}

function updatePrompt() {
  $('prompt-text').textContent = termState.prompt;
}

// ─── MISSION COMPLETE ──────────────────────────────
function showMissionComplete(xp, m) {
  AudioEngine.success();
  const isLast = G.missionIndex >= (window.GameData.MISSIONS[G.pack || G.os] || []).length - 1;
  $('mc-subtitle').textContent = m.title;
  $('mc-xp').textContent = '+' + xp + ' XP';
  $('mc-next-btn').style.display = isLast ? 'none' : 'block';
  $('mc-finish-btn').style.display = isLast ? 'block' : 'none';
  const ov = $('mission-complete-overlay');
  ov.style.display = 'flex';
  ov.classList.add('open');
}

function nextMission() {
  saveGameState();
  const ov = $('mission-complete-overlay');
  ov.style.display = 'none';
  ov.classList.remove('open');
  G.missionIndex++;
  loadMission();
}

// ─── ACHIEVEMENTS ──────────────────────────────────
function unlockAchievement(id) {
  saveGameState();
  if (G.unlockedAchievements.has(id)) return;
  G.unlockedAchievements.add(id);
  const a = ACHIEVEMENTS.find(x => x.id === id);
  if (!a) return;

  const card = document.getElementById('ach-' + id);
  if (card) {
    card.classList.remove('locked');
    card.classList.add('unlocked');
    const lbl = card.querySelector('.ach-locked-label');
    if (lbl) lbl.remove();
  }

  const ra = $('recent-achievements');
  const noAch = ra.querySelector('.no-ach');
  if (noAch) noAch.remove();
  const d = document.createElement('div');
  d.className = 'ach-mini';
  d.textContent = a.icon + ' ' + a.name;
  ra.insertBefore(d, ra.firstChild);
  while (ra.children.length > 3) ra.removeChild(ra.lastChild);

  showToast(a);
  print('');
  print('🏅 CONQUISTA: "' + a.name + '" — ' + a.desc, 'ach');
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

function buildRanking() {
  const me = { name: 'GHOST (você)', rank: RANKS[G.level - 1] || 'ROOKIE', xp: G.xp, current: true };
  const all = [...RANKING_DATA, me].sort((a, b) => b.xp - a.xp).slice(0, 8);
  $('ranking-content').innerHTML = all.map((r, i) => {
    const pos = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1);
    return `<div class="ranking-item ${r.current ? 'current' : ''}">
      <div class="ranking-pos">${pos}</div>
      <div class="ranking-info">
        <div class="ranking-name">${r.name}${r.current ? ' ◀' : ''}</div>
        <div class="ranking-rank">${r.rank}</div>
      </div>
      <div class="ranking-xp">${r.xp} XP</div>
    </div>`;
  }).join('');
}

// ─── PANELS ────────────────────────────────────────
function openPanel(name) {
  if (name === 'achievements') { buildAchievementsGrid(); }
  if (name === 'ranking') { buildRanking(); }
  const el = $(name + '-overlay');
  el.classList.add('open');
  el.style.display = 'flex';
}
function closePanel(name) {
  const el = $(name + '-overlay');
  el.classList.remove('open');
  el.style.display = 'none';
}

// ─── VICTORY ───────────────────────────────────────
function showVictory() {
  $('mission-complete-overlay').style.display = 'none';
  unlockAchievement('complete');
  $('game-screen').style.display = 'none';
  $('game-screen').classList.remove('active');
  $('victory-screen').style.display = 'flex';
  $('victory-screen').classList.add('active');
  const acc = G.attempts > 0 ? Math.round(G.correct / G.attempts * 100) + '%' : '100%';
  $('v-xp').textContent = G.xp + ' XP';
  $('v-acc').textContent = acc;
  $('v-rank').textContent = RANKS[Math.min(G.level - 1, RANKS.length - 1)];
  $('victory-achievements').innerHTML = [...G.unlockedAchievements].map(id => {
    const a = ACHIEVEMENTS.find(x => x.id === id);
    return a ? `<div class="ach-mini" title="${a.desc}">${a.icon} ${a.name}</div>` : '';
  }).join('');
}

function restartGame() {
  $('victory-screen').style.display = 'none';
  $('victory-screen').classList.remove('active');
  if (G.pack) G.progress[G.pack] = { missionIndex: 0, correct: 0, attempts: 0 };
  G.missionIndex = 0; G.correct = 0; G.attempts = 0; G.hintShown = false; G.failCount = 0; G.history = []; G.historyIdx = -1;
  saveGameState();
  termState.cwd = '~'; termState.prompt = 'infiltrado@server:~$';
  showHubScreen();
}

function clearTerminal() {
  $('terminal-output').innerHTML = '';
  focusInput();
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const mcOverlay = $('mission-complete-overlay');
    const vScreen = $('victory-screen');
    
    if (mcOverlay && mcOverlay.style.display === 'flex') {
      e.preventDefault();
      const isLast = G.missionIndex >= (window.GameData.MISSIONS[G.pack || G.os] || []).length - 1;
      if (isLast) showVictory();
      else nextMission();
      return;
    }
    
    if (vScreen && vScreen.style.display === 'flex') {
      e.preventDefault();
      restartGame();
      return;
    }
  }
});

// ─── KICK OFF ──────────────────────────────────────
boot();
loadGameState();

