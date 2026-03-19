# 🖥️ TERMINAL::MASTER — Hacking Protocol

> Aprenda comandos de terminal através de uma narrativa de hacking ético gamificada, dentro de um autêntico Desktop Environment interativo.

![Version](https://img.shields.io/badge/versão-3.1.7-00ff41?style=flat-square&labelColor=0d1117)
![OS](https://img.shields.io/badge/suporte-Linux%20%7C%20Windows-00d4ff?style=flat-square&labelColor=0d1117)
![License](https://img.shields.io/badge/licença-MIT-ffd700?style=flat-square&labelColor=0d1117)

---

## 📖 Sobre o Projeto

**TERMINAL::MASTER** é uma aplicação web educacional de página única (SPA) que ensina comandos reais de terminal — Bash/Linux e CMD/Windows — através de missões narrativas gamificadas.

O usuário assume o papel do agente **GHOST**, infiltrado em um servidor para recuperar arquivos da **Operação Phantom Key**. Cada missão exige um comando específico, e o sistema simula respostas reais do terminal para criar uma experiência autêntica de aprendizado.

### Por que aprender assim?

- **Contexto real:** cada comando é apresentado dentro de uma situação que justifica seu uso
- **Feedback imediato:** o terminal simula saídas reais, erros e permissões
- **Progressão gradual:** do básico (`pwd`, `ls`) ao avançado (`grep`, `find`, pipes)
- **Exploração livre:** comandos fora da missão também funcionam — o simulador responde de forma inteligente

---

## 🎮 Experiência de Jogo

### Fluxo completo

```
Boot Screen → GRUB Bootloader → Desktop Environment → Terminal Window → Missões
```

### 1. Boot Screen
Sequência de inicialização animada simulando um kernel Linux carregando com logs em tempo real.

### 2. GRUB Bootloader
Tela autêntica do bootloader GNU GRUB com timer de contagem regressiva. Selecione o sistema operacional com as setas ↑↓ e Enter (ou clique com o mouse).

### 3. Desktop Environment
Após o boot, um ambiente de área de trabalho completo é carregado:
- **Wallpaper** temático por OS — verde escuro para Linux, azul para Windows
- **Ícones de pasta** arrastáveis representando cada trilha de missões
- **Taskbar** com relógio, XP atual e rank em tempo real
- **Duplo clique** em uma pasta abre o terminal flutuante

### 4. Terminal Flutuante (Window Manager)
O terminal é uma janela real com:
- **Titlebar** com três dots funcionais (fechar 🔴, minimizar 🟡, maximizar 🟢)
- **Drag & drop** pela barra de título
- **Redimensionamento** pelo canto inferior direito
- **Minimizar** para a taskbar e restaurar com um clique

---

## 📚 Conteúdo Educacional

### Trilha Linux (Bash) — 16 missões

| Fase | Missões | Comandos ensinados |
|------|---------|-------------------|
| **Básico** | 4 | `pwd`, `ls -la`, `cd`, `ls` |
| **Intermediário** | 6 | `cat`, `mkdir`, `echo >`, `ls -l`, `chmod`, `cat` |
| **Avançado** | 6 | `ps aux`, `grep`, pipe `\|`, `find`, `grep -c`, pipe composto |

### Trilha Windows (CMD) — 16 missões

| Fase | Missões | Comandos ensinados |
|------|---------|-------------------|
| **Básico** | 4 | `cd`, `dir /a`, `cd secret`, `dir` |
| **Intermediário** | 6 | `type`, `mkdir`, `echo >`, `icacls`, `icacls /grant`, `type` |
| **Avançado** | 6 | `tasklist`, `findstr`, pipe `\|`, `dir /s /b`, `findstr /c:`, pipe composto |

### Simulador Inteligente de Comandos

Comandos fora da missão são simulados com saídas reais e **não penalizam** o jogador:

**Linux:** `pwd`, `ls`, `ls -la`, `cd`, `cat`, `echo`, `mkdir`, `touch`, `rm`, `chmod`, `ps`, `grep`, `find`, `wc`, `clear`, `history`, `whoami`, `uname`, `date`, `man`

**Windows:** `cd`, `dir`, `type`, `echo`, `mkdir`, `tasklist`, `findstr`, `icacls`, `cls`, `whoami`, `ver`, `date`

**Pipes** funcionam livremente — `ps aux | grep admin`, `cat logs.txt | grep ERRO | wc -l`, `tasklist | findstr Security`, etc.

O sistema de arquivos virtual é dinâmico: novos arquivos e pastas aparecem conforme o progresso nas missões.

---

## 🏆 Sistema de Gamificação

### XP e Níveis

| Nível | Nome | XP |
|-------|------|----|
| 1 | ROOKIE | 0 |
| 2 | INFILTRADO | 100 |
| 3 | EXPLORADOR | 250 |
| 4 | HACKER | 450 |
| 5 | ESPECIALISTA | 700 |
| 6 | ELITE | 1.000 |
| 7 | FANTASMA | 1.400 |
| 8 | MESTRE | 1.900+ |

Completar uma missão sem usar dicas concede **+20% de XP bônus**.

### Conquistas

| Ícone | Nome | Condição |
|-------|------|----------|
| 🩸 | Primeiro Sangue | Primeiro comando correto |
| 🧠 | Sem Treinamento | 3 missões consecutivas sem dicas |
| 🔓 | Escalada de Rank | Alcançar a Fase 2 |
| 🚀 | Operativo Elite | Alcançar a Fase 3 |
| ⚡ | Mestre do Pipe | Usar o operador pipe `\|` |
| 💎 | Colecionador de XP | Acumular 500 XP |
| 🔄 | Persistência | Tentar 5+ vezes numa missão |
| 🏆 | Mestre do Terminal | Completar todas as missões |

### Persistência automática
O progresso é salvo no `localStorage` — XP, nível, conquistas e missões completadas por trilha sobrevivem ao fechar a aba. O botão **REBOOT ⚡** no desktop reseta tudo e retorna ao GRUB.

---

## 🚀 Como Usar

### GitHub Pages (recomendado)

```bash
# 1. Fork ou clone o repositório
git clone https://github.com/seu-usuario/terminal-master.git

# 2. Vá em Settings → Pages → Branch: main → Save
# 3. Acesse: https://seu-usuario.github.io/terminal-master
```

### Localmente

```bash
cd terminal-master

# Python
python3 -m http.server 8080

# Node.js
npx serve .

# VS Code
# Instale a extensão "Live Server" e clique em "Go Live"
```

Nenhum build, bundler ou instalação necessária — HTML, CSS e JS puros.

---

## 🗂️ Estrutura do Projeto

```
terminal-master/
├── index.html            # Todas as telas: boot, GRUB, desktop, janelas, overlays
├── css/
│   └── style.css         # Tema cyberpunk, desktop environment, window manager
└── js/
    ├── main.js           # Lógica principal completa
    └── missions.js       # Dados de missões, conquistas, ranking e referência rápida
```

### Arquitetura interna (`main.js`)

```
AudioEngine       — sons procedurais via Web Audio API
Boot              — sequência de inicialização animada
GRUB              — bootloader interativo com navegação por teclado/mouse
Desktop           — área de trabalho com ícones, wallpaper e taskbar
Window Manager    — janelas flutuantes (drag, resize, minimize, maximize)
Terminal          — input com cursor preciso, histórico (↑↓), tab-complete
Free Simulator    — engine de simulação inteligente de comandos livres
Pipe Simulator    — encadeamento de comandos via |
File System DB    — sistema de arquivos virtual sensível ao progresso
Game Logic        — missões, XP, níveis, conquistas, save/load
```

---

## ⌨️ Referência de Atalhos

Dentro do terminal:

| Comando / Tecla | Ação |
|-----------------|------|
| `help` | Lista todos os comandos disponíveis |
| `clear` / `cls` | Limpa a tela |
| `history` | Exibe histórico de comandos da sessão |
| `exit` / `menu` | Fecha a janela e volta ao desktop |
| `restart` / `reset` | Reinicia o progresso da trilha atual |
| `↑` / `↓` | Navega pelo histórico de comandos |
| `Tab` | Autocompleta nomes de arquivos |
| `Enter` | Na tela de missão completa: avança |
| `Esc` | Fecha overlays abertos |

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Uso |
|------------|-----|
| HTML5 / Canvas | Estrutura, Matrix Rain animado |
| CSS3 | Grid, animações, backdrop-filter, variáveis |
| JavaScript ES6+ | Toda a lógica — sem frameworks |
| Web Audio API | Sons procedurais (keypress, sucesso, erro) |
| localStorage | Persistência de progresso entre sessões |
| Google Fonts | Fira Code, Orbitron, Inter |

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Algumas ideias de expansão:

- **Novas trilhas:** Redes (`ping`, `traceroute`, `ss`), SysAdmin (`htop`, `df`, `useradd`), Web Server (`curl`, `nginx`, `systemctl`)
- **Novos comandos** no simulador livre
- **Temas visuais** alternativos (Solarized, Dracula, Nord)
- **Suporte touch** para mobile

```bash
git clone https://github.com/seu-usuario/terminal-master
git checkout -b feature/minha-contribuicao
# ... suas alterações em js/missions.js ou js/main.js
git commit -m "feat: descrição da mudança"
git push origin feature/minha-contribuicao
# Abra um Pull Request
```

---

## 📄 Licença

Distribuído sob a licença MIT. Veja o arquivo `LICENSE` para mais informações.

---

<div align="center">

**Feito para quem quer dominar o terminal de verdade.**

`infiltrado@server:~$` _

</div>