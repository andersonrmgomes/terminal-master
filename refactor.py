import os, re

dir_path = "c:/Users/Anderson/Documents/terminal-master"
main_js_path = os.path.join(dir_path, "js/main.js")
index_html_path = os.path.join(dir_path, "index.html")
missions_js_path = os.path.join(dir_path, "js/missions.js")

with open(main_js_path, "r", encoding="utf-8") as f:
    main_content = f.read()

# 1. EXTRACT DATA TO MISSIONS.JS
missions_match = re.search(r"const MISSIONS = \{.*?\n\};\n", main_content, re.DOTALL)
ach_match = re.search(r"const ACHIEVEMENTS = \[.*?\];\n", main_content, re.DOTALL)
rank_match = re.search(r"const RANKING_DATA = \[.*?\];\n", main_content, re.DOTALL)
quick_match = re.search(r"const QUICK_REF = \{.*?\n\};\n", main_content, re.DOTALL)

missions_js_content = """window.GameData = {};\n"""
missions_js_content += missions_match.group(0).replace("const MISSIONS =", "window.GameData.MISSIONS =") + "\n"
missions_js_content += ach_match.group(0).replace("const ACHIEVEMENTS =", "window.GameData.ACHIEVEMENTS =") + "\n"
missions_js_content += rank_match.group(0).replace("const RANKING_DATA =", "window.GameData.RANKING_DATA =") + "\n"
missions_js_content += quick_match.group(0).replace("const QUICK_REF =", "window.GameData.QUICK_REF =") + "\n"

