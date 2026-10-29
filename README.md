# AulaPronta / Lousa — Demonstração local para o professor

> **Projeto didático, executado inteiramente no computador.** Esta pasta é a versão de desenvolvimento usada nas apresentações semanais. **Não depende do Supabase** e não altera o projeto original hospedado no GitHub.
>
> **Situação em 29/10/2026:** login de administrador, API Express e SQLite local já foram testados com sucesso. O gerenciamento de professores (listar, cadastrar e excluir) foi preparado na etapa seguinte e deve ser testado antes da demonstração.

## 1. Tecnologias

| Camada | Tecnologia | Responsabilidade |
|---|---|---|
| Frontend | React + Ionic + TypeScript + Vite | Tela de login e interface de administração |
| Backend | Node.js + Express + TypeScript | API, autenticação e regras de acesso |
| Banco local | SQLite via `node:sqlite` | Armazenar os usuários em `backend/data/lousa.sqlite` |
| Segurança | bcryptjs + JWT | Hash das senhas e autenticação por token |

**Não é necessário instalar PostgreSQL, pgAdmin, SQLite Server ou conectar-se ao Supabase.** O banco SQLite é criado por um script do próprio projeto.

## 2. Executar em outro computador (por exemplo, no PC do professor)

### 2.1 O que instalar uma única vez

- **Node.js 24** (recomendado), disponível em https://nodejs.org/ — confirme com `node -v` e `npm -v` no PowerShell.
- **VS Code**, opcional para executar, mas útil para apresentar os arquivos: https://code.visualstudio.com/.
- **Conexão com a internet** na primeira instalação das dependências (`npm install`). Depois, o teste local não exige conexão com o Supabase.

O Ionic CLI global **não é obrigatório** para executar este projeto: `npm run dev` usa os scripts definidos em cada `package.json`.

### 2.2 Copiar os arquivos para o computador do professor

1. No computador em que o projeto foi desenvolvido, abra a pasta `lousa-login-apresentacao`.
2. Copie a pasta para um pendrive, uma pasta compartilhada ou outro meio **sem precisar compactá-la em ZIP**.
3. Preserve a estrutura com **`backend/`, `frontend/` e `database/` lado a lado**. A pasta `database/` é indispensável: o backend lê `database/01_criar_tabelas.sql` ao iniciar.
4. **Não inclua** `backend/.env`, `frontend/.env`, `backend/data/`, `node_modules/` ou `dist/` na cópia distribuída ao professor. Os arquivos `.env` contêm configuração privada, e `backend/data/` pode conter dados locais. O banco de demonstração será criado novamente no outro computador.
5. Abra a pasta copiada no VS Code do professor: **Arquivo → Abrir Pasta**.

Estrutura esperada:

```text
lousa-login-apresentacao/
├── README.md
├── RELATORIO_SEMANA_02.md
├── database/
│   └── 01_criar_tabelas.sql
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── src/
│   │   ├── db.ts
│   │   ├── seed.ts
│   │   ├── server.ts
│   │   ├── config.ts
│   │   ├── routes/
│   │   ├── services/
│   │   ├── controllers/
│   │   └── middlewares/
│   └── data/                 ← criada automaticamente
└── frontend/
    ├── .env.example
    ├── package.json
    ├── index.html
    ├── vite.config.ts
    └── src/
        ├── App.tsx
        ├── pages/
        └── services/
```

### 2.3 Configurar e executar o backend

No **Terminal 1** do VS Code (PowerShell), partindo da pasta principal:

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

> Se `.env` já existir, **não substitua inadvertidamente**: edite o arquivo existente. Se houver um `package-lock.json` íntegro, pode-se usar `npm ci` no lugar de `npm install` para instalar precisamente as versões travadas.

Abra `backend/.env` e preencha os campos com valores **novos, exclusivos da demonstração**:

