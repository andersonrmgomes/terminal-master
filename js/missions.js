window.GameData = {};
window.GameData.MISSIONS = {
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

window.GameData.ACHIEVEMENTS = [
  { id: 'first_blood', icon: '🩸', name: 'Primeiro Sangue', desc: 'Execute seu primeiro comando correto.' },
  { id: 'no_hints_3', icon: '🧠', name: 'Sem Treinamento', desc: 'Complete 3 missões sem usar dicas.' },
  { id: 'phase2', icon: '🔓', name: 'Escalada de Rank', desc: 'Alcance a Fase 2: Intermediário.' },
  { id: 'phase3', icon: '🚀', name: 'Operativo Elite', desc: 'Alcance a Fase 3: Avançado.' },
  { id: 'pipe_master', icon: '⚡', name: 'Mestre do Pipe', desc: 'Use pipe em um comando.' },
  { id: 'xp_500', icon: '💎', name: 'Colecionador de XP', desc: 'Acumule 500 XP ou mais.' },
  { id: 'persistent', icon: '🔄', name: 'Persistência', desc: 'Tente 5+ vezes numa missão.' },
  { id: 'complete', icon: '🏆', name: 'Mestre do Terminal', desc: 'Complete todas as missões.' },
];

window.GameData.RANKING_DATA = [
  { name: 'Ph4ntom_X', rank: 'MESTRE', xp: 3420 },
  { name: 'NullB1te', rank: 'ELITE', xp: 2890 },
  { name: 'Gr3yH4t', rank: 'FANTASMA', xp: 2650 },
  { name: 'Z3r0D4y', rank: 'ESPECIALISTA', xp: 2100 },
  { name: 'R00tkit_K', rank: 'HACKER', xp: 1750 },
];

window.GameData.QUICK_REF = {
  linux: [{ cmd: 'pwd', desc: 'dir atual' }, { cmd: 'ls -la', desc: 'listar tudo' }, { cmd: 'cd X', desc: 'entrar' }, { cmd: 'cat', desc: 'ler arquivo' }, { cmd: 'grep', desc: 'buscar' }, { cmd: 'chmod', desc: 'permissões' }, { cmd: 'ps aux', desc: 'processos' }, { cmd: 'find', desc: 'buscar arquivo' }, { cmd: '| pipe', desc: 'encadear' }, { cmd: 'exit', desc: 'voltar ao menu' }, { cmd: 'restart', desc: 'recarregar missão' }],
  windows: [{ cmd: 'cd', desc: 'dir atual' }, { cmd: 'dir /a', desc: 'listar tudo' }, { cmd: 'cd X', desc: 'entrar' }, { cmd: 'type', desc: 'ler arquivo' }, { cmd: 'findstr', desc: 'buscar' }, { cmd: 'icacls', desc: 'permissões' }, { cmd: 'tasklist', desc: 'processos' }, { cmd: 'dir /s', desc: 'busca recurs.' }, { cmd: '| pipe', desc: 'encadear' }, { cmd: 'exit', desc: 'voltar ao menu' }, { cmd: 'restart', desc: 'recarregar missão' }],
};


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
      { t: 'out', text: '00-1B-44-11-3A-B7   \Device\Tcpip_{01F700DB...}' },
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