# Add new modules
missions_js_content += """
window.GameData.MISSIONS.linux_network = [
  {
    phase: 'MÓDULO DE REDES', icon: '🌐', title: 'TESTE DE CONECTIVIDADE',
    desc: 'Sua tarefa é diagnosticar um problema na rede. Primeiro, teste a conectividade com o gateway padrão no IP 192.168.1.1.',
    objective: 'Faça ping no IP 192.168.1.1',
    command: 'ping 192.168.1.1',
    learn: '<strong>ping</strong> verifica a conectividade usando ICMP.',
    hint: 'ping 192.168.1.1',
    simulate: () => [
      { t: 'out', text: 'PING 192.168.1.1 (192.168.1.1) 56(84) bytes of data.' },
      { t: 'out', text: '64 bytes from 192.168.1.1: icmp_seq=1 ttl=64 time=0.8 ms' },
      { t: 'out', text: '64 bytes from 192.168.1.1: icmp_seq=2 ttl=64 time=0.9 ms' },
      { t: 'suc', text: '✓ Gateway respondendo normalmente.' }
    ],
    xp: 50
  },
  {
    phase: 'MÓDULO DE REDES', icon: '🛤️', title: 'RASTREAMENTO DE ROTAS',
    desc: 'Identifique por onde os pacotes estão passando para chegar ao servidor externo "8.8.8.8".',
    objective: 'Utilize o traceroute para 8.8.8.8',
    command: 'traceroute 8.8.8.8',
    learn: '<strong>traceroute</strong> traça a rota e mostra atrasos (latência) de cada salto.',
    hint: 'traceroute 8.8.8.8',
    simulate: () => [
      { t: 'out', text: 'traceroute to 8.8.8.8 (8.8.8.8), 30 hops max, 60 byte packets' },
      { t: 'out', text: ' 1  192.168.1.1 (192.168.1.1)  0.812 ms  0.723 ms' },
      { t: 'out', text: ' 2  10.10.0.1 (10.10.0.1)  5.431 ms  5.210 ms' },
      { t: 'suc', text: '✓ Rota externa diagnosticada com sucesso.' }
    ],
    xp: 60
  },
  {
    phase: 'MÓDULO DE REDES', icon: '🔌', title: 'ESTATÍSTICAS E PORTAS',
    desc: 'Verifique quais portas estão abertas e escutando no servidor atual.',
    objective: 'Exiba as portas usando netstat',
    command: 'netstat',
    learn: '<strong>netstat</strong> exibe conexões e portas em escuta.',
    hint: 'netstat',
    simulate: () => [
      { t: 'out', text: 'Active Internet connections (only servers)' },
      { t: 'out', text: 'tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN' },
      { t: 'out', text: 'tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN' },
      { t: 'warn', text: '⚠ Porta 80 aberta (Serviço Web detectado).' }
    ],
    xp: 70
  },
  {
    phase: 'MÓDULO DE REDES', icon: '📝', title: 'RESOLUÇÃO DE NOMES DNS',
    desc: 'Consulte os registros DNS para o domínio "phantom-corp.local" usando nslookup.',
    objective: 'Resolva o nome DNS do domínio',
    command: 'nslookup phantom-corp.local',
    learn: '<strong>nslookup</strong> consulta servidores DNS.',
    hint: 'nslookup phantom-corp.local',
    simulate: () => [
      { t: 'out', text: 'Server:         192.168.1.1' },
      { t: 'out', text: 'Name:   phantom-corp.local' },
      { t: 'out', text: 'Address: 10.0.0.55' },
      { t: 'suc', text: '✓ Domínio resolvido.' }
    ],
    xp: 80
  }
];

window.GameData.MISSIONS.linux_web = [
  {
    phase: 'MÓDULO DE SERVIDORES WEB', icon: '⚙️', title: 'STATUS DO NGINX',
    desc: 'Você é o admin logado no servidor web. Verifique se o serviço nginx está rodando.',
    objective: 'Exiba o status do serviço nginx',
    command: 'systemctl status nginx',
    learn: '<strong>systemctl status name</strong> mostra se o daemon (serviço) está ativo no systemd.',
    hint: 'systemctl status nginx',
    simulate: () => [
      { t: 'out', text: '● nginx.service - A high performance web server' },
      { t: 'warn', text: '   Active: failed (Result: exit-code) since Wed 2024-06-12 10:15:00 UTC' },
      { t: 'err', text: 'O serviço está offline. Precisamos investigar a causa.' }
    ],
    xp: 50
  },
  {
    phase: 'MÓDULO DE SERVIDORES WEB', icon: '📜', title: 'LEITURA CONTÍNUA DE LOGS',
    desc: 'Acompanhe os logs de acesso em tempo real via access.log para identificar anomalias.',
    objective: 'Inicie a leitura de access.log com tail -f',
    command: 'tail -f access.log',
    learn: '<strong>tail -f</strong> fixa (segue) o fim de um arquivo de log.',
    hint: 'tail -f access.log',
    simulate: () => [
      { t: 'warn', text: '10.0.0.5 - - [12/Jun/2024:10:16:10] "GET /admin HTTP/1.1" 403 512' },
      { t: 'err', text: '10.0.0.5 - - [12/Jun/2024:10:16:15] "POST /login HTTP/1.1" 401 256' },
      { t: 'suc', text: '✓ Identificamos um provável ataque de força bruta!' }
    ],
    xp: 60
  },
  {
    phase: 'MÓDULO DE SERVIDORES WEB', icon: '✏️', title: 'CORREÇÃO DE PÁGINA COM NANO',
    desc: 'A página inicial "index.html" está com erro. Edite-a usando nano e corrija.',
    objective: 'Abra index.html no editor nano',
    command: 'nano index.html',
    learn: '<strong>nano</strong> (mais simples) ou <strong>vim</strong> editam textos direto no console.',
    hint: 'nano index.html',
    simulate: () => [
      { t: 'sys', text: 'Abrindo o editor nano...' },
      { t: 'out', text: '    [ Linha: ErRO alterada para Servidor Operante ]' },
      { t: 'suc', text: '✓ Arquivo salvo e fechado Ctrl+X.' }
    ],
    xp: 70
  },
  {
    phase: 'MÓDULO DE SERVIDORES WEB', icon: '♻️', title: 'REINICIANDO O SISTEMA',
    desc: 'Com o erro corrigido, reinicie o Nginx para aplicar as alterações e colocar o site no ar.',
    objective: 'Reinicie o serviço nginx',
    command: 'systemctl restart nginx',
    learn: '<strong>systemctl restart</strong> desliga e liga o daemon imediatamente.',
    hint: 'systemctl restart nginx',
    simulate: () => [
      { t: 'sys', text: 'Enviando sinal SIGKILL para processos antigos...' },
      { t: 'sys', text: 'Iniciando processos Web Workers...' },
      { t: 'suc', text: '✓ nginx.service (active: running).' },
      { t: 'suc', text: '🏆 Servidor online e estelar. Módulo concluído!' }
    ],
    xp: 100
  }
];
"""

