# TERMINAL::MASTER

**Terminal Master** é um simulador educativo gamificado imersivo que roda nativamente no seu navegador, criado para ensinar de forma prática o uso de comandos reais de **Sistemas Unix (Linux)** e **Windows (CMD/PowerShell)**. Através de uma interface cyberpunk altamente responsiva, o usuário é convocado a operar o console durante missões de pentest e resolução de crises em servidores corporativos.

## 🚀 Funcionalidades Principais

- **Hub Central (Mosaico)**: Navegue através de coleções de missões num layout em grid fluido e adaptativo que empilha cartões baseando-se no tamanho da sua tela.
- **Multitrilhas de Especialidade**:
    - **Hacking e Reconhecimento**: Penetração de rede, quebra de partições codificadas sob algoritmos e evasão de monitoramento processual no Linux e Windows.
    - **Administrador de Redes**: Detecção e rastreamento de nós de falha simulando `ss -tuln`, `ipconfig_all / nmcli`, arp spoofing detection e manipulações DNS (`dig +short`).
    - **Engenharia de Servidores Web**: Manutenção pesada de logs pesados `du -sh` / `tail -f`, isolamento de tráfego usando regras iptables e análise processual no `htop` seguidas por manobras reais usando Editores Visuais integrados do Console (Nano/Vi).
- **Motor de Áudio Cyberpunk**: Efeitos sonoros processados pelo *Web Audio API* — feedbacks sem latência ou grandes downloads MP3 (Cria os tons, beeps e ruidos nativamente pelo browser).
- **Parser de Comandos Inteligente**:
    - Tecla `TAB` autocompleta nomes de arquivo relativos dinamicamente baseando-se num histórico fake e no seu comando inicial (`cd` / `cat`).
    - Feedbacks operacionais fidedignos (`bash: ...` vs `... não reconhecido pelo CMD`).
    - Simulações que interpretam Pipes (`|`).
- **Data Save (LocalStorage)**: Todas as evoluções (Level, XP, índice que você parou da missão atual) são presas no disco interno do browser. O comando `exit` interage salvando em tempo real o ambiente para continuar o *track* depois.
- **Atalhos Operacionais (Quick Ref)**: A função `help` traz um dicionário em overlay do sistema escolhido, enquanto o `restart` zera a missão isolada em caso de soft lock.

## 🛠️ Tecnologias Utilizadas

- **HTML5 e CSS3 (Vanilla)**: Layout Mosaico robusto (UI Flex-Box base) erguido do lado negro sem o carregamento extra atrelado à Frameworks CSS ou JS, viabilizando animações puras para simular Monitores Tubo/VHS.
- **EcmaScript 2024 / Native JS**: Todos os engines que alimentam a leitura de bash, persistência, interpretação das fases gamificadas e osciladores sonoros habitam um par de arquivos com tempo recorde de compilação sem pacotes NPM de terceiros pesados envolvidos.

## 📥 Como Executar (Plug & Play)

Este projeto foi forjado como uma **Single Page Application estática** construída no Client-Side.

1. Clone ou Extraia/Baixe as pastas deste repositório num diretório virgem do seu sistema desktop ou celular.
2. Expanda os blocos.
3. Acione duplo clique em `index.html` ou arraste-o para a interface nativa de browsers modernos limpos (Firefox, Chrome, Sarafi ou Edge).
4. O Engine assumirá o topo! 
*(Opcionalmente, hospedar temporariamente com servidore estático Node.Js via Live Server ou `python -m http.server 8000` resolve quaisquer bloqueios agressivos de CORS em navegadores como Chromium puro).*

## 📜 Licenciamento Intelectual e Comercial

Distribuído e salvaguardado pelo formato de permissão padrão **[MIT](LICENSE)**. Este software suporta livre cópia adaptacional comercial e intelectual por entidades educativas e modificações pessoais desde que a credencial seja atrelada conforme o README primário.