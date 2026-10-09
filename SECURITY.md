# Segurança

Relate vulnerabilidades em privado pela aba **Security → Report a vulnerability** do repositório, quando habilitada. Não publique credenciais nem dados de clientes em issues. Se esse canal não estiver disponível, peça ao mantenedor um canal privado antes de compartilhar detalhes.

Este projeto é um site estático. O formulário prepara uma mensagem localmente e abre o WhatsApp mediante ação do visitante; não armazena dados em banco nem envia mensagens automaticamente. Não há autenticação, consultas SQL ou API de pagamentos neste código.

## Verificação

```sh
npm ci
npm run lint:security
npm run audit:security
npm test
npm run format:check
```

O GitHub Actions executa análise estática, auditoria das dependências, testes e busca de segredos. Dependabot propõe atualizações semanais. Regras de análise estática são complementares à revisão: os avisos genéricos de índices dinâmicos e caminhos de arquivos foram desativados porque esses pontos foram revisados e os caminhos têm testes de travessia e links simbólicos.

## Hospedagem

O servidor de desenvolvimento aceita apenas conexões locais e não deve ser usado em produção. `vercel.json` configura os cabeçalhos de segurança na Vercel. Em outro provedor, replique esses cabeçalhos; Live Server não aplica esta configuração.

A CSP permite scripts apenas da própria origem e bloqueia frames, formulários nativos e conexões de rede por JavaScript. Estilos inline permanecem permitidos porque as animações GSAP alteram estilos. Isso limita a proteção de CSP para CSS; não permite scripts inline. HTTPS e a política HSTS dependem da hospedagem e devem ser verificados no domínio publicado.

## Configuração do GitHub

Após publicar, habilite alertas Dependabot, secret scanning/push protection e relatos privados de vulnerabilidades, conforme disponibilidade do plano. Proteja `main` com revisão de PR e aprovação dos checks `security` antes de merge. Essas configurações são da conta/repositório e não são ativadas apenas pela inclusão destes arquivos. CodeQL requer habilitação e disponibilidade do recurso no repositório.

Uma verificação sem achados não garante ausência de vulnerabilidades nem certificação de conformidade. Execute novamente os checks a cada alteração e verifique os cabeçalhos no ambiente de produção.