with open(missions_js_path, "w", encoding="utf-8") as f:
    f.write(missions_js_content)

# 2. REFACTOR MAIN.JS
new_main = main_content.replace(missions_match.group(0), "")
new_main = new_main.replace(ach_match.group(0), "const ACHIEVEMENTS = window.GameData.ACHIEVEMENTS;\n")
new_main = new_main.replace(rank_match.group(0), "const RANKING_DATA = window.GameData.RANKING_DATA;\n")
new_main = new_main.replace(quick_match.group(0), "const QUICK_REF = window.GameData.QUICK_REF;\n")

# Use window.GameData.MISSIONS
new_main = new_main.replace("const missions = MISSIONS[G.os];", "const missions = window.GameData.MISSIONS[G.pack || G.os];")
new_main = new_main.replace("G.missionIndex >= MISSIONS[G.os].length", "G.missionIndex >= (window.GameData.MISSIONS[G.pack || G.os] || []).length")

audio_engine = """
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
  const state = {
    os: G.os, pack: G.pack, missionIndex: G.missionIndex, xp: G.xp, level: G.level,
    correct: G.correct, attempts: G.attempts, unlockedAchievements: [...G.unlockedAchievements]
  };
  localStorage.setItem('terminal_master_save', JSON.stringify(state));
}

function loadGameState() {
  const saved = localStorage.getItem('terminal_master_save');
  if (saved) {
    try {
      const state = JSON.parse(saved);
      if (state.os) G.os = state.os;
      if (state.pack) G.pack = state.pack;
      G.missionIndex = state.missionIndex || 0;
      G.xp = state.xp || 0;
      G.level = state.level || 1;
      G.correct = state.correct || 0;
      G.attempts = state.attempts || 0;
      G.unlockedAchievements = new Set(state.unlockedAchievements || []);
    } catch(e){}
  }
}
"""
new_main = new_main.replace("const G = {", audio_engine + "\nconst G = {\n  pack: null,")
new_main = new_main.replace("G.historyIdx = -1;", "G.historyIdx = -1;\n  AudioEngine.init();\n  AudioEngine.keypress();")
new_main = new_main.replace("function addXP(amount) {", "function addXP(amount) {\n  saveGameState();")
new_main = new_main.replace("function nextMission() {", "function nextMission() {\n  saveGameState();")
new_main = new_main.replace("function unlockAchievement(id) {", "function unlockAchievement(id) {\n  saveGameState();")
new_main = new_main.replace("function showMissionComplete(xp, m) {", "function showMissionComplete(xp, m) {\n  AudioEngine.success();")
new_main = new_main.replace("function handleWrong(m, raw) {", "function handleWrong(m, raw) {\n  AudioEngine.error();")

new_main = new_main.replace("function selectOS(os) {", "function selectOS(pack, os) {\n  G.pack = pack;")

tab_code = """} else if (e.key === 'Tab') {
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
    """
new_main = new_main.replace("} else if (e.key === 'ArrowUp') {", tab_code + "\n    } else if (e.key === 'ArrowUp') {")

