import os, re

dir_path = "c:/Users/Anderson/Documents/terminal-master"
main_js_path = os.path.join(dir_path, "js/main.js")
index_html_path = os.path.join(dir_path, "index.html")
missions_js_path = os.path.join(dir_path, "js/missions.js")

# --- 1. EXPAND MISSIONS.JS ---
with open(missions_js_path, "a", encoding="utf-8") as f:
    f.write("""

// EXPANSION: NEW MODULES
window.GameData.MISSIONS.windows_network = [
  {
    phase: 'REDES WIN', icon: '📡', title: 'CONFIGURAÇÃO IP',
    desc: 'Verifique a configuração de rede completa do sistema atual para identificar os endereços MAC e servidores DNS.',
    objective: 'Exiba a configuração de rede completa (ipconfig)',
    command: 'ipconfig /all',
    learn: '<strong>ipconfig /all</strong> exibe informações detalhadas de todas as interfaces de rede no Windows.',
    hint: 'ipconfig /all',
    simulate: () => [
      { t: 'out', text: 'Windows IP Configuration' },
      { t: 'out', text: '   Host Name . . . . . . . . . . . . : PHANTOM-WIN' },
      { t: 'out', text: '   Primary Dns Suffix  . . . . . . . : ' },
      { t: 'out', text: '   Node Type . . . . . . . . . . . . : Hybrid' },
      { t: 'out', text: '   IP Routing Enabled. . . . . . . . : No' },
      { t: 'out', text: 'Ethernet adapter Ethernet 2:' },
      { t: 'out', text: '   Physical Address. . . . . . . . . : 00-1B-44-11-3A-B7' },
      { t: 'out', text: '   IPv4 Address. . . . . . . . . . . : 192.168.1.105(Preferred) ' },
      { t: 'out', text: '   Default Gateway . . . . . . . . . : 192.168.1.1' },
      { t: 'out', text: '   DNS Servers . . . . . . . . . . . : 8.8.8.8' },
      { t: 'suc', text: '✓ Informações coletadas com sucesso!' }
    ],
    xp: 50
  },
  {
    phase: 'REDES WIN', icon: '🔗', title: 'IDENTIFICAÇÃO DE HARDWARE',
    desc: 'Extraia apenas os endereços físicos (MAC Addresses) das placas de rede usando o comando de diagnóstico.',
    objective: 'Obtenha o endereço MAC (getmac)',
    command: 'getmac',
    learn: '<strong>getmac</strong> é um modo rápido de descobrir o Media Access Control (MAC) address das interfaces locais.',
    hint: 'getmac',
    simulate: () => [
      { t: 'out', text: 'Physical Address    Transport Name' },
      { t: 'out', text: '=================== ==========================================================' },
      { t: 'out', text: '00-1B-44-11-3A-B7   \\Device\\Tcpip_{01F700DB...}' },
      { t: 'out', text: '00-FF-CC-33-22-11   Media disconnected' },
      { t: 'suc', text: '✓ Endereços físicos mapeados.' }
    ],
    xp: 60
  },
  {
    phase: 'REDES WIN', icon: '🖧', title: 'TABELA DE ROTEAMENTO',
    desc: 'Verifique as rotas de rede atuais no sistema para ver por onde o tráfego está vazando.',
    objective: 'Verifique as rotas IPv4 ativas',
    command: 'route print',
    learn: '<strong>route print</strong> exibe a tabela de roteamento de rede do Windows.',
    hint: 'route print',
    simulate: () => [
      { t: 'out', text: '===========================================================================' },
      { t: 'out', text: 'IPv4 Route Table' },
      { t: 'out', text: '===========================================================================' },
      { t: 'out', text: 'Active Routes:' },
      { t: 'out', text: 'Network Destination        Netmask          Gateway       Interface  Metric' },
      { t: 'out', text: '          0.0.0.0          0.0.0.0      192.168.1.1    192.168.1.105     25' },
      { t: 'out', text: '        127.0.0.0        255.0.0.0         On-link         127.0.0.1    331' },
      { t: 'warn', text: '⚠ Rota padrão aponta para o gateway local 192.168.1.1.' }
    ],
    xp: 70
  },
  {
    phase: 'REDES WIN', icon: '📖', title: 'TABELA ARP',
    desc: 'Veja os dispositivos locais conhecidos (Cache ARP) para achar outras máquinas na rede local.',
    objective: 'Verifique a tabela ARP (-a)',
    command: 'arp -a',
    learn: '<strong>arp -a</strong> mostra as resoluções fisícas de IP para MAC conhecidas na rede local.',
    hint: 'arp -a',
    simulate: () => [
      { t: 'out', text: 'Interface: 192.168.1.105 --- 0xc' },
      { t: 'out', text: '  Internet Address      Physical Address      Type' },
      { t: 'out', text: '  192.168.1.1           a0-f3-c1-55-99-88     dynamic' },
      { t: 'warn', text: '  192.168.1.200         00-aa-bb-cc-dd-ee     dynamic' },
      { t: 'out', text: '  192.168.1.255         ff-ff-ff-ff-ff-ff     static' },
      { t: 'err', text: 'Invasor potencial detectado no IP 192.168.1.200!' },
      { t: 'suc', text: '✓ Identificação concluída.' }
    ],
    xp: 80
  },
  {
    phase: 'REDES WIN', icon: '📡', title: 'INTERFACE COM NETSH',
    desc: 'Gere um relatório das conexões instaladas usando o core networking shell.',
    objective: 'Mostre as interfaces ativas (netsh interface show interface)',
    command: 'netsh interface show interface',
    learn: '<strong>netsh</strong> (Network Shell) permite configurar todo o estado de rede pelo terminal.',
    hint: 'netsh interface show interface',
    simulate: () => [
      { t: 'out', text: 'Admin State    State          Type             Interface Name' },
      { t: 'out', text: '-------------------------------------------------------------------------' },
      { t: 'out', text: 'Enabled        Connected      Dedicated        Ethernet 2' },
      { t: 'out', text: 'Enabled        Disconnected   Dedicated        Wi-Fi' },
      { t: 'suc', text: '✓ Relatório netsh obtido.' }
    ],
    xp: 80
  },
  {
    phase: 'REDES WIN', icon: '⚡', title: 'POWERSHELL TEST-NET',
    desc: 'Confirme se o servidor backdoor externo na porta 443 TCP está alcançável via PowerShell.',
    objective: 'Teste a conexão com phantom-corp.local na porta 443',
    command: 'test-netconnection phantom-corp.local -port 443',
    learn: '<strong>Test-NetConnection</strong> (Cmdlet PS) é o canivete suíço para diagnosticar portas fechadas (substitui ping+telnet).',
    hint: 'test-netconnection phantom-corp.local -port 443',
    simulate: () => [
      { t: 'out', text: 'ComputerName     : phantom-corp.local' },
      { t: 'out', text: 'RemoteAddress    : 10.0.0.55' },
      { t: 'out', text: 'RemotePort       : 443' },
      { t: 'out', text: 'InterfaceAlias   : Ethernet 2' },
      { t: 'out', text: 'SourceAddress    : 192.168.1.105' },
      { t: 'suc', text: 'TcpTestSucceeded : True' },
      { t: 'suc', text: '🏆 Trilha de redes Windows finalizada.' }
    ],
    xp: 120
  }
];

// OVERRIDE LINUX_NETWORK (expanding previously generated)
window.GameData.MISSIONS.linux_network = [
  {
    phase: 'REDES LINUX', icon: '🌐', title: 'VERIFICANDO INTERFACES',
    desc: 'Visualize o estado detalhado de todas as interfaces e endereços IPs de maneira moderna no Linux.',
    objective: 'Mostre IPs usando ip addr',
    command: 'ip addr',
    learn: '<strong>ip addr</strong> é o padrão moderno que substituiu o obsoleto `ifconfig` em distros Linux.',
    hint: 'ip addr',
    simulate: () => [
      { t: 'out', text: '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN' },
      { t: 'out', text: '    inet 127.0.0.1/8 scope host lo' },
      { t: 'out', text: '2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP' },
      { t: 'out', text: '    inet 192.168.0.42/24 brd 192.168.0.255 scope global eth0' },
      { t: 'suc', text: '✓ IP do eth0 é 192.168.0.42.' }
    ],
    xp: 50
  },
  {
    phase: 'REDES LINUX', icon: '🔌', title: 'VISUALIZAR PORTAS COM SS',
    desc: 'Observe quais portas TCP (e UDP) o servidor abriu e estão em modo "Listen" (escuta).',
    objective: 'Mostre as portas de escuta usando ss -tuln',
    command: 'ss -tuln',
    learn: '<strong>ss</strong> (Socket Stat) é mais rápido e moderno que o `netstat`. <strong>-tuln</strong> lista portas TCP/UDP abertas numericamente.',
    hint: 'ss -tuln',
    simulate: () => [
      { t: 'out', text: 'Netid  State   Recv-Q  Send-Q    Local Address:Port    Peer Address:Port' },
      { t: 'out', text: 'tcp    LISTEN  0       128             0.0.0.0:22           0.0.0.0:*' },
      { t: 'out', text: 'tcp    LISTEN  0       511             0.0.0.0:443          0.0.0.0:*' },
      { t: 'warn', text: '⚠ Serviços SSH e HTTPS abertos.' }
    ],
    xp: 60
  },
  {
    phase: 'REDES LINUX', icon: '💻', title: 'HOSTNAME DIRETO',
    desc: 'Ao invés de processar o ifconfig longo, extraia todos os endereços IP (hostnames) formatados limpos em uma string única.',
    objective: 'Obtenha IPs da máquina com hostname',
    command: 'hostname -I',
    learn: '<strong>hostname -I</strong> exibe o(s) IP(s) diretamente da rede conectada sem poluição de loopback local.',
    hint: 'hostname -I',
    simulate: () => [
      { t: 'out', text: '192.168.0.42 10.9.8.10' },
      { t: 'suc', text: '✓ Duas redes detectadas (Local e VPN Privada).' }
    ],
    xp: 50
  },
  {
    phase: 'REDES LINUX', icon: '📝', title: 'DNS COM DIG',
    desc: 'Use dig e extraia apenas os registros IPs de phantom.local sem o output longo (formato short).',
    objective: 'Faça consulta DNS de phantom.local (modo +short)',
    command: 'dig phantom.local +short',
    learn: '<strong>dig +short</strong> é excelente para scripts em servidores (retorna apenas a string direta do IP correspondente).',
    hint: 'dig phantom.local +short',
    simulate: () => [
      { t: 'out', text: '10.0.0.55' },
      { t: 'out', text: '10.0.0.56' },
      { t: 'suc', text: '✓ Load balancer detectado.' }
    ],
    xp: 70
  },
  {
    phase: 'REDES LINUX', icon: '📶', title: 'GERENCIADOR NAMCLI',
    desc: 'Verifique os dispositivos de rede usando a cli do Network Manager.',
    objective: 'Visualize as redes por meio do nmcli',
    command: 'nmcli device status',
    learn: '<strong>nmcli</strong> é uma forte ferramenta para redes RedHat/Debian Moderno. `nmcli dev status` lista os adaptadores.',
    hint: 'nmcli device status',
    simulate: () => [
      { t: 'out', text: 'DEVICE  TYPE      STATE      CONNECTION ' },
      { t: 'out', text: 'eth0    ethernet  connected  Wired connection 1 ' },
      { t: 'out', text: 'lo      loopback  unmanaged  -- ' },
      { t: 'suc', text: '✓ Status de interface conectado.' }
    ],
    xp: 70
  },
  {
    phase: 'REDES LINUX', icon: '🛡️', title: 'AUDITORIA DE FIREWALL',
    desc: 'Use o Iptables para listar todas as tabelas de firewall ativas na máquina.',
    objective: 'Liste as regras do firewall (iptables -L)',
    command: 'iptables -L',
    learn: '<strong>iptables -L</strong> lista as Chains (cadeias) em operação. É vital entender como INPUT, FORWARD e OUTPUT funcionam.',
    hint: 'iptables -L',
    simulate: () => [
      { t: 'out', text: 'Chain INPUT (policy ACCEPT)' },
      { t: 'out', text: 'target     prot opt source               destination         ' },
      { t: 'out', text: 'DROP       tcp  --  192.168.1.200        anywhere             tcp dpt:ssh' },
      { t: 'out', text: '' },
      { t: 'out', text: 'Chain FORWARD (policy DROP)' },
      { t: 'out', text: 'target     prot opt source               destination         ' },
      { t: 'out', text: '' },
      { t: 'out', text: 'Chain OUTPUT (policy ACCEPT)' },
      { t: 'out', text: 'target     prot opt source               destination         ' },
      { t: 'suc', text: 'Trilha completada. Tráfego SSH para alvo específico está sendo dropado por regra de firewall.' }
    ],
    xp: 130
  }
];

window.GameData.MISSIONS.linux_server = [
  {
    phase: 'SERVER ADMIN', icon: '📊', title: 'ESPAÇO EM DISCO',
    desc: 'A aplicação web não está salvando logs. Verifique o uso de disco de todas as partições num formato legível.',
    objective: 'Verifique disco (df -h)',
    command: 'df -h',
    learn: '<strong>df -h</strong> exibe blocos particionados em um formato "Human Readable" (Mega/Giga bytes).',
    hint: 'df -h',
    simulate: () => [
      { t: 'out', text: 'Filesystem      Size  Used Avail Use% Mounted on' },
      { t: 'out', text: '/dev/sda1        50G   50G     0 100% /' },
      { t: 'out', text: 'tmpfs           3.9G     0  3.9G   0% /run' },
      { t: 'err', text: 'Partição root (/) está cheia! Isso está derrubando o servidor.' }
    ],
    xp: 60
  },
  {
    phase: 'SERVER ADMIN', icon: '📂', title: 'ONDE ESTÁ O PESO',
    desc: 'O disco C: (ou /, no linux) está cheio. Liste e mostre o tamanho resumido (du) da pasta /var/log/.',
    objective: 'Inspecione a pasta de logs (du -sh)',
    command: 'du -sh /var/log/',
    learn: '<strong>du -sh diretorio</strong> diz quanto (Disk Usage) a pasta alvo pesa inteira.',
    hint: 'du -sh /var/log/',
    simulate: () => [
      { t: 'out', text: '43G	/var/log/' },
      { t: 'suc', text: '✓ Isolado! Os logs estão pesando 43 Gigabytes.' }
    ],
    xp: 60
  },
  {
    phase: 'SERVER ADMIN', icon: '🗑️', title: 'LIMPEZA EXTREMA',
    desc: 'Vamos limpar os logs de erro apagando-os definitivamente para abrir espaço.',
    objective: 'Delete o log pesado com rm',
    command: 'rm /var/log/apache2/error.log',
    learn: '<strong>rm /caminho</strong> remove arquivos permanentemente sem lixeira.',
    hint: 'rm /var/log/apache2/error.log',
    simulate: () => [
      { t: 'sys', text: 'Removendo...' },
      { t: 'suc', text: '✓ Espaço no disco liberado. O sistema deve voltar ao ar.' }
    ],
    xp: 50
  },
  {
    phase: 'SERVER ADMIN', icon: '👥', title: 'NOVA IDENTIDADE',
    desc: 'Precisamos de um usuário novo simulado para acessar o painel do servidor por trás dos bastidores.',
    objective: 'Adicione o usuário "ghost" (useradd)',
    command: 'useradd ghost',
    learn: '<strong>useradd</strong> cria base estrutural para credenciais no /etc/passwd.',
    hint: 'useradd ghost',
    simulate: () => [
      { t: 'sys', text: 'Criando mailbox do servidor...' },
      { t: 'suc', text: 'Ajudante "ghost" criado!' }
    ],
    xp: 50
  },
  {
    phase: 'SERVER ADMIN', icon: '👑', title: 'ATRIBUIÇÃO ADMIN',
    desc: 'Dê à nova identidade privilégios administrativos (Adicionando o usuário ghost ao grupo sudo).',
    objective: 'Modifique o usuário para participar do sudo (-aG)',
    command: 'usermod -aG sudo ghost',
    learn: '<strong>usermod -aG GRUPO USER</strong> (-a de append e -G force de grupo suplementar). Nunca esqueça o -a ou zerará todos os grupos.',
    hint: 'usermod -aG sudo ghost',
    simulate: () => [
      { t: 'out', text: 'Adicionando e configurando direitos sudo...' },
      { t: 'suc', text: '✓ Ghost agora tem permissões root virtuais.' }
    ],
    xp: 70
  },
  {
    phase: 'SERVER ADMIN', icon: '📈', title: 'USO DE RECURSOS EM TEMPO REAL',
    desc: 'Agora o que pode estar gastando CPU? Lance o htop para verificar (ou top na ausência dele).',
    objective: 'Lance o monitor de processos interativo',
    command: 'htop',
    learn: '<strong>htop</strong> é uma versão superior e visual colorida do veterano "top".',
    hint: 'htop',
    simulate: () => [
      { t: 'out', text: '1  [||||||||||||||||||||||100.0%]   Tasks: 42, 630 thr; 2 running' },
      { t: 'out', text: '2  [|||                        5.0%]   Load average: 4.10 2.21 1.05 ' },
      { t: 'out', text: 'Mem[||||||||||           2.3G/7.8G]   Uptime: 45 days, 01:23:44' },
      { t: 'out', text: '' },
      { t: 'out', text: '  PID USER      PRI  NI  VIRT   RES   SHR S CPU% MEM%   TIME+  Command' },
      { t: 'out', text: '13374 root       20   0 48108  4096  3092 R 99.8  0.1  2h31:12 crypto-miner' },
      { t: 'warn', text: '⚠ Malware "crypto-miner" identificado.' }
    ],
    xp: 60
  },
  {
    phase: 'SERVER ADMIN', icon: '✂️', title: 'NEUTRALIZANDO CPU',
    desc: 'Use kill enviando o sinal SIGKILL (-9) para o PID do mineiro.',
    objective: 'Mate o processo 13374 a força',
    command: 'kill -9 13374',
    learn: '<strong>kill -9 PID</strong> manda o processo terminar no ato sem salvar nem liberar arquivos abertos de maneira limpa.',
    hint: 'kill -9 13374',
    simulate: () => [
      { t: 'out', text: 'Killed process 13374.' },
      { t: 'suc', text: '✓ Carga da CPU estabilizada...' }
    ],
    xp: 70
  },
  {
    phase: 'SERVER ADMIN', icon: '⚙️', title: 'EDIÇÃO CONFIG COM VI',
    desc: 'Altere o /etc/ssh/sshd_config bloqueando senhas para o sistema de proteção usando nano ou vi.',
    objective: 'Abra /etc/ssh/sshd_config num editor visual',
    command: 'vi /etc/ssh/sshd_config',
    learn: '<strong>vi</strong> ou <strong>vim</strong> abrem nativamente por qualquer linha de terminal sem precisar baixar.',
    hint: 'vi /etc/ssh/sshd_config',
    simulate: () => [
      { t: 'sys', text: 'Abrindo painel do VI. Alterando PasswordAuthentication para "no"...' },
      { t: 'sys', text: '[ESC] digitado. [wq] gravado.' },
      { t: 'suc', text: '✓ Configuração salva e fechada com sucesso!' }
    ],
    xp: 90
  },
  {
    phase: 'SERVER ADMIN', icon: '🔄', title: 'APLICAR NO RESTART',
    desc: 'Reinicie o serviço sshd para blindar sua sessão recém ajustada.',
    objective: 'Reinicie o serviço de ssh via systemctl',
    command: 'systemctl restart sshd',
    learn: '<strong>systemctl restart SERVICE</strong>',
    hint: 'systemctl restart sshd',
    simulate: () => [
      { t: 'sys', text: 'Aguarde o reset de cache do systemd...' },
      { t: 'suc', text: '✓ sshd.service reiniciado de forma limpa e criptografada.' },
      { t: 'suc', text: '🏆 Parabéns Admin de Elite, o servidor foi diagnosticado, limpo e fortificado!' }
    ],
    xp: 150
  }
];
""")

