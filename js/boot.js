/* ═══════════════════════════════════════════════════
   TERMINAL::MASTER — BOOT ANIMATIONS
   BIOS → Boot → GRUB → OS Boot → Desktop
   ═══════════════════════════════════════════════════ */
'use strict';

// ─── BIOS BOOT ─────────────────────────────────────
const BIOS_LINES = [
  { text: 'Phantom Systems BIOS v2.06', cls: 'white', delay: 0 },
  { text: 'Copyright (C) 2024 Phantom Systems Ltd. All rights reserved.', cls: 'white', delay: 80 },
  { text: '', cls: '', delay: 120 },
  { text: 'CPU: Phantom-X9 Octa-Core @ 3.80GHz', cls: 'info', delay: 200 },
  { text: 'Memory Test... 16384 MB OK', cls: 'ok', delay: 380 },
  { text: 'BIOS-e820: [mem 0x0000000000000000-0x000000000009fbff] usable', cls: 'info', delay: 520 },
  { text: '', cls: '', delay: 560 },
  { text: 'Detecting storage devices...', cls: 'white', delay: 640 },
  { text: '  ATA: NVMe0  PHANTOM SSD 512GB  [OK]', cls: 'ok', delay: 820 },
  { text: '  ATA: USB0   No device found', cls: 'warn', delay: 940 },
  { text: '', cls: '', delay: 980 },
  { text: 'PCI Bus 0: Scanning...', cls: 'white', delay: 1060 },
  { text: '  Network: Intel I219-LM Ethernet  [OK]', cls: 'ok', delay: 1160 },
  { text: '  GPU: PHANTOM RTX-X  VGA-compatible  [OK]', cls: 'ok', delay: 1260 },
  { text: '', cls: '', delay: 1300 },
  { text: 'ACPI: RSDP 0x00000000000F05B0 000024 (v02 BOCHS)', cls: 'info', delay: 1360 },
  { text: '', cls: '', delay: 1400 },
  { text: 'Booting from primary disk...', cls: 'white', delay: 1500 },
];

function startBios() {
  const log = document.getElementById('bios-log');
  const bar = document.getElementById('bios-bar');
  const pct = document.getElementById('bios-pct');
  const prow = document.getElementById('bios-progress-row');

  let idx = 0;
  const total = BIOS_LINES.length;

  function addLine(item) {
    const d = document.createElement('div');
    d.className = 'bios-line' + (item.cls ? ' ' + item.cls : '');
    d.textContent = item.text;
    log.appendChild(d);
    if (item.text === 'Memory Test... 16384 MB OK') {
      prow.style.display = 'flex';
    }
    // Update progress bar
    const p = Math.round((idx / total) * 100);
    bar.style.width = p + '%';
    pct.textContent = p + '%';
  }

  function step() {
    if (idx >= BIOS_LINES.length) {
      setTimeout(endBios, 400);
      return;
    }
    const item = BIOS_LINES[idx];
    const nextItem = BIOS_LINES[idx + 1];
    const wait = nextItem ? (nextItem.delay - item.delay) : 300;
    addLine(item);
    idx++;
    setTimeout(step, Math.max(20, wait));
  }

  step();
}

function endBios() {
  const bios = document.getElementById('bios-screen');
  bios.style.opacity = '0';
  bios.style.transition = 'opacity 0.4s ease';
  setTimeout(() => {
    bios.classList.remove('active');
    bios.style.display = 'none';
    startKernelBoot();
  }, 400);
}

// ─── KERNEL BOOT ────────────────────────────────────
function startKernelBoot() {
  const bootScreen = document.getElementById('boot-screen');
  bootScreen.classList.add('active');
  bootScreen.style.display = 'flex';
  boot(); // boot() defined in main.js
}

// ─── OS BOOT (after GRUB) ───────────────────────────
function showOSBoot(os, onDone) {
  const el = document.getElementById('os-boot-screen');
  el.className = '';
  el.innerHTML = '';

  if (os === 'windows') {
    el.classList.add('win-boot');
    el.innerHTML = `
      <div class="win-boot-logo">
        <svg class="win11-icon" viewBox="0 0 88 88" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="40" height="40" rx="3" fill="#F25022"/>
          <rect x="46" y="2" width="40" height="40" rx="3" fill="#7FBA00"/>
          <rect x="2" y="46" width="40" height="40" rx="3" fill="#00A4EF"/>
          <rect x="46" y="46" width="40" height="40" rx="3" fill="#FFB900"/>
        </svg>
        <div class="win-spinner">
          <div class="win-dot"></div>
          <div class="win-dot"></div>
          <div class="win-dot"></div>
          <div class="win-dot"></div>
          <div class="win-dot"></div>
        </div>
      </div>
    `;
  } else {
    el.classList.add('fedora-boot');
    el.innerHTML = `
      <div class="fedora-boot-content">
        <div class="fedora-logo-wrap">
          <svg class="fedora-logo-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="#3c6eb4"/>
            <!-- Fedora 'f' infinity mark -->
            <path d="M50 18 C32 18 18 32 18 50 C18 62 24 72 34 78 L34 50 C34 40 40 34 50 34 C60 34 66 40 66 50 L66 82 C76 76 82 65 82 52 C82 33 67 18 50 18Z" fill="white"/>
            <path d="M66 50 C66 40 60 34 50 34 C44 34 38 37 36 43 L66 43Z" fill="#3c6eb4"/>
            <circle cx="50" cy="50" r="8" fill="white"/>
            <circle cx="50" cy="50" r="4" fill="#3c6eb4"/>
          </svg>
        </div>
        <div class="fedora-progress-outer">
          <div class="fedora-progress-fill" id="fedora-fill"></div>
        </div>
        <div class="fedora-text">Fedora Linux 41 — Iniciando...</div>
      </div>
    `;

    // Animate Fedora progress bar
    let w = 0;
    const fedFill = () => {
      const fill = document.getElementById('fedora-fill');
      if (!fill) return;
      const iv = setInterval(() => {
        w += Math.random() * 8 + 2;
        if (w >= 100) { w = 100; clearInterval(iv); }
        fill.style.width = w + '%';
      }, 80);
    };
    setTimeout(fedFill, 900);
  }

  el.style.display = 'flex';
  el.classList.add('active');

  // Show for 2.8s then fade out
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
      el.style.display = 'none';
      el.classList.remove('active');
      el.style.opacity = '';
      el.style.transition = '';
      onDone();
    }, 500);
  }, os === 'windows' ? 2800 : 3200);
}

// ─── INIT ───────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  startBios();
});

// Expose to main.js
window.showOSBoot = showOSBoot;
