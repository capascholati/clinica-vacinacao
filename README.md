# Sistema de Gestão — Clínica de Vacinação

## Módulo entregue nesta etapa: Autenticação & Perfis

Este é o primeiro módulo do sistema, conforme o roadmap aprovado no
`diagnostico-estrategico-clinica-vacinacao.pdf`. Ele cobre:

- Login com e-mail/senha (JWT access token + refresh token com rotação).
- Bloqueio temporário após tentativas de login falhas repetidas.
- Recuperação/redefinição de senha.
- Cadastro de usuários vinculado a um perfil.
- Perfis padrão (Administrador, Gestão, Aplicador, Recepção, Estoque).
- **Matriz de permissões editável em runtime** pelo Administrador — os
  perfis acima já vêm com permissões sugeridas, mas podem ser
  reconfiguradas depois do sistema em produção, como decidido.
- Log de auditoria (append-only) para login, criação de usuário, alteração
  de perfil/permissões e redefinição de senha.

Este módulo foi **testado de ponta a ponta** com PostgreSQL real: schema
aplicado, seed rodado, servidor no ar, e os seguintes fluxos validados via
requisições HTTP reais: login com senha errada/correta, `/auth/me`, refresh
token com rotação, criação de usuário com perfil "Recepção", login com esse
usuário, e bloqueio 403 correto ao tentar acessar uma rota que exige
permissão que o perfil não tem.

## Stack

- **Backend**: Node.js + Express + TypeScript + PostgreSQL, com o driver
  oficial `pg` (SQL puro, sem ORM).
- **Frontend**: React + TypeScript + Vite.
- **Senhas**: hashing com argon2 (nunca texto puro).

> **Nota sobre a escolha de `pg` em vez de um ORM (ex.: Prisma)**: optei por
> acesso direto via SQL porque ferramentas como o Prisma dependem de baixar
> um binário de engine de um servidor externo na primeira instalação — algo
> que falha em qualquer rede corporativa com proxy/whitelist restrito (foi
> exatamente o que aconteceu ao testar este módulo). SQL puro com `pg` não
> tem essa dependência externa, roda em qualquer lugar com `npm install`, e
> mantém o controle total das queries. O schema completo está documentado em
> `backend/sql/001_modulo1_auth.sql`, com nomes de tabela/coluna idênticos
> ao modelo apresentado no diagnóstico.

## Como rodar — Backend

Pré-requisito: PostgreSQL rodando localmente (ou apontando `DATABASE_URL`
para um banco na nuvem).

```bash
cd backend
cp .env.example .env
# edite o .env com sua string de conexão do PostgreSQL

npm install
psql "$DATABASE_URL" -f sql/001_modulo1_auth.sql      # cria as tabelas de autenticação
psql "$DATABASE_URL" -f sql/002_modulo2_estoque.sql    # cria as tabelas de estoque
npm run seed                                            # cria perfis, permissões e o usuário admin
npm run dev                                              # sobe o servidor em http://localhost:3333
```

O `npm run seed` imprime no terminal o e-mail e a senha inicial do usuário
Administrador — troque essa senha assim que possível (via
`/auth/redefinir-senha`).

## Como rodar — Frontend

```bash
cd frontend
npm install
npm run dev    # http://localhost:5173
```

## Endpoints principais (Módulo 1) — todos testados

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| POST | `/auth/login` | não | Login, retorna access + refresh token |
| POST | `/auth/refresh` | não | Renova o access token (com rotação do refresh) |
| POST | `/auth/logout` | sim | Revoga o refresh token da sessão |
| POST | `/auth/esqueci-senha` | não | Inicia fluxo de redefinição |
| POST | `/auth/redefinir-senha` | não | Conclui a redefinição com token |
| GET | `/auth/me` | sim | Dados do usuário autenticado |
| GET | `/usuarios` | `usuarios.visualizar` | Lista usuários |
| POST | `/usuarios` | `usuarios.gerenciar` | Cria usuário |
| PATCH | `/usuarios/:id/perfil` | `usuarios.gerenciar` | Troca o perfil de um usuário |
| DELETE | `/usuarios/:id` | `usuarios.gerenciar` | Inativa usuário (nunca exclui) |
| GET | `/usuarios/perfis/lista` | `usuarios.gerenciar_permissoes` | Lista perfis + permissões atuais |
| GET | `/usuarios/permissoes/catalogo` | `usuarios.gerenciar_permissoes` | Catálogo de permissões disponíveis |
| PUT | `/usuarios/perfis/:perfilId/permissoes` | `usuarios.gerenciar_permissoes` | Redefine as permissões de um perfil |

## Regras de negócio já aplicadas neste módulo

- Nunca há exclusão física de usuário — apenas inativação (`ativo = false`).
- Toda ação sensível (login, criação, alteração de permissão, redefinição
  de senha) gera um registro em `logs_auditoria`, nunca editado ou
  removido pela API — confirmado em teste real (login e login falho
  gravaram corretamente).
- Redefinir a senha revoga automaticamente todas as sessões ativas do
  usuário.
- Resposta de "esqueci minha senha" é sempre genérica, para não revelar
  se um e-mail está cadastrado.
