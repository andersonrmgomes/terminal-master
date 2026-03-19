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
const G = {
  os: null,
  missionIndex: 0,
  xp: 0, level: 1,
  correct: 0, attempts: 0,
  hintShown: false, failCount: 0,
  unlockedAchievements: new Set(),
  history: [], historyIdx: -1,
};

const XP_LEVELS = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200];
const RANKS = ['ROOKIE', 'INFILTRADO', 'EXPLORADOR', 'HACKER', 'ESPECIALISTA', 'ELITE', 'FANTASMA', 'MESTRE'];

const termState = { cwd: '~', prompt: 'infiltrado@server:~$' };

// ─── MISSIONS ──────────────────────────────────────
const MISSIONS = {
  linux: [
    {
      phase: 'FASE 1 — BÁSICO', icon: '🗺️', title: 'PRIMEIRA CONEXÃO',
      desc: 'Você acaba de estabelecer acesso remoto ao servidor alvo. Descubra onde está no sistema.',
      objective: 'Descubra seu diretório atual',
      command: 'pwd',
      learn: 'O <strong>pwd</strong> (Print Working Directory) exibe o caminho completo do diretório atual.',
      hint: '3 letras: pwd',
      simulate: () => [{ t: 'out', text: '/home/infiltrado' }],
      xp: 40,
    },
    {
      phase: 'FASE 1 — BÁSICO', icon: '📂', title: 'MAPEAMENTO DO TERRENO',
      desc: 'Liste todos os arquivos incluindo ocultos — os dados criptografados podem estar disfarçados.',
      objective: 'Liste arquivos incluindo ocultos',
      command: 'ls -la',
      learn: '<strong>ls -l</strong> exibe detalhes, <strong>-a</strong> mostra arquivos ocultos (começam com ponto).',
      hint: 'ls com flags -l e -a combinadas: ls -la',
      simulate: () => [
        { t: 'out', text: 'total 48' },
        { t: 'out', text: 'drwxr-xr-x  4 infiltrado root 4096 Jun 12 03:41 .' },
        { t: 'out', text: 'drwxr-xr-x 18 root       root 4096 Jun 12 01:00 ..' },
        { t: 'out', text: '-rw-------  1 infiltrado root  220 Jun 12 01:00 .bash_history' },
        { t: 'out', text: 'drwxr-xr-x  2 infiltrado root 4096 Jun 12 03:41 secret' },
        { t: 'out', text: '-rw-r--r--  1 infiltrado root  156 Jun 12 03:40 readme.txt' },
        { t: 'suc', text: '↳ Diretório "secret" localizado!' },
      ],
      xp: 50,
    },
    {
      phase: 'FASE 1 — BÁSICO', icon: '🚪', title: 'ACESSO AO DIRETÓRIO SECRETO',
      desc: 'Há um diretório "secret". Navegue até ele.',
      objective: 'Entre no diretório "secret"',
      command: 'cd secret',
      learn: '<strong>cd</strong> (Change Directory) navega entre diretórios. <strong>cd ..</strong> volta um nível.',
      hint: 'cd seguido do nome: cd secret',
      simulate: (s) => { s.cwd = '~/secret'; s.prompt = 'infiltrado@server:~/secret$'; return [{ t: 'sys', text: '📁 Entrando em /home/infiltrado/secret...' }]; },
      xp: 30,
    },
    {
      phase: 'FASE 1 — BÁSICO', icon: '🔍', title: 'RECONHECIMENTO INTERNO',
      desc: 'Liste o conteúdo deste diretório secreto.',
      objective: 'Liste o conteúdo do diretório atual',
      command: 'ls',
      learn: '<strong>ls</strong> sem flags exibe uma listagem simples do diretório atual.',
      hint: 'Só: ls',
      simulate: () => [
        { t: 'out', text: 'arquivo_criptografado.enc  chave.key  logs.txt  readme_hack.md' },
        { t: 'suc', text: '↳ 4 arquivos encontrados!' },
      ],
      xp: 30,
    },
    {
      phase: 'FASE 2 — INTERMEDIÁRIO', icon: '📖', title: 'LEITURA DO MANIFESTO',
      desc: 'Leia o conteúdo de readme_hack.md sem abrir um editor.',
      objective: 'Exiba o conteúdo de readme_hack.md',
      command: 'cat readme_hack.md',
      learn: '<strong>cat</strong> exibe o conteúdo de arquivos no terminal. Para arquivos longos, use <strong>less</strong>.',
      hint: 'cat seguido do nome: cat readme_hack.md',
      simulate: () => [
        { t: 'out', text: '# OPERAÇÃO PHANTOM KEY' },
        { t: 'out', text: '' },
        { t: 'out', text: 'Os arquivos .enc foram cifrados com AES-256.' },
        { t: 'out', text: 'A chave está em chave.key — só "admin" pode ler.' },
        { t: 'suc', text: '↳ Próximo passo: verificar permissões.' },
      ],
      xp: 60,
    },
    {
      phase: 'FASE 2 — INTERMEDIÁRIO', icon: '🏗️', title: 'CRIANDO COBERTURA',
      desc: 'Crie um diretório de trabalho chamado "tools".',
      objective: 'Crie um diretório chamado "tools"',
      command: 'mkdir tools',
      learn: '<strong>mkdir</strong> cria diretórios. Use <strong>mkdir -p</strong> para criar aninhados de uma vez.',
      hint: 'mkdir seguido do nome: mkdir tools',
      simulate: () => [{ t: 'suc', text: '✓ Diretório "tools" criado.' }],
      xp: 40,
    },
    {
      phase: 'FASE 2 — INTERMEDIÁRIO', icon: '📝', title: 'RASTRO FALSO',
      desc: 'Crie um arquivo de log falso usando redirecionamento.',
      objective: 'Crie "decoy.log" com o texto "Sistema normal"',
      command: 'echo "Sistema normal" > decoy.log',
      learn: '<strong>echo</strong> imprime texto. <strong>></strong> redireciona para arquivo (sobrescreve). <strong>>></strong> adiciona ao final.',
      hint: 'echo "texto" > arquivo: echo "Sistema normal" > decoy.log',
      simulate: () => [{ t: 'suc', text: '✓ decoy.log criado.' }, { t: 'dim', text: '  Conteúdo: "Sistema normal"' }],
      xp: 60,
    },
    {
      phase: 'FASE 2 — INTERMEDIÁRIO', icon: '🔐', title: 'VERIFICANDO PERMISSÕES',
      desc: 'Verifique as permissões detalhadas de chave.key.',
      objective: 'Liste detalhes de chave.key',
      command: 'ls -l chave.key',
      learn: '<strong>ls -l arquivo</strong> mostra: permissões, dono, grupo, tamanho, data e nome.',
      hint: 'ls -l com o nome do arquivo: ls -l chave.key',
      simulate: () => [
        { t: 'out', text: '-r-------- 1 admin admin 64 Jun 12 03:41 chave.key' },
        { t: 'warn', text: '⚠ Apenas "admin" pode ler este arquivo.' },
      ],
      xp: 50,
    },
    {
      phase: 'FASE 2 — INTERMEDIÁRIO', icon: '🔓', title: 'ESCALADA DE PERMISSÕES',
      desc: 'Altere as permissões de chave.key para que qualquer usuário possa lê-lo.',
      objective: 'Dê permissão de leitura para todos em chave.key',
      command: 'chmod 644 chave.key',
      learn: '<strong>chmod</strong> altera permissões. Octal: 4=r, 2=w, 1=x. <strong>644</strong>: dono(rw) grupo(r) outros(r).',
      hint: 'chmod 644 chave.key',
      simulate: () => [
        { t: 'suc', text: '✓ Permissões alteradas: -rw-r--r-- chave.key' },
        { t: 'suc', text: '🔑 Você pode ler a chave agora!' },
      ],
      xp: 80,
    },
    {
      phase: 'FASE 2 — INTERMEDIÁRIO', icon: '🗝️', title: 'OBTENDO A CHAVE',
      desc: 'Com permissões ajustadas, leia o conteúdo de chave.key.',
      objective: 'Exiba o conteúdo de chave.key',
      command: 'cat chave.key',
      learn: 'Leitura de arquivos sensíveis é técnica comum em pen testing. Sempre obtenha autorização antes.',
      hint: 'cat chave.key',
      simulate: () => [
        { t: 'out', text: '╔════════════════════════════════════════╗' },
        { t: 'out', text: '║  PHANTOM KEY — AES-256 DECRYPTION     ║' },
        { t: 'out', text: '╚════════════════════════════════════════╝' },
        { t: 'out', text: 'KEY: 4f8a2b9c1e7d3f6a0b5c8d2e4f1a9b3c' },
        { t: 'suc', text: '🏆 Chave obtida! Fase 2 concluída.' },
      ],
      xp: 70,
    },
    {
      phase: 'FASE 3 — AVANÇADO', icon: '📡', title: 'MONITORANDO PROCESSOS',
      desc: 'Verifique os processos em execução para identificar agentes de segurança.',
      objective: 'Liste os processos em execução',
      command: 'ps aux',
      learn: '<strong>ps aux</strong>: a=todos os usuários, u=detalhado, x=sem terminal. Veja PID, CPU e memória.',
      hint: 'ps aux',
      simulate: () => [
        { t: 'out', text: 'USER       PID %CPU %MEM COMMAND' },
        { t: 'out', text: 'root         1  0.0  0.1 /sbin/init' },
        { t: 'out', text: 'admin      891  2.1  1.2 security-monitor' },
        { t: 'out', text: 'admin      892  0.1  0.8 log-watcher' },
        { t: 'warn', text: '⚠ "security-monitor" detectado (PID 891).' },
      ],
      xp: 70,
    },
    {
      phase: 'FASE 3 — AVANÇADO', icon: '🔎', title: 'CAÇA AO PADRÃO',
      desc: 'Filtre logs.txt para encontrar apenas linhas com "ERRO".',
      objective: 'Busque "ERRO" no arquivo logs.txt',
      command: 'grep "ERRO" logs.txt',
      learn: '<strong>grep</strong> filtra linhas com um padrão. Flags: <strong>-i</strong> ignora maiúsculas, <strong>-n</strong> mostra número da linha.',
      hint: 'grep "padrão" arquivo: grep "ERRO" logs.txt',
      simulate: () => [
        { t: 'out', text: 'logs.txt:47: [ERRO] Acesso não autorizado: 192.168.1.99' },
        { t: 'out', text: 'logs.txt:83: [ERRO] Falha de autenticação para "root"' },
        { t: 'out', text: 'logs.txt:91: [ERRO] chave.key acessada — permissão modificada' },
        { t: 'warn', text: '⚠ Sua ação foi registrada!' },
      ],
      xp: 80,
    },
    {
      phase: 'FASE 3 — AVANÇADO', icon: '⚡', title: 'O PODER DO PIPE',
      desc: 'Encadeie comandos: liste processos e filtre apenas os da "admin".',
      objective: 'Liste processos e filtre por "admin"',
      command: 'ps aux | grep admin',
      learn: 'O <strong>|</strong> (pipe) passa a saída de um comando como entrada de outro. Encadeie infinitos comandos.',
      hint: 'ps aux | grep admin',
      simulate: () => [
        { t: 'out', text: 'admin  891  2.1  1.2 security-monitor --daemon' },
        { t: 'out', text: 'admin  892  0.1  0.8 log-watcher /var/log/audit' },
        { t: 'suc', text: '✓ Pipe executado. Processos do admin isolados.' },
      ],
      xp: 90,
    },
    {
      phase: 'FASE 3 — AVANÇADO', icon: '🕵️', title: 'BUSCA RECURSIVA',
      desc: 'Procure todos os arquivos .enc no sistema inteiro.',
      objective: 'Encontre todos arquivos .enc a partir da raiz',
      command: 'find / -name "*.enc" 2>/dev/null',
      learn: '<strong>find / -name "*.enc"</strong> busca recursivamente. <strong>2>/dev/null</strong> suprime erros de permissão.',
      hint: 'find / -name "*.enc" 2>/dev/null',
      simulate: () => [
        { t: 'dim', text: 'Buscando em todo o sistema...' },
        { t: 'out', text: '/home/infiltrado/secret/arquivo_criptografado.enc' },
        { t: 'out', text: '/var/backup/sistema_backup.enc' },
        { t: 'out', text: '/opt/phantom/dados_pessoais.enc' },
        { t: 'suc', text: '🎯 3 arquivos .enc encontrados.' },
      ],
      xp: 100,
    },
    {
      phase: 'FASE 3 — AVANÇADO', icon: '🔬', title: 'CONTANDO EVIDÊNCIAS',
      desc: 'Conte quantas linhas de ERRO existem nos logs.',
      objective: 'Conte as linhas com "ERRO" em logs.txt',
      command: 'grep -c "ERRO" logs.txt',
      learn: '<strong>grep -c</strong> conta linhas com o padrão. Alternativa: <strong>grep "ERRO" logs.txt | wc -l</strong>.',
      hint: 'grep -c "ERRO" logs.txt',
      simulate: () => [
        { t: 'out', text: '3' },
        { t: 'suc', text: '✓ 3 entradas de erro. Relatório completo.' },
      ],
      xp: 80,
    },
    {
      phase: 'FASE 3 — AVANÇADO', icon: '🏴‍☠️', title: 'MISSÃO FINAL',
      desc: 'Leia o arquivo .enc e filtre apenas a linha "PHANTOM" via pipe.',
      objective: 'Exiba apenas a linha "PHANTOM" do arquivo .enc',
      command: 'cat arquivo_criptografado.enc | grep "PHANTOM"',
      learn: 'Parabéns! Próximos passos: <strong>awk</strong>, <strong>sed</strong> e <strong>bash scripting</strong> para automação.',
      hint: 'cat arquivo_criptografado.enc | grep "PHANTOM"',
      simulate: () => [
        { t: 'out', text: '>>> PHANTOM ENCRYPTED PAYLOAD — OPERATION COMPLETE <<<' },
        { t: 'out', text: '' },
        { t: 'suc', text: '╔══════════════════════════════════════════╗' },
        { t: 'suc', text: '║  🏆 OPERAÇÃO PHANTOM KEY — CONCLUÍDA!  ║' },
        { t: 'suc', text: '╚══════════════════════════════════════════╝' },
      ],
      xp: 150,
    },
  ],

  windows: [
    {
      phase: 'FASE 1 — BÁSICO', icon: '🗺️', title: 'PRIMEIRA CONEXÃO',
      desc: 'Acesso ao sistema Windows estabelecido. Descubra em qual diretório você está.',
      objective: 'Exiba o diretório atual',
      command: 'cd',
      learn: 'No CMD, <strong>cd</strong> sem argumentos exibe o diretório atual. No PowerShell use <strong>pwd</strong>.',
      hint: 'Apenas: cd',
      simulate: () => [{ t: 'out', text: 'C:\\Users\\Infiltrado' }],
      xp: 40,
    },
    {
      phase: 'FASE 1 — BÁSICO', icon: '📂', title: 'MAPEAMENTO DO TERRENO',
      desc: 'Liste todos os arquivos com detalhes, incluindo ocultos.',
      objective: 'Liste todos os arquivos com detalhes',
      command: 'dir /a',
      learn: '<strong>dir /a</strong> mostra arquivos com todos os atributos (incluindo ocultos e de sistema).',
      hint: 'dir com flag /a: dir /a',
      simulate: () => [
        { t: 'out', text: ' Directory of C:\\Users\\Infiltrado' },
        { t: 'out', text: '' },
        { t: 'out', text: '12/06/2024  03:41    <DIR>     secret' },
        { t: 'out', text: '12/06/2024  03:39          156 readme.txt' },
        { t: 'out', text: '12/06/2024  03:38   <HIDDEN>   .credentials' },
        { t: 'suc', text: '↳ Pasta "secret" e arquivo oculto detectados!' },
      ],
      xp: 50,
    },
    {
      phase: 'FASE 1 — BÁSICO', icon: '🚪', title: 'ACESSO AO DIRETÓRIO SECRETO',
      desc: 'Navegue até a pasta "secret".',
      objective: 'Entre na pasta "secret"',
      command: 'cd secret',
      learn: '<strong>cd</strong> funciona igual ao Linux. Use <strong>cd ..</strong> para voltar, <strong>cd \\</strong> para a raiz.',
      hint: 'cd secret',
      simulate: (s) => { s.cwd = 'C:\\Users\\Infiltrado\\secret'; s.prompt = 'C:\\Users\\Infiltrado\\secret>'; return [{ t: 'sys', text: '📁 Entrando em C:\\Users\\Infiltrado\\secret...' }]; },
      xp: 30,
    },
    {
      phase: 'FASE 1 — BÁSICO', icon: '🔍', title: 'RECONHECIMENTO INTERNO',
      desc: 'Liste o conteúdo desta pasta secreta.',
      objective: 'Liste os arquivos da pasta atual',
      command: 'dir',
      learn: '<strong>dir</strong> sem flags lista arquivos com tamanho e data. Tab autocompleta nomes.',
      hint: 'Apenas: dir',
      simulate: () => [
        { t: 'out', text: ' Directory of C:\\Users\\Infiltrado\\secret' },
        { t: 'out', text: '' },
        { t: 'out', text: '12/06/2024  03:41         2048 arquivo_criptografado.enc' },
        { t: 'out', text: '12/06/2024  03:40           64 chave.key' },
        { t: 'out', text: '12/06/2024  03:38         1024 logs.txt' },
        { t: 'out', text: '12/06/2024  03:37           98 readme_hack.txt' },
        { t: 'suc', text: '↳ 4 arquivos encontrados!' },
      ],
      xp: 30,
    },
    {
      phase: 'FASE 2 — INTERMEDIÁRIO', icon: '📖', title: 'LEITURA DO MANIFESTO',
      desc: 'Leia o conteúdo de readme_hack.txt diretamente no terminal.',
      objective: 'Exiba o conteúdo de readme_hack.txt',
      command: 'type readme_hack.txt',
      learn: '<strong>type</strong> exibe arquivos texto (equivalente ao cat do Linux). PowerShell: <strong>Get-Content</strong>.',
      hint: 'type readme_hack.txt',
      simulate: () => [
        { t: 'out', text: '# OPERACAO PHANTOM KEY' },
        { t: 'out', text: '' },
        { t: 'out', text: 'Os arquivos .enc foram cifrados com AES-256.' },
        { t: 'out', text: 'A chave esta em chave.key — so SYSTEM tem acesso.' },
        { t: 'suc', text: '↳ Próximo passo: verificar permissões NTFS.' },
      ],
      xp: 60,
    },
    {
      phase: 'FASE 2 — INTERMEDIÁRIO', icon: '🏗️', title: 'CRIANDO COBERTURA',
      desc: 'Crie uma pasta de trabalho chamada "tools".',
      objective: 'Crie a pasta "tools"',
      command: 'mkdir tools',
      learn: '<strong>mkdir</strong> funciona no CMD e no PowerShell para criar diretórios.',
      hint: 'mkdir tools',
      simulate: () => [{ t: 'suc', text: '✓ Pasta "tools" criada.' }],
      xp: 40,
    },
    {
      phase: 'FASE 2 — INTERMEDIÁRIO', icon: '📝', title: 'RASTRO FALSO',
      desc: 'Crie um arquivo de log falso para enganar o time de segurança.',
      objective: 'Crie "decoy.log" com o texto "Sistema OK"',
      command: 'echo Sistema OK > decoy.log',
      learn: '<strong>echo</strong> no CMD imprime texto. <strong>></strong> redireciona para arquivo. <strong>>></strong> adiciona.',
      hint: 'echo Sistema OK > decoy.log',
      simulate: () => [{ t: 'suc', text: '✓ decoy.log criado.' }, { t: 'dim', text: '  Conteúdo: "Sistema OK"' }],
      xp: 60,
    },
    {
      phase: 'FASE 2 — INTERMEDIÁRIO', icon: '🔐', title: 'VERIFICANDO PERMISSÕES NTFS',
      desc: 'Verifique as permissões NTFS do arquivo chave.key.',
      objective: 'Verifique permissões de chave.key',
      command: 'icacls chave.key',
      learn: '<strong>icacls</strong> exibe permissões NTFS. F=Full, M=Modify, R=Read, W=Write.',
      hint: 'icacls chave.key',
      simulate: () => [
        { t: 'out', text: 'chave.key NT AUTHORITY\\SYSTEM:(F)' },
        { t: 'out', text: '          BUILTIN\\Administrators:(R)' },
        { t: 'warn', text: '⚠ Apenas SYSTEM e Admins têm acesso.' },
      ],
      xp: 50,
    },
    {
      phase: 'FASE 2 — INTERMEDIÁRIO', icon: '🔓', title: 'CONCEDENDO ACESSO',
      desc: 'Conceda permissão de leitura para "Everyone" em chave.key.',
      objective: 'Conceda acesso a "Everyone" em chave.key',
      command: 'icacls chave.key /grant Everyone:R',
      learn: '<strong>icacls /grant usuario:permissão</strong> adiciona permissões. /deny nega, /remove remove.',
      hint: 'icacls chave.key /grant Everyone:R',
      simulate: () => [
        { t: 'out', text: 'processed file: chave.key' },
        { t: 'suc', text: '✓ Permissão de leitura concedida para Everyone!' },
      ],
      xp: 80,
    },
    {
      phase: 'FASE 2 — INTERMEDIÁRIO', icon: '🗝️', title: 'OBTENDO A CHAVE',
      desc: 'Com acesso concedido, leia o conteúdo de chave.key.',
      objective: 'Exiba o conteúdo de chave.key',
      command: 'type chave.key',
      learn: 'Após modificar permissões NTFS, o acesso é imediato. PowerShell: Get-Content chave.key.',
      hint: 'type chave.key',
      simulate: () => [
        { t: 'out', text: '╔════════════════════════════════════════╗' },
        { t: 'out', text: '║  PHANTOM KEY — AES-256 DECRYPTION     ║' },
        { t: 'out', text: '╚════════════════════════════════════════╝' },
        { t: 'out', text: 'KEY: 4f8a2b9c1e7d3f6a0b5c8d2e4f1a9b3c' },
        { t: 'suc', text: '🏆 Chave obtida! Fase 2 concluída.' },
      ],
      xp: 70,
    },
    {
      phase: 'FASE 3 — AVANÇADO', icon: '📡', title: 'MONITORANDO PROCESSOS',
      desc: 'Verifique processos em execução para detectar softwares de monitoramento.',
      objective: 'Liste todos os processos em execução',
      command: 'tasklist',
      learn: '<strong>tasklist</strong> lista processos ativos (equivalente ao ps aux). PowerShell: <strong>Get-Process</strong>.',
      hint: 'tasklist',
      simulate: () => [
        { t: 'out', text: 'Image Name              PID  Mem Usage' },
        { t: 'out', text: '====================== ==== ==========' },
        { t: 'out', text: 'svchost.exe             892    8.412 K' },
        { t: 'out', text: 'SecurityMonitor.exe    1341   12.048 K' },
        { t: 'out', text: 'LogWatcher.exe         1342    6.128 K' },
        { t: 'warn', text: '⚠ SecurityMonitor.exe detectado (PID 1341)!' },
      ],
      xp: 70,
    },
    {
      phase: 'FASE 3 — AVANÇADO', icon: '🔎', title: 'FILTRAGEM DE LOGS',
      desc: 'Filtre logs.txt para linhas com "ERRO" usando findstr.',
      objective: 'Busque "ERRO" em logs.txt',
      command: 'findstr "ERRO" logs.txt',
      learn: '<strong>findstr</strong> é o grep do Windows. Flags: <strong>/i</strong> ignora maiúsculas, <strong>/n</strong> mostra linha.',
      hint: 'findstr "ERRO" logs.txt',
      simulate: () => [
        { t: 'out', text: 'logs.txt:47: [ERRO] Acesso nao autorizado: 192.168.1.99' },
        { t: 'out', text: 'logs.txt:83: [ERRO] Falha de autenticacao para "Administrator"' },
        { t: 'out', text: 'logs.txt:91: [ERRO] chave.key acessada — permissao modificada' },
        { t: 'warn', text: '⚠ Sua ação foi registrada!' },
      ],
      xp: 80,
    },
    {
      phase: 'FASE 3 — AVANÇADO', icon: '⚡', title: 'O PODER DO PIPE',
      desc: 'Filtre o tasklist para mostrar apenas processos com "Security" no nome.',
      objective: 'Filtre processos com "Security" no nome',
      command: 'tasklist | findstr "Security"',
      learn: 'O pipe <strong>|</strong> funciona no CMD. No PowerShell passa objetos reais, não só texto.',
      hint: 'tasklist | findstr "Security"',
      simulate: () => [
        { t: 'out', text: 'SecurityMonitor.exe    1341 Console   1    12.048 K' },
        { t: 'suc', text: '✓ Pipe executado. Processo isolado.' },
      ],
      xp: 90,
    },
    {
      phase: 'FASE 3 — AVANÇADO', icon: '🕵️', title: 'BUSCA RECURSIVA',
      desc: 'Busque recursivamente todos os arquivos .enc.',
      objective: 'Encontre todos arquivos .enc no sistema',
      command: 'dir /s /b *.enc',
      learn: '<strong>dir /s</strong> busca recursivamente. <strong>/b</strong> mostra apenas caminhos (bare). Combinar: dir /s /b *.enc.',
      hint: 'dir /s /b *.enc',
      simulate: () => [
        { t: 'out', text: 'C:\\Users\\Infiltrado\\secret\\arquivo_criptografado.enc' },
        { t: 'out', text: 'C:\\Windows\\Temp\\backup_sistema.enc' },
        { t: 'out', text: 'C:\\ProgramData\\phantom\\dados.enc' },
        { t: 'suc', text: '🎯 3 arquivos .enc encontrados.' },
      ],
      xp: 100,
    },
    {
      phase: 'FASE 3 — AVANÇADO', icon: '🔬', title: 'CONTANDO EVIDÊNCIAS',
      desc: 'Conte quantas linhas de ERRO existem nos logs.',
      objective: 'Conte as linhas com "ERRO" em logs.txt',
      command: 'findstr /c:"ERRO" logs.txt',
      learn: '<strong>findstr /c:"string"</strong> conta ocorrências. Alt: <strong>findstr "ERRO" logs.txt | find /c /v ""</strong>.',
      hint: 'findstr /c:"ERRO" logs.txt',
      simulate: () => [
        { t: 'out', text: 'logs.txt:3' },
        { t: 'suc', text: '✓ 3 entradas de erro. Relatório completo.' },
      ],
      xp: 80,
    },
    {
      phase: 'FASE 3 — AVANÇADO', icon: '🏴‍☠️', title: 'MISSÃO FINAL',
      desc: 'Leia o arquivo .enc e filtre apenas a linha "PHANTOM" via pipe.',
      objective: 'Exiba apenas a linha "PHANTOM" do arquivo .enc',
      command: 'type arquivo_criptografado.enc | findstr "PHANTOM"',
      learn: 'Parabéns! Próximos passos: <strong>PowerShell</strong>, <strong>WMI/CIM</strong> e certificação CompTIA Security+.',
      hint: 'type arquivo_criptografado.enc | findstr "PHANTOM"',
      simulate: () => [
        { t: 'out', text: '>>> PHANTOM ENCRYPTED PAYLOAD — OPERATION COMPLETE <<<' },
        { t: 'out', text: '' },
        { t: 'suc', text: '╔══════════════════════════════════════════╗' },
        { t: 'suc', text: '║  🏆 OPERAÇÃO PHANTOM KEY — CONCLUÍDA!  ║' },
        { t: 'suc', text: '╚══════════════════════════════════════════╝' },
      ],
      xp: 150,
    },
  ],
};

