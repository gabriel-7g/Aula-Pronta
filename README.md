# AulaPronta (Lousa) — Como instalar e executar no computador

> **Objetivo:** baixar a versão de apresentação semanal diretamente do GitHub e executar **frontend, backend e banco SQLite local** em outro computador Windows, sem usar o Supabase e sem instalar PostgreSQL.
>
> **Repositório desta apresentação:** https://github.com/gabriel-7g/Aula-Pronta  
> **Branch:** `master`. Este é o repositório **Aula-Pronta**, diferente do projeto original `aulapronta-app`.
>
> **Importante:** cada computador terá seu **próprio banco SQLite**. O GitHub guarda os códigos; o arquivo do banco e as senhas são gerados localmente no computador do professor.

## 1. Instalar os programas no computador do professor

Instale **antes** de tentar executar o projeto:

1. **Git para Windows** — https://git-scm.com/downloads/win
2. **Node.js 24 LTS** — https://nodejs.org/
3. **Visual Studio Code** — https://code.visualstudio.com/

É necessário ter internet para baixar o repositório e instalar as bibliotecas com npm. **Não precisa instalar PostgreSQL, pgAdmin, Supabase, SQLite separadamente nem Ionic CLI global.** React, Ionic, Express e outras bibliotecas são instalados pelo `npm ci`.

Depois de instalar, abra **PowerShell** ou o terminal do VS Code e verifique:

```powershell
git --version
node -v
npm -v
```

A versão recomendada do Node é **24.x**. Se algum comando não for reconhecido, feche e reabra o terminal (ou conclua a instalação do programa correspondente).

## 2. Baixar o projeto diretamente do GitHub

No **PowerShell**, entre na pasta onde deseja salvar o projeto, por exemplo a Área de Trabalho, e execute:

```powershell
cd "$env:USERPROFILE\Desktop"
git clone https://github.com/gabriel-7g/Aula-Pronta.git
cd Aula-Pronta
```

Se a Área de Trabalho do computador usar OneDrive ou estiver em outro local, entre na pasta desejada antes de executar `git clone`.

Depois abra essa pasta no VS Code usando **Arquivo → Abrir Pasta → Aula-Pronta**. Também é possível usar `code .` no terminal, caso o comando `code` esteja disponível.

**Conferência:** no Explorador do VS Code deverão aparecer as pastas:

```text
Aula-Pronta/
├── README.md
├── backend/
│   ├── .env.example
│   ├── package.json
│   └── src/
├── database/
│   └── 01_criar_tabelas.sql
└── frontend/
    ├── .env.example
    ├── package.json
    └── src/
```

O `backend/data/lousa.sqlite` **não virá do GitHub**: ele será criado no computador do professor pelo comando `npm run seed`.

## 3. Configurar e iniciar o backend (Terminal 1)

No VS Code, abra **Terminal → Novo Terminal**. Confirme que está na pasta `Aula-Pronta` e execute, um comando por vez:

```powershell
cd backend
npm ci
Copy-Item .env.example .env
```

Se `npm ci` apresentar erro devido ao lockfile, tente `npm install` dentro de `backend`.

### 3.1 Configurar o arquivo `backend/.env`

No Explorador do VS Code, abra **`backend/.env`** e **substitua todo o conteúdo** pelo modelo abaixo:

```dotenv
PORT=3000
FRONTEND_URL=http://127.0.0.1:8100

JWT_SECRET=SUBSTITUA_PELA_CHAVE_GERADA

SEED_ADMIN_NAME=Administrador
SEED_ADMIN_EMAIL=admin@lousa.local
SEED_ADMIN_PASSWORD=SenhaDeTesteAdmin2026!

SEED_USER_NAME=Professor
SEED_USER_EMAIL=professor@lousa.local
SEED_USER_PASSWORD=SenhaDeTesteProfessor2026!
```

Essas são **contas fictícias para demonstração local**. **Troque ambas as senhas por valores novos de teste antes de executar o seed** e anote-as para usar durante a apresentação.

**Atenção ao arquivo do GitHub:** o `backend/.env.example` publicado ainda menciona `DATABASE_URL` e PostgreSQL. Essa configuração é **antiga** e **não deve ser usada** para a versão SQLite. O arquivo `.env` deve ficar como no modelo acima, **sem `DATABASE_URL`**.

### 3.2 Gerar a chave JWT

Ainda no Terminal 1 (dentro de `backend`), execute:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Copie o valor exibido e substitua `SUBSTITUA_PELA_CHAVE_GERADA` em `backend/.env`. Salve com **Ctrl + S**.