# To prevent removing loadGameState context, let me inject loadGameState inside selectOS manually where it was defined. Oh actually, loadGameState logic exists, but wait - we also want to call it when booting just in case the user has a save, or modify the boot text? The requirements just say: "Persistência (LocalStorage): Implemente saveGameState() e loadGameState() para que o progresso (XP, Nível e Missões concluídas) não seja perdido ao atualizar a página."
# I will inject loadGameState() at the start of OS select screen button click, wait... no, if the user clicks a pack, it will reset. I should probably add a "Continuar" button to the index.html or just call loadGameState on boot!
new_main = new_main.replace("boot();", "boot();\nloadGameState();\n")

with open(main_js_path, "w", encoding="utf-8") as f:
    f.write(new_main)

# 3. UPDATE INDEX.HTML
with open(index_html_path, "r", encoding="utf-8") as f:
    html_content = f.read()

html_content = html_content.replace('<script src="js/main.js"></script>', '<script src="js/missions.js"></script>\n  <script src="js/main.js"></script>')

os_cards_html = """
      <div class="os-cards">
        <div class="os-card" id="linux-card" onclick="selectOS('linux', 'linux')">
          <div class="os-card-icon">🐧</div>
          <div class="os-card-name">LINUX</div>
          <div class="os-card-shell">HACKING</div>
          <div class="os-card-tags"><span>ls</span><span>chmod</span><span>grep</span></div>
          <div class="os-card-desc">Infiltração básica em ambiente Unix.</div>
          <div class="os-card-btn">▶ INICIAR</div>
        </div>
        <div class="os-card" id="win-card" onclick="selectOS('windows', 'windows')">
          <div class="os-card-icon">🪟</div>
          <div class="os-card-name">WINDOWS</div>
          <div class="os-card-shell">HACKING</div>
          <div class="os-card-tags"><span>dir</span><span>icacls</span><span>findstr</span></div>
          <div class="os-card-desc">Ambiente Microsoft CMD/PowerShell.</div>
          <div class="os-card-btn">▶ INICIAR</div>
        </div>
        <div class="os-card" onclick="selectOS('linux_network', 'linux')">
          <div class="os-card-icon">🌐</div>
          <div class="os-card-name">REDES LINUX</div>
          <div class="os-card-shell">DIAGNÓSTICO</div>
          <div class="os-card-tags"><span>ping</span><span>traceroute</span><span>netstat</span></div>
           <div class="os-card-desc">Análise de conectividade TCP/IP.</div>
          <div class="os-card-btn">▶ INICIAR</div>
        </div>
        <div class="os-card" onclick="selectOS('linux_web', 'linux')">
          <div class="os-card-icon">⚙️</div>
          <div class="os-card-name">SRV WEB</div>
          <div class="os-card-shell">ADMINISTRAÇÃO</div>
          <div class="os-card-tags"><span>systemctl</span><span>tail</span><span>nano</span></div>
           <div class="os-card-desc">Diagnóstico de Nginx e Apache.</div>
          <div class="os-card-btn">▶ INICIAR</div>
        </div>
        <div class="os-card" onclick="restoreSave()">
          <div class="os-card-icon">💾</div>
          <div class="os-card-name">CONTINUAR</div>
          <div class="os-card-shell">LOCAL SAVE</div>
          <div class="os-card-desc">Carregar o último progresso salvo.</div>
          <div class="os-card-btn">▶ RESTAURAR SESSÃO</div>
        </div>
      </div>
"""
import re
html_content = re.sub(r'<div class="os-cards">.*?</div>\s*</div>\s*<!-- MAIN', os_cards_html + '\n    </div>\n  </div>\n\n  <!-- MAIN', html_content, flags=re.DOTALL)

with open(index_html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print("PYTHON SCRIPT COMPLETED SUCCESSFULLY")