- Permissões não ficam "congeladas" dentro do token — são checadas no
  banco a cada requisição, para que uma alteração de permissão feita pelo
  Administrador tenha efeito imediato, sem exigir novo login. Confirmado
  em teste: um usuário com perfil "Recepção" recebeu 403 ao tentar acessar
  uma rota exclusiva de "Administrador".

## Próximo módulo

Conforme o roadmap: **Estoque & Lotes** (vacinas, insumos, controle FEFO,
estoque negativo configurável por produto, reserva manual).

---

## Módulo entregue nesta etapa: Estoque & Lotes

Segundo módulo, construído sobre o Módulo 1. Cobre:

- Cadastro de fabricantes, fornecedores, vacinas e insumos.
- Lotes com validade, compartilhando a mesma estrutura entre vacina e
  insumo (decisão registrada no diagnóstico).
- **FEFO** (`GET /estoque/lotes/sugestao-fefo`): sugere quais lotes usar,
  em ordem de validade, para cobrir uma quantidade — nunca decide sozinho,
  apenas sugere (reserva/saída continuam sendo ações explícitas).
- **Reserva manual** (`POST /estoque/lotes/:id/reservar` /
  `/liberar-reserva`): a API expõe a ação; quem decide reservar é sempre
  um humano, como decidido.
- **Estoque negativo configurável por produto**: cada vacina/insumo tem
  `permite_estoque_negativo` (padrão `false`); saída que resultaria em
  negativo é bloqueada a menos que o produto permita — e quando permite,
  gera um evento de auditoria destacado (`ESTOQUE_NEGATIVO`).
- **Bloqueio de lote** (recall, dano físico, etc.) — lote bloqueado some
  automaticamente da sugestão FEFO e não pode receber saída/reserva, mas
  nunca é excluído.
- **Cadastro nunca vencido**: o sistema recusa cadastrar um lote com
  validade no passado.
- **Status visual** (`GET /estoque/status`) — implementa a lógica pedida
  no diagnóstico: 🟢 em estoque, 🟡 acabando, 🔴 faltante, ⚠️ negativo,
  🔵 em uso/reservado (indicador independente do status principal).
- **Alertas de validade** (`GET /estoque/alertas-validade`) — vencidos e
  vencendo em 30 dias.
- **Painel "abaixo do mínimo"** (`GET /estoque/abaixo-do-minimo`) — base
  do futuro módulo de Logística, que vai cruzar isso com a agenda futura.
- Histórico de movimentação por lote (`GET /estoque/lotes/:id/movimentacoes`),
  sempre com o usuário responsável.

Testado de ponta a ponta neste ambiente: criação de vacina/insumo, dois
lotes com validades diferentes, sugestão FEFO cobrindo a quantidade
corretamente entre os dois lotes, rejeição de lote vencido, reserva com
limite de disponibilidade respeitado, saída de estoque recalculando o
status (🟢→🟡 confirmado), bloqueio de estoque negativo para produto que
não permite, bloqueio manual de lote removendo-o do FEFO, e histórico de
movimentações gravado corretamente.

Frontend: tela `/estoque` lista os produtos com o status colorido.

### Próximo módulo
**Agenda** — vai consumir a reserva manual de estoque deste módulo
(reserva disparada por um humano a partir do agendamento, como decidido).

---

## Módulo entregue nesta etapa: Financeiro / Caixa

Fecha o núcleo funcional pedido (Cadastro, Estoque, Agenda, Clientes,
Financeiro/Caixa). Cobre:

- **Contas a receber**, vinculadas a cliente (e opcionalmente a um
  agendamento). Marcar como paga lança automaticamente uma entrada no
  caixa do dia, se houver um aberto.
- **Contas a pagar**, vinculadas a fornecedor. Marcar como paga lança
  saída no caixa do dia.
- **Caixa diário**: abrir com saldo inicial, lançar movimentos avulsos,
  fechar com cálculo automático do saldo final (saldo inicial + entradas
  − saídas). Um caixa por dia; não é possível lançar nada após o
  fechamento.
- **Alerta de inadimplência** (`GET /financeiro/inadimplentes`): lista
  clientes com pendência, sem bloquear nada — exatamente como decidido.
  Contas pendentes vencidas são marcadas `em_atraso` automaticamente
  quando esse endpoint é consultado.
- Forma de pagamento sempre manual, com as 4 opções decididas: `dinheiro`,
  `pix`, `cartao_maquininha`, `cartao_link`.

Testado de ponta a ponta: abertura de caixa, conta a receber paga via
PIX gerando entrada de R$150, conta a pagar de R$40 gerando saída, saldo
recalculado corretamente (100 + 150 − 40 = 210), fechamento de caixa
gravando o saldo final, bloqueio de lançamento após o fechamento, e
detecção automática de inadimplência para conta vencida.

Frontend: tela `/financeiro` com abertura/fechamento de caixa e lista de
contas a receber.

### Escopo desta etapa
A pedido, o desenvolvimento parou aqui para permitir testes do núcleo
funcional: **Cadastro (usuários/perfis), Estoque, Agenda, Clientes e
Financeiro/Caixa**. Os módulos restantes do roadmap (Aplicações — que
conecta estoque+agenda+financeiro num único evento —, WhatsApp,
Dashboard consolidado, Relatórios) ficam para a próxima etapa, após a
validação deste núcleo.