# --- 2. REFACTOR MAIN.JS ---
with open(main_js_path, "r", encoding="utf-8") as f:
    main_content = f.read()

# Refactor G structure
g_old = """const G = {
  pack: null,
  os: null,
  missionIndex: 0,
  xp: 0, level: 1,
  correct: 0, attempts: 0,
  hintShown: false, failCount: 0,
  unlockedAchievements: new Set(),
  history: [], historyIdx: -1,
};"""
g_new = """const G = {
  pack: null,
  os: null,
  missionIndex: 0,
  xp: 0, level: 1,
  correct: 0, attempts: 0,
  hintShown: false, failCount: 0,
  unlockedAchievements: new Set(),
  history: [], historyIdx: -1,
  progress: {}
};"""
main_content = main_content.replace(g_old, g_new)

save_logic = """function saveGameState() {
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
}"""
main_content = re.sub(r'function saveGameState\(\).*?function loadGameState\(\).*?\}\s*\}', save_logic, main_content, flags=re.DOTALL)

show_hub_logic = """function showHubScreen() {
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
}"""
main_content = re.sub(r'function showOsScreen\(\) \{.*?\}', show_hub_logic, main_content, flags=re.DOTALL)

# Refactor selectOS
select_os_code = """function selectOS(pack, os) {
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
  AudioEngine.keypress();"""
