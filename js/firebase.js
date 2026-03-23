/* ═══════════════════════════════════════════════════
   TERMINAL::MASTER — FIREBASE INTEGRATION
   Auth (Google + Email) + Firestore persistence
   ═══════════════════════════════════════════════════

   ⚠️  CONFIGURAÇÃO NECESSÁRIA:
   Substitua o objeto firebaseConfig abaixo com os
   dados do seu projeto Firebase Console.
   Acesse: https://console.firebase.google.com
   ═══════════════════════════════════════════════════ */
'use strict';

// ─── FIREBASE CONFIG ────────────────────────────────
// TODO: Substitua com as credenciais do seu projeto
const firebaseConfig = {
  apiKey: "AIzaSyCkrsfPPsYnYjmB6AMsruTZnXQ104JKDwo",
  authDomain: "terminal-master-fbce6.firebaseapp.com",
  projectId: "terminal-master-fbce6",
  storageBucket: "terminal-master-fbce6.firebasestorage.app",
  messagingSenderId: "126170945021",
  appId: "1:126170945021:web:663bfb5f7a8df2a642f594"
};

// ─── ESTADO ─────────────────────────────────────────
const FB = {
  app: null,
  auth: null,
  db: null,
  user: null,
  saveTimeout: null,
  initialized: false,
};

// ─── INIT ────────────────────────────────────────────
async function fbInit() {
  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
    const { getAuth, onAuthStateChanged, signInWithPopup, signInWithEmailAndPassword,
      createUserWithEmailAndPassword, GoogleAuthProvider, signOut, updateProfile }
      = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
    const { getFirestore, doc, setDoc, getDoc, deleteDoc, getDocs,
      collection, query, orderBy, limit, onSnapshot, where }
      = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

    FB.app = initializeApp(firebaseConfig);
    FB.auth = getAuth(FB.app);
    FB.db = getFirestore(FB.app);

    // Guardar refs para uso posterior
    FB._signInWithPopup = signInWithPopup;
    FB._signInWithEmail = signInWithEmailAndPassword;
    FB._createUser = createUserWithEmailAndPassword;
    FB._GoogleAuthProvider = GoogleAuthProvider;
    FB._signOut = signOut;
    FB._updateProfile = updateProfile;
    FB._doc = doc;
    FB._setDoc = setDoc;
    FB._getDoc = getDoc;
    FB._deleteDoc = deleteDoc;
    FB._collection = collection;
    FB._query = query;
    FB._orderBy = orderBy;
    FB._limit = limit;
    FB._getDocs = getDocs;
    FB._onSnapshot = onSnapshot;
    FB._where = where;

    FB.initialized = true;

    // Observar estado de autenticação
    onAuthStateChanged(FB.auth, user => {
      FB.user = user;
      if (user) {
        onUserLoggedIn(user);
      } else {
        onUserLoggedOut();
      }
    });
  } catch (err) {
    console.error('Firebase init error:', err);
    showLoginError('Erro ao conectar ao Firebase. Verifique as configurações.');
  }
}

// ─── AUTH: LOGIN COM GOOGLE ──────────────────────────
async function fbLoginGoogle() {
  try {
    const provider = new FB._GoogleAuthProvider();
    await FB._signInWithPopup(FB.auth, provider);
  } catch (err) {
    if (err.code !== 'auth/popup-closed-by-user') {
      showLoginError('Falha no login com Google: ' + (err.message || err.code));
    }
  }
}

// ─── AUTH: LOGIN COM EMAIL ───────────────────────────
async function fbLoginEmail(email, password) {
  try {
    await FB._signInWithEmail(FB.auth, email, password);
  } catch (err) {
    const msgs = {
      'auth/user-not-found': 'Usuário não encontrado.',
      'auth/wrong-password': 'Senha incorreta.',
      'auth/invalid-email': 'Email inválido.',
      'auth/invalid-credential': 'Email ou senha incorretos.',
      'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
    };
    showLoginError(msgs[err.code] || 'Erro: ' + err.message);
  }
}

