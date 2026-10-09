# Fotei Studio

Projeto completo do site Fotei Studio, com React, JavaScript, CSS, GSAP e esbuild. Inclui a identidade visual em creme e dourado, ensaios fotográficos, gestão de redes sociais, planos, formulário e envio da mensagem pelo WhatsApp.

## Abrir no VS Code

1. Instale o Node.js 22 ou superior, que inclui o npm.
2. Extraia este ZIP.
3. No VS Code, use **Arquivo → Abrir Pasta** e selecione a pasta `fotei-studio` que contém `package.json`.
4. Abra **Terminal → Novo Terminal** e execute:

```sh
npm ci
npm run dev
```

5. Abra **http://localhost:5173** no navegador. Mantenha o terminal em execução.

Ao salvar alterações em `src/` ou `public/`, o projeto será reconstruído automaticamente. Atualize a página no navegador para ver o resultado. Use **Ctrl+C** para encerrar.

Não abra `dist/index.html` diretamente por duplo clique: o site utiliza caminhos de arquivos que dependem de um servidor HTTP.

## Onde editar

| Arquivo ou pasta         | Conteúdo                                                   |
| ------------------------ | ---------------------------------------------------------- |
| `src/App.jsx`            | Seções, textos, serviços, planos, formulário e animações   |
| `src/style.css`          | Cores, tipografia, layout e comportamento em telas menores |
| `src/whatsapp.js`        | Número do WhatsApp e link com a mensagem preenchida        |
| `src/date-validation.js` | Máscara dd/mm/aaaa e validação de datas                    |
| `src/client.jsx`         | Inicialização do React no navegador                        |
| `src/render.jsx`         | Renderização inicial do site                               |
| `public/assets/`         | Imagens e fontes incluídas no projeto                      |
| `public/credits.html`    | Créditos das imagens e fontes                              |
| `build.mjs`              | Compilação e metadados do site                             |
| `scripts/dev.mjs`        | Servidor de desenvolvimento local                          |
| `tests/`                 | Testes de formato e validade das datas                     |
| `dist/`                  | Site compilado, pronto para hospedagem estática            |

O WhatsApp configurado é **+55 11 95876-6351**. O link abre a conversa com a mensagem pronta; o visitante confirma o envio no WhatsApp.

Edite os arquivos de `src/` e `public/`, pois `dist/` é gerado novamente durante a compilação.

## Compilar e testar

```sh
npm run build
npm test
```

## Indentação

O projeto usa Prettier com dois espaços por nível de indentação. Para formatar todos os arquivos ou conferir a formatação:

```sh
npm run format
npm run format:check
```

A compilação também mantém os arquivos de `dist/` formatados, incluindo o HTML e o JavaScript.

A compilação gera a pasta `dist/`. Os testes verificam datas inexistentes, anos bissextos, formato brasileiro e preservação da data na mensagem.

## Publicar na Vercel

Envie este projeto para um repositório seu e importe-o na Vercel. Configure:

- Framework preset: **Other**.
- Build command: **npm run build**.
- Output directory: **dist**.
- Install command: **npm ci**.

Referência: [Configuração de build da Vercel](https://vercel.com/docs/builds/configure-a-build).

O projeto é estático e não precisa de variáveis de ambiente. A hospedagem atual do Fotei continua independente desta cópia; alterações locais não são publicadas automaticamente nela.

## Conteúdo deste pacote

Inclui código-fonte, imagens, fontes locais, testes, arquivos de configuração e a versão compilada. As dependências serão instaladas com `npm ci`; `node_modules`, credenciais e o histórico Git não são incluídos.

As imagens ilustrativas não representam um portfólio real de trabalhos. Consulte `public/credits.html` para os créditos e referências dos recursos utilizados.