// ─── ACHIEVEMENTS ──────────────────────────────────
const ACHIEVEMENTS = [
  { id: 'first_blood', icon: '🩸', name: 'Primeiro Sangue', desc: 'Execute seu primeiro comando correto.' },
  { id: 'no_hints_3', icon: '🧠', name: 'Sem Treinamento', desc: 'Complete 3 missões sem usar dicas.' },
  { id: 'phase2', icon: '🔓', name: 'Escalada de Rank', desc: 'Alcance a Fase 2: Intermediário.' },
  { id: 'phase3', icon: '🚀', name: 'Operativo Elite', desc: 'Alcance a Fase 3: Avançado.' },
  { id: 'pipe_master', icon: '⚡', name: 'Mestre do Pipe', desc: 'Use pipe em um comando.' },
  { id: 'xp_500', icon: '💎', name: 'Colecionador de XP', desc: 'Acumule 500 XP ou mais.' },
  { id: 'persistent', icon: '🔄', name: 'Persistência', desc: 'Tente 5+ vezes numa missão.' },
  { id: 'complete', icon: '🏆', name: 'Mestre do Terminal', desc: 'Complete todas as missões.' },
];

const RANKING_DATA = [
  { name: 'Ph4ntom_X', rank: 'MESTRE', xp: 3420 },
  { name: 'NullB1te', rank: 'ELITE', xp: 2890 },
  { name: 'Gr3yH4t', rank: 'FANTASMA', xp: 2650 },
  { name: 'Z3r0D4y', rank: 'ESPECIALISTA', xp: 2100 },
  { name: 'R00tkit_K', rank: 'HACKER', xp: 1750 },
];