// ─── AUTH: CRIAR CONTA ───────────────────────────────
async function fbCreateAccount(email, password, displayName) {
  try {
    const cred = await FB._createUser(FB.auth, email, password);
    if (displayName) {
      await FB._updateProfile(cred.user, { displayName });
    }
  } catch (err) {
    const msgs = {
      'auth/email-already-in-use': 'Este email já está em uso.',
      'auth/weak-password': 'Senha muito fraca (mínimo 6 caracteres).',
      'auth/invalid-email': 'Email inválido.',
    };
    showLoginError(msgs[err.code] || 'Erro: ' + err.message);
  }
}

// ─── AUTH: LOGOUT ────────────────────────────────────
async function fbLogout() {
  try {
    await FB._signOut(FB.auth);
  } catch (err) {
    console.error('Logout error:', err);
  }
}

// ─── FIRESTORE: SALVAR ───────────────────────────────
async function executeFbSave(data) {
  if (!FB.user || !FB.db) return;
  try {
    const uid = FB.user.uid;
    const displayName = FB.user.displayName || FB.user.email || 'Agente';

    // Salvar save completo
    const saveRef = FB._doc(FB.db, 'saves', uid);
    await FB._setDoc(saveRef, {
      ...data,
      achievements: [...(data.achievements || [])],
      updatedAt: new Date().toISOString(),
      displayName,
    });

    // Atualizar documento de ranking separado (leitura pública agregada)
    const progress = data.progress || {};
    // XP por OS: soma das missões completadas por pack
    const xpWindows = calcOsXP(progress, 'windows');
    const xpLinux = calcOsXP(progress, 'linux');
    const rankRef = FB._doc(FB.db, 'ranking', uid);
    await FB._setDoc(rankRef, {
      uid,
      displayName,
      xpTotal: data.xp || 0,
      level: data.level || 1,
      xpWindows,
      xpLinux,
      achievements: (data.achievements || []).length,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Firebase save error:', err);
  }
}

function fbSave(data) {
  if (!FB.user || !FB.db) return;
  // Debounce: otimização maciça de 30s (redução de 90% em escritas pagas)
  clearTimeout(FB.saveTimeout);
  FB.saveTimeout = setTimeout(() => executeFbSave(data), 30000);
}

function forceFbSave(data) {
  if (!FB.user || !FB.db) return;
  clearTimeout(FB.saveTimeout);
  executeFbSave(data);
}

// ─── FIRESTORE: CARREGAR ─────────────────────────────
async function fbLoad() {
  if (!FB.user || !FB.db) return null;
  try {
    const ref = FB._doc(FB.db, 'saves', FB.user.uid);
    const snap = await FB._getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    console.warn('Firebase load error:', err);
    return null;
  }
}

// ─── FIRESTORE: DELETAR SAVE ─────────────────────────
async function fbDeleteSave() {
  if (!FB.user || !FB.db) return;
  try {
    const ref = FB._doc(FB.db, 'saves', FB.user.uid);
    await FB._deleteDoc(ref);
  } catch (err) {
    console.warn('Firebase delete error:', err);
  }
}

// ─── CALLBACKS (chamados pelo auth observer) ─────────
function onUserLoggedIn(user) {
  hideLoginScreen();
  // Se o BIOS ainda não rodou, começa agora
  if (typeof startBios === 'function' && !window._biosStarted) {
    window._biosStarted = true;
    startBios();
  }
}

function onUserLoggedOut() {
  showLoginScreen();
}

// ════════════════════════════════
//  TELA DE LOGIN
// ════════════════════════════════
let _loginMode = 'login'; // 'login' | 'register'

function showLoginScreen() {
  let el = document.getElementById('login-screen');
  if (!el) {
    el = document.createElement('div');
    el.id = 'login-screen';
    document.body.appendChild(el);
  }
  el.innerHTML = buildLoginHTML();
  el.style.display = 'flex';
  requestAnimationFrame(() => el.classList.add('open'));

  // Bind events
  el.querySelector('#btn-google')?.addEventListener('click', fbLoginGoogle);
  el.querySelector('#btn-submit')?.addEventListener('click', handleLoginSubmit);
  el.querySelector('#btn-toggle-mode')?.addEventListener('click', toggleLoginMode);
  el.querySelector('#login-password')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLoginSubmit();
  });
  el.querySelector('#login-email')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') el.querySelector('#login-password')?.focus();
  });
}

function hideLoginScreen() {
  const el = document.getElementById('login-screen');
  if (!el) return;
  el.classList.remove('open');
  setTimeout(() => { el.style.display = 'none'; el.innerHTML = ''; }, 350);
}