**Nunca publique esse `.env` ou a chave JWT no GitHub.** A chave gerada neste computador deve ser diferente da utilizada no computador de desenvolvimento.

### 3.3 Criar o banco SQLite e os usuários

No mesmo terminal, execute:

```powershell
npm run seed
```

O resultado esperado é semelhante a:

```text
Banco SQLite conectado!
Usuário cadastrado: admin@lousa.local
Usuário cadastrado: professor@lousa.local
Banco local criado com sucesso!
```

Esse comando cria o arquivo **`backend/data/lousa.sqlite`** com a tabela `usuarios` e as duas contas fictícias. As senhas são armazenadas como hashes, não como texto legível no banco.

**Não é preciso executar os SQLs manualmente:** o backend lê `database/01_criar_tabelas.sql` ao iniciar. O arquivo `database/00_criar_banco.sql` pertence à versão antiga do PostgreSQL e **não deve ser executado**.

### 3.4 Iniciar o servidor Express

Execute:

```powershell
npm run dev
```

Resultado esperado:

```text
Banco SQLite conectado!
Servidor rodando em http://localhost:3000
```

**Mantenha esse Terminal 1 aberto.** No navegador do computador do professor, teste:

http://localhost:3000/api/health

Deverá aparecer algo como:

```json
{
  "status": "online",
  "banco": "conectado",
  "tipo": "SQLite local"
}
```

Se esse endereço não funcionar, confira o erro no Terminal 1 antes de continuar.

## 4. Configurar e iniciar o frontend (Terminal 2)

No VS Code, clique no botão **`+`** no painel Terminal para abrir **outro terminal**, mantendo o backend ligado.

Partindo da pasta principal `Aula-Pronta`, execute:

```powershell
cd frontend
npm ci
Copy-Item .env.example .env
```

Se o novo terminal abrir em outra pasta, navegue primeiro até `Aula-Pronta`. Se `npm ci` falhar por causa do lockfile, use `npm install` em `frontend`.

Abra **`frontend/.env`** e confira que o conteúdo é:

```dotenv
VITE_API_URL=http://localhost:3000
```

Agora inicie o React + Ionic:

```powershell
npm run dev
```

**Mantenha o Terminal 2 aberto.** Abra no navegador **exatamente**:

### http://127.0.0.1:8100

**Por que esse endereço?** O Vite publicado neste repositório está configurado para `127.0.0.1`, porta `8100`. Por isso configuramos `FRONTEND_URL=http://127.0.0.1:8100` no backend. Usar `localhost:8100` no navegador sem ajustar o `.env` pode causar erro de **CORS**.

O frontend acessa a API em `http://localhost:3000`. É normal as duas partes terem endereços/portas diferentes.

## 5. Entrar com os usuários de demonstração

Na tela inicial do Lousa, use as credenciais definidas no `backend/.env` do computador do professor:

| Conta | E-mail | Senha do modelo acima |
|---|---|---|
| Administrador | `admin@lousa.local` | `SenhaDeTesteAdmin2026!` |
| Professor | `professor@lousa.local` | `SenhaDeTesteProfessor2026!` |

Se alterou as senhas no `.env`, use as novas. Para atualizá-las no banco de **demonstração**, interrompa temporariamente o backend e execute, dentro de `backend`, `npm run seed` novamente; depois `npm run dev`.

**O que demonstrar ao professor:**

1. Entrar como **administrador** e confirmar o redirecionamento para `/admin/usuarios`.
2. Visualizar os professores cadastrados.
3. Tentar cadastrar um professor fictício e confirmar que ele aparece na lista.
4. Testar a exclusão desse professor de demonstração.
5. Sair e testar uma senha incorreta.
6. Entrar como **professor** e verificar seu acesso.

**Status dos testes:** o login do administrador, a API e o SQLite **já funcionaram no computador de desenvolvimento**. A lista, o cadastro e a exclusão da Semana 2 ainda precisam ser testados pelo navegador antes da apresentação. **O funcionamento no computador do professor só estará confirmado depois de repetir esse procedimento nele.**

## 6. Mostrar o banco SQLite (opcional)

Abra um **Terminal 3** no VS Code, entre em `Aula-Pronta/backend` e execute:

```powershell
node -e "const {DatabaseSync}=require('node:sqlite'); const db=new DatabaseSync('./data/lousa.sqlite'); console.table(db.prepare('SELECT nome,email,tipo,criado_em FROM usuarios').all()); db.close();"
```

O terminal exibirá os usuários do banco **sem mostrar as senhas nem seus hashes**. Para explicar a criação da tabela, abra `database/01_criar_tabelas.sql`.