const QUICK_REF = {
  linux: [{ cmd: 'pwd', desc: 'dir atual' }, { cmd: 'ls -la', desc: 'listar tudo' }, { cmd: 'cd X', desc: 'entrar' }, { cmd: 'cat', desc: 'ler arquivo' }, { cmd: 'grep', desc: 'buscar' }, { cmd: 'chmod', desc: 'permissões' }, { cmd: 'ps aux', desc: 'processos' }, { cmd: 'find', desc: 'buscar arquivo' }, { cmd: '| pipe', desc: 'encadear' }],
  windows: [{ cmd: 'cd', desc: 'dir atual' }, { cmd: 'dir /a', desc: 'listar tudo' }, { cmd: 'cd X', desc: 'entrar' }, { cmd: 'type', desc: 'ler arquivo' }, { cmd: 'findstr', desc: 'buscar' }, { cmd: 'icacls', desc: 'permissões' }, { cmd: 'tasklist', desc: 'processos' }, { cmd: 'dir /s', desc: 'busca recurs.' }, { cmd: '| pipe', desc: 'encadear' }],
};

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

function showOsScreen() {
  $('boot-screen').classList.remove('active');
  $('os-screen').style.display = 'flex';
  $('os-screen').classList.add('active');
}

// ─── OS SELECTION ──────────────────────────────────
function selectOS(os) {
  G.os = os;
  G.missionIndex = 0;
  G.xp = 0; G.level = 1;
  G.correct = 0; G.attempts = 0;
  G.unlockedAchievements = new Set();
  G.history = []; G.historyIdx = -1;

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
  const missions = MISSIONS[G.os];
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

  print(termState.prompt + ' ' + raw, 'cmd');
  input.value = '';
  setTimeout(updateCursor, 0);

  const m = MISSIONS[G.os][G.missionIndex];
  const norm = raw.replace(/\s+/g, ' ').trim().toLowerCase();
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
  const strip = s => s.replace(/['"]/g, '').replace(/\s+/g, ' ').trim();
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
  const isLast = G.missionIndex >= MISSIONS[G.os].length - 1;
  $('mc-subtitle').textContent = m.title;
  $('mc-xp').textContent = '+' + xp + ' XP';
  $('mc-next-btn').style.display = isLast ? 'none' : 'block';
  $('mc-finish-btn').style.display = isLast ? 'block' : 'none';
  const ov = $('mission-complete-overlay');
  ov.style.display = 'flex';
  ov.classList.add('open');
}

function nextMission() {
  const ov = $('mission-complete-overlay');
  ov.style.display = 'none';
  ov.classList.remove('open');
  G.missionIndex++;
  loadMission();
}

// ─── ACHIEVEMENTS ──────────────────────────────────
function unlockAchievement(id) {
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
  Object.assign(G, { os: null, missionIndex: 0, xp: 0, level: 1, correct: 0, attempts: 0, hintShown: false, failCount: 0, unlockedAchievements: new Set(), history: [], historyIdx: -1 });
  termState.cwd = '~'; termState.prompt = 'infiltrado@server:~$';
  $('os-screen').style.display = 'flex';
  $('os-screen').classList.add('active');
}

function clearTerminal() {
  $('terminal-output').innerHTML = '';
  focusInput();
}

// ─── KICK OFF ──────────────────────────────────────
boot();