```dotenv
PORT=3000
FRONTEND_URL=http://localhost:8100
JWT_SECRET=COLE_AQUI_A_CHAVE_GERADA
SEED_ADMIN_NAME=Administrador
SEED_ADMIN_EMAIL=admin@lousa.local
SEED_ADMIN_PASSWORD=ESCOLHA_UMA_SENHA_FORTE_DE_TESTE
SEED_USER_NAME=Professor
SEED_USER_EMAIL=professor@lousa.local
SEED_USER_PASSWORD=ESCOLHA_OUTRA_SENHA_FORTE_DE_TESTE
```

**Gere o `JWT_SECRET` em vez de utilizar o texto do exemplo:**

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Cole o resultado em `JWT_SECRET`. Não compartilhe esse valor. As senhas do seed precisam ter pelo menos 8 caracteres; use valores apenas de demonstração, sem reutilizar senhas pessoais.

No Terminal 1, ainda em `backend`:

```powershell
npm run seed
npm run dev
```

- `npm run seed` cria o banco SQLite e cadastra (ou atualiza) as contas de demonstração.
- `npm run dev` inicia a API em `http://localhost:3000`.
- **Deixe este terminal aberto** durante a apresentação.
- Não execute `npm run seed` repetidamente em um banco que já contenha usuários reais: ele redefine os dados/senhas das contas configuradas no `.env`.

### 2.4 Configurar e executar o frontend

Abra o **Terminal 2** usando o botão `+` no painel Terminal do VS Code. Partindo da pasta principal:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
```

No arquivo `frontend/.env`, confirme:

```dotenv
VITE_API_URL=http://localhost:3000
```

Inicie:

```powershell
npm run dev
```

Abra no navegador: **http://localhost:8100**.

**Dica importante:** use exatamente `http://localhost:8100` na barra de endereços. Apesar de `127.0.0.1` apontar para o mesmo PC, `http://127.0.0.1:8100` é uma origem diferente para o navegador e pode provocar bloqueio de CORS se o backend autorizar apenas `http://localhost:8100`.

Se precisar usar outro endereço ou porta, ajuste `FRONTEND_URL` em `backend/.env` para a **origem exata do frontend**, e `VITE_API_URL` em `frontend/.env` para a **URL exata da API**. Reinicie os respectivos servidores após mudar os `.env`.

### 2.5 Testar em poucos minutos

1. **Saúde do backend:** acesse http://localhost:3000/api/health. Resposta esperada:

   ```json
   { "status": "online", "banco": "conectado", "tipo": "SQLite local" }
   ```

2. **Tela do login:** acesse http://localhost:8100 e entre usando `admin@lousa.local` e a senha escolhida em `SEED_ADMIN_PASSWORD`.
3. **Redirecionamento:** ao autenticar o administrador, a aplicação deve navegar para `/admin/usuarios`.
4. **Logout:** use o botão Sair e confirme o retorno à tela de login.
5. **Conta de professor:** teste com `professor@lousa.local` e sua própria senha de demonstração.
6. **Credenciais inválidas:** tente uma senha errada; a API deve rejeitar o acesso.
7. **Gerenciamento (etapa em validação):** se os arquivos `usuarioRoutes.ts`, `AdminUsuarios.tsx` e `AdminUsuarios.css` estiverem integrados, testar lista, cadastro, exclusão e bloqueio de usuário comum. **Não apresentar como concluído antes de funcionar no navegador.**

### 2.6 Mostrar o banco de dados ao professor

No **Terminal 3**, dentro de `backend`, execute o comando abaixo. Ele mostra somente os campos públicos da tabela e **não exibe hashes de senha**:

```powershell
node -e "const {DatabaseSync}=require('node:sqlite'); const db=new DatabaseSync('./data/lousa.sqlite'); console.table(db.prepare('SELECT nome,email,tipo,criado_em FROM usuarios').all()); db.close();"
```