function toggleLoginMode() {
  _loginMode = _loginMode === 'login' ? 'register' : 'login';
  showLoginScreen();
}

function handleLoginSubmit() {
  const email = document.getElementById('login-email')?.value?.trim();
  const password = document.getElementById('login-password')?.value;
  const name = document.getElementById('login-name')?.value?.trim();

  if (!email || !password) {
    showLoginError('Preencha email e senha.');
    return;
  }
  if (_loginMode === 'register') {
    fbCreateAccount(email, password, name || 'Agente');
  } else {
    fbLoginEmail(email, password);
  }
}

function showLoginError(msg) {
  const el = document.getElementById('login-error');
  if (el) {
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 4000);
  }
}

function buildLoginHTML() {
  const isReg = _loginMode === 'register';
  return `
    <div class="login-card">
      <div class="login-logo">
        <div class="login-logo-text">TERMINAL::MASTER</div>
        <div class="login-logo-sub">[ HACKING PROTOCOL v3.1.7 ]</div>
      </div>

      <button class="login-google-btn" id="btn-google">
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.6 2.2 30.2 0 24 0 14.6 0 6.6 5.5 2.6 13.6l7.9 6.1C12.4 13.5 17.7 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.5 2.9-2.2 5.4-4.7 7l7.3 5.7c4.3-4 6.8-9.9 6.8-16.7z"/>
          <path fill="#FBBC05" d="M10.5 28.6A14.8 14.8 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.6 2.6 10.8l7.9-6.2z"/>
          <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.3-5.7c-2 1.4-4.6 2.2-7.9 2.2-6.3 0-11.6-4.2-13.5-9.9l-7.9 6.2C6.6 42.5 14.6 48 24 48z"/>
        </svg>
        Entrar com Google
      </button>

      <div class="login-divider"><span>ou</span></div>

      <div class="login-form">
        ${isReg ? `<input class="login-input" id="login-name" type="text" placeholder="Nome do agente" />` : ''}
        <input class="login-input" id="login-email" type="email" placeholder="Email" autocomplete="email" />
        <input class="login-input" id="login-password" type="password" placeholder="Senha" autocomplete="${isReg ? 'new-password' : 'current-password'}" />
        <div class="login-error" id="login-error" style="display:none"></div>
        <button class="login-submit-btn" id="btn-submit">
          ${isReg ? '🚀 Criar Conta' : '🔐 Entrar'}
        </button>
      </div>

      <button class="login-toggle-btn" id="btn-toggle-mode">
        ${isReg ? 'Já tem conta? Entrar' : 'Não tem conta? Criar agora'}
      </button>
    </div>`;
}

// ─── XP POR OS ───────────────────────────────────────
function calcOsXP(progress, os) {
  // Packs de cada OS
  const osPacks = {
    windows: ['windows', 'windows_network'],
    linux: ['linux', 'linux_network', 'linux_web', 'linux_server'],
  };
  const packs = osPacks[os] || [];
  let xp = 0;
  for (const packId of packs) {
    const p = progress[packId];
    if (!p) continue;
    // Cada missão correta vale ~50 XP base (igual ao jogo)
    xp += (p.correct || 0) * 50;
  }
  return xp;
}

// ─── RANKING SOB DEMANDA ─────────────────────────────
async function fbFetchRanking() {
  if (!FB.db) return [];
  
  try {
    const q = FB._query(
      FB._collection(FB.db, 'ranking'),
      FB._orderBy('xpTotal', 'desc'),
      FB._limit(20)
    );

    const snap = await FB._getDocs(q);
    const entries = [];
    snap.forEach(d => entries.push({ id: d.id, ...d.data() }));
    return entries;
  } catch(err) {
    console.warn('Ranking fetch error:', err);
    return [];
  }
}

// ─── INIT ON LOAD ────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // Mostra tela de login imediatamente enquanto Firebase carrega
  showLoginScreen();
  fbInit();
});

// Exportar funções globais
window.FB = FB;
window.fbSave = fbSave;
window.forceFbSave = forceFbSave;
window.fbLoad = fbLoad;
window.fbLogout = fbLogout;
window.fbDeleteSave = fbDeleteSave;
window.fbFetchRanking = fbFetchRanking;
window.calcOsXP = calcOsXP;