## 7. Problemas comuns no computador do professor

| Problema | O que fazer |
|---|---|
| `git` não é reconhecido | Instale o Git para Windows e reabra o terminal. |
| `node` ou `npm` não é reconhecido | Instale Node.js 24 e reabra o terminal. |
| `ENOENT: package.json` | Confira se entrou na pasta `backend` ou `frontend` antes de executar `npm ci`. |
| `Configure JWT_SECRET` | Gere uma chave, coloque em `backend/.env`, salve e reinicie o backend. |
| `near "(": syntax error` | Abra `database/01_criar_tabelas.sql`: não pode ter comandos antigos de PostgreSQL como `gen_random_uuid()`. |
| `Não foi possível conectar ao servidor` | O backend deve estar ligado na porta 3000; teste `/api/health`. |
| Erro `CORS policy` | Abra o frontend em `http://127.0.0.1:8100` e confira `FRONTEND_URL=http://127.0.0.1:8100` no backend. Reinicie o backend. |
| `E-mail ou senha inválidos` | Use a senha do `.env` definida **antes** do último `npm run seed`. Rode o seed novamente apenas na base de teste, se necessário. |
| Porta 3000 ou 8100 ocupada | Pare outro processo que já use a porta; os endereços configurados precisam continuar coerentes. |
| `Cannot GET /` na API | A tela de login **não** fica na porta 3000; acesse `127.0.0.1:8100`. Para testar o backend, use `/api/health`. |
| `npm ci` falha | Execute `npm install` dentro da pasta correspondente e confira se a versão do Node é 24. |
| Tela branca ou erro em `/admin/usuarios` | Abra as ferramentas do navegador (`F12`) e confira Console/Network; valide se o backend segue ligado e o token foi gerado pelo login. |

**Se editar qualquer `.env`, salve e reinicie o respectivo `npm run dev`.** Em casos de dúvida, mantenha dois terminais visíveis: **Terminal 1 = backend**, **Terminal 2 = frontend**.

## 8. Atualizar o projeto do GitHub nas próximas semanas

No computador do professor, feche os servidores com `Ctrl + C` e, na pasta `Aula-Pronta`, execute:

```powershell
git pull origin master
```

Se o código trouxer novas dependências, entre novamente em `backend` e `frontend` e execute `npm ci` em cada pasta. **Não precisa clonar tudo de novo**.

> Se o professor tiver alterado o código localmente, salve/guarde essas alterações antes do `git pull`. Os arquivos locais `.env` e `backend/data/lousa.sqlite` devem permanecer fora do controle de versão.

## 9. Resumo para a apresentação

**Onde está cada parte:**

| Arquivo | Função |
|---|---|
| `frontend/src/pages/Login.tsx` | Interface de login (React/Ionic). |
| `frontend/src/pages/AdminUsuarios.tsx` | Tela de gerenciamento dos professores. |
| `frontend/src/pages/AdminUsuarios.css` | Visual da tela administrativa. |
| `frontend/src/services/auth.ts` | Envia os dados de login à API e mantém a sessão. |
| `frontend/src/App.tsx` | Rotas do frontend, incluindo `/admin/usuarios`. |
| `backend/src/server.ts` | Inicia o Express e registra as rotas. |
| `backend/src/routes/authRoutes.ts` | Rotas de login e perfil. |
| `backend/src/routes/usuarioRoutes.ts` | Rotas de listagem, cadastro e exclusão. |
| `backend/src/services/authService.ts` | Valida a senha bcrypt e gera o JWT. |
| `backend/src/db.ts` | Abre o SQLite e cria a tabela usando o SQL. |
| `backend/src/seed.ts` | Cadastra os usuários de teste. |
| `database/01_criar_tabelas.sql` | SQL de criação da tabela `usuarios`. |
| `backend/data/lousa.sqlite` | Banco local criado em cada computador. |

### Sequência rápida para lembrar

1. `git clone https://github.com/gabriel-7g/Aula-Pronta.git`
2. Backend: `npm ci` → configurar `.env` → `npm run seed` → `npm run dev`
3. Frontend: `npm ci` → configurar `.env` → `npm run dev`
4. Abrir **http://127.0.0.1:8100** e fazer login.

**Este README explica a instalação local no computador do professor. Ele não publica o projeto na internet e não depende do Supabase.**


---

**Observação para quem mantém o repositório:** o GitHub pode conter um arquivo incorretamente nomeado `README .md` (com espaço). O guia principal precisa ser salvo com o nome exato `README.md`, na raiz do repositório, para aparecer automaticamente na página inicial.