Se quiser mostrar o SQL que cria a tabela, abra `database/01_criar_tabelas.sql` no VS Code. SQLite é um banco relacional que usa SQL, mas o armazenamento é local, dentro do arquivo `backend/data/lousa.sqlite`.

## 3. Arquitetura da aplicação

```text
Navegador (http://localhost:8100)
       │
       │ React / Ionic envia requisições HTTP
       ▼
API Express (http://localhost:3000)
       │
       ├── POST /api/auth/login   → conferir senha bcrypt e emitir JWT
       ├── GET  /api/auth/me      → validar sessão
       ├── GET  /api/health       → verificar banco
       └── /api/usuarios         → funções do administrador (etapa 2)
                                      │
                                      ▼
                           backend/data/lousa.sqlite
```

### Endpoints da etapa 2 (quando integrados)

| Método | Rota | Descrição | Autorização |
|---|---|---|---|
| GET | `/api/usuarios` | Listar usuários | JWT de administrador |
| POST | `/api/usuarios` | Cadastrar professor | JWT de administrador |
| DELETE | `/api/usuarios/:id` | Excluir professor | JWT de administrador |

A exclusão deve impedir remover o próprio administrador e outras contas administrativas. O backend deve consultar o banco para confirmar que o portador do token ainda é administrador.

## 4. Problemas comuns

| Sintoma | Verificação / solução |
|---|---|
| `Cannot GET /` | Indica que não existe uma rota `/`; use `/api/health` para testar a API. Se a rota `/` foi criada, deve responder normalmente. |
| `Não foi possível conectar ao servidor` | Confirme que o backend está iniciado, que `VITE_API_URL` usa a porta 3000 e que não há erro de CORS. |
| `CORS policy` | Abra a tela por `http://localhost:8100` ou ajuste `FRONTEND_URL` para a origem efetiva; reinicie backend e frontend. |
| `Configure JWT_SECRET` | Gere uma chave aleatória e configure-a em `backend/.env` (não no frontend). |
| `E-mail ou senha inválidos` | Confira a senha configurada antes do último `npm run seed`; se necessário, execute o seed novamente **somente na base de teste**. |
| `ENOENT package.json` | Execute os comandos de instalação **dentro de `backend/` e `frontend/`**, sem criar pastas duplicadas. |
| `near "(": syntax error` | Certifique-se de que `database/01_criar_tabelas.sql` contém sintaxe SQLite, não funções PostgreSQL como `gen_random_uuid()`. |
| Porta 8100 ocupada | Pare outro Vite que esteja usando essa porta; confirme também a porta em `vite.config.ts`. |
| `npm` não reconhecido | Instale Node.js 24 e reabra o terminal. |

## 5. Segurança e limites desta demonstração

- **Nunca entregue `.env`, token JWT, senha real ou arquivo de banco com informações pessoais.** Use apenas contas fictícias de teste.
- Se uma senha ou `JWT_SECRET` foi mostrado em conversa, apresentação ou captura de tela, **troque-o**. Na troca de senha de contas seed, rode `npm run seed` novamente na base de teste.
- **Não coloque valores secretos em `VITE_*`**: variáveis desse prefixo são expostas ao código do frontend pelo Vite.
- Execute esta versão de apresentação **localmente no computador do professor**, não aberta na internet pública.
- O projeto original (GitHub/Supabase) permanece separado e não é alterado por estes passos.

## 6. Relatório semanal e próximo desenvolvimento

Consulte também [`RELATORIO_SEMANA_02.md`](./RELATORIO_SEMANA_02.md), com a divisão entre **backend, SQL e frontend**, o que foi comprovado em execução, o que está em validação nesta semana e a proposta para a próxima entrega.

### Fontes técnicas

- Node.js e SQLite integrado: https://nodejs.org/download/release/latest-v24.x/docs/api/sqlite.html
- Vite e variáveis de ambiente: https://vite.dev/guide/env-and-mode
- npm e instalação reproduzível: https://docs.npmjs.com/cli/commands/npm-ci/