main_content = re.sub(r'function selectOS\(pack, os\) \{.*?AudioEngine\.keypress\(\);', select_os_code, main_content, flags=re.DOTALL)

# Remove restoreSave implementation since we replaced it with Hub Logic
main_content = re.sub(r'function restoreSave\(\).*?(?=\n// ─── TERMINAL PRINT)', '', main_content, flags=re.DOTALL)

# Add exit / menu logic inside handleCommand
handle_exit = """const norm = raw.replace(/\s+/g, ' ').trim().toLowerCase();
  
  if (norm === 'exit' || norm === 'menu') {
    saveGameState();
    $('game-screen').classList.remove('active');
    setTimeout(() => {
        $('game-screen').style.display = 'none';
        clearTerminal();
        showHubScreen();
    }, 400);
    return;
  }"""
main_content = main_content.replace("const norm = raw.replace(/\s+/g, ' ').trim().toLowerCase();", handle_exit)

# The new linux network actually replaces the short array created before, wait - python script appended it. So the GameData.MISSIONS has `linux_network`. But earlier I didn't write it using override, I just appended it. It's JS, so `window.GameData.MISSIONS.linux_network = [...]` will just overwrite the previous linux_network if it exists! We are perfectly fine.
# But wait, earlier I generated `linux_hacking`? No, the previous script copied the parsed `const MISSIONS = { linux: [], windows: [] }` directly to `window.GameData.MISSIONS = { linux: [], windows: [] }`.
# Oh! In the new `cardsDef`, I used `id: 'linux_hacking'` and `id: 'windows_hacking'`!!!
# I need to ensure `linux_hacking` is properly aliased to the `linux` array!
alias_hack_packs = """
function boot() {
  // Alias the hacks if missing
  if (window.GameData.MISSIONS.linux && !window.GameData.MISSIONS.linux_hacking) {
    window.GameData.MISSIONS.linux_hacking = window.GameData.MISSIONS.linux;
  }
  if (window.GameData.MISSIONS.windows && !window.GameData.MISSIONS.windows_hacking) {
    window.GameData.MISSIONS.windows_hacking = window.GameData.MISSIONS.windows;
  }"""
main_content = main_content.replace("function boot() {", alias_hack_packs)

# Finally write main_js
with open(main_js_path, "w", encoding="utf-8") as f:
    f.write(main_content)

print("PYTHON HUB SCRIPT COMPLETED SUCCESSFULLY")
