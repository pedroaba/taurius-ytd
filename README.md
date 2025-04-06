# Taurius Youtube Video Downloader

Um aplicativo Electron com React e TypeScript para download de vídeos do YouTube de forma simples e rápida.

![Captura de tela do aplicativo](./resources/icon.png)

## Funcionalidades Atuais

- Download de vídeos do YouTube em diferentes qualidades
- Download apenas do áudio em formato MP3
- Interface amigável e intuitiva
- Visualização do vídeo antes de fazer o download
- Exibição do progresso de download em tempo real

## Funcionalidades Futuras

- Escolha de formato personalizado
- Download da melhor qualidade de vídeo e áudio, com posterior mesclagem
- Opção de escolher qualidade não máxima no formato personalizado
- Possibilidade de escolher o local de salvamento dos downloads

## Configuração do Ambiente de Desenvolvimento

### IDE Recomendada

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

### Instalação de Dependências

```bash
$ pnpm install
```

### Desenvolvimento

```bash
$ pnpm dev
```

### Compilação

```bash
# Para Windows
$ pnpm build:win

# Para macOS
$ pnpm build:mac

# Para Linux
$ pnpm build:linux
```

## Tecnologias Utilizadas

- Electron
- React
- TypeScript
- TailwindCSS
- ytdl-core
- Radix UI

## Como Usar

1. Abra o aplicativo
2. Cole o link do vídeo do YouTube na caixa de pesquisa
3. Clique em "Buscar"
4. Selecione a qualidade desejada
5. Clique em "Baixar vídeo" ou "Baixar em MP3"
