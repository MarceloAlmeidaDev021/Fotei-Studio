# Revisão de segurança — 09/10/2026

## Resultado local

| Verificação                                                                   | Resultado                                                        |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Dependências (`npm audit`)                                                    | Zero vulnerabilidades conhecidas na consulta ao registro npm     |
| Análise estática (`eslint-plugin-security` e regras contra execução dinâmica) | Sem erros ou avisos nas regras habilitadas                       |
| Segredos nos arquivos (Gitleaks v8.30.1)                                      | Nenhum achado                                                    |
| Segredos no histórico Git (Gitleaks v8.30.1)                                  | Nenhum achado no histórico existente, de um commit               |
| Testes automatizados                                                          | 8 testes passaram, incluindo os casos de ataque descritos abaixo |
| Build e formatação                                                            | Compilação concluída; Prettier aprovado                          |

## Correções e casos de ataque

- Servidor local: aceita GET/HEAD, rejeita outros métodos e URLs com codificação inválida.
- Travessia de diretórios: testes com `..`, separadores codificados, barras invertidas, caminhos Windows e byte nulo não acessam arquivos fora de `dist/`.
- Links simbólicos/junctions: a resolução do caminho real bloqueia acesso a um arquivo fora da raiz pública.
- Arquivos internos: arquivos ocultos e extensões fora da lista pública são bloqueados.
- Cabeçalhos: CSP, bloqueio de frames, `nosniff`, política de referência e de permissões configurados no servidor local e em `vercel.json`; um teste garante equivalência.
- Formulário: validação rejeita tipos indevidos, entradas acima dos limites e planos desconhecidos.
- Injeção no link de WhatsApp: payload com HTML, parâmetros e fragmento permanece exclusivamente no parâmetro `text`, sem alterar o domínio nem o destinatário.

## Revisão manual e limites

Os dados do formulário são apresentados como texto pelo React. Não foram encontrados `dangerouslySetInnerHTML`, `innerHTML`, `eval` ou `new Function` no código da aplicação. A revisão desses pontos complementa a análise estática; não foi realizado teste de exploração de XSS em um navegador nesta rodada.

O projeto não possui banco, autenticação, sessão nem API que receba o formulário. SQL injection, CSRF de sessão e controles de autorização em APIs não têm um alvo nesse fluxo. O envio ao WhatsApp depende de ação do visitante.

As regras genéricas de índices dinâmicos e nomes de arquivos dinâmicos do ESLint estão desativadas e isso está documentado em `SECURITY.md`. O caminho público foi revisado e possui testes de ataque; o resultado do scanner não substitui essa revisão.

O escopo é o código deste repositório e o servidor estático local. Não foram testados o domínio de produção, configurações da conta, outros serviços, nem executados OWASP ZAP, Burp Suite ou um pentest independente. Não há certificação de conformidade ou garantia de ausência de vulnerabilidades.

## GitHub e hospedagem

O workflow `Security` executa testes, ESLint, npm audit e Gitleaks em arquivos e histórico. Também prepara CodeQL para repositórios públicos. O resultado remoto precisa ser confirmado no GitHub Actions; configurar o workflow não significa que CodeQL já passou.

As actions estão fixadas em hashes de commit verificados nos repositórios oficiais, com permissões mínimas e sem persistência de credenciais no checkout. Dependabot verifica npm e GitHub Actions semanalmente.

Proteção de branches, push protection, alertas e canal privado de vulnerabilidades dependem das configurações e permissões do repositório. Sua ativação não foi confirmada nesta revisão. HTTPS/HSTS e os cabeçalhos reais devem ser verificados após a publicação do site.

Referências: [OWASP CSP](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html), [OWASP HTTP Headers](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html), [segurança de GitHub Actions](https://docs.github.com/en/actions/reference/security/secure-use).
