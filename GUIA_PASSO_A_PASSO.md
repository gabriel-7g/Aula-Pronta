# LOUSA / AULAPRONTA — Apresentação da tela de login

## Objetivo
Este é um projeto **separado** do repositório `gabriel-7g/aulapronta-app`.
Ele reproduz a aparência da tela original Lousa com React, Ionic, TypeScript e CSS.
O backend foi refeito em TypeScript + Node.js + Express, com SQL PostgreSQL direto
(mais simples para apresentar do que o Prisma 8 experimental do repositório).
O login é funcional: `POST /api/auth/login` -> PostgreSQL -> `bcrypt.compare` -> token JWT.
A página pós-login é só uma confirmação de acesso; as funcionalidades de planejamento de aulas
não fazem parte desta entrega. Nada aqui faz push, commit ou muda o GitHub.

## 1) Instalar as ferramentas (Windows 10/11)

1. Instale o **Visual Studio Code**: https://code.visualstudio.com/
2. Instale o **Node.js LTS**: https://nodejs.org/ (use Node >= 22.12; a versão 24 LTS é adequada).
   Feche/reabra o VS Code depois da instalação. O npm acompanha o Node.
3. No VS Code: **Terminal > Novo Terminal**, confirme:

   ```powershell
   node -v
   npm -v
   ```

4. Instale o Ionic CLI globalmente:

   ```powershell
   npm install -g @ionic/cli
   ionic --version
   ```

   Você só precisa instalar o CLI uma vez. O projeto frontend já contém
   as dependências Ionic/React listadas em `frontend/package.json`.
5. Instale **PostgreSQL** com **pgAdmin 4** (marque ambos no instalador):
   https://www.postgresql.org/download/windows/
   - Mantenha a porta padrão **5432**.
   - Crie/guarde a senha do usuário `postgres` (será usada no `.env`).
   - O Stack Builder é opcional; não é necessário neste projeto.
6. Se quiser verificar o VS Code: instale extensões opcionais **ESLint** e **Prettier**.

> Para estudar COMO COMEÇAR do zero com o Ionic, o comando oficial para um projeto vazio é:
>
> `ionic start meu-projeto blank --type react --no-git`
>
> **Não execute esse comando dentro da pasta deste ZIP:** este frontend já é um projeto Ionic pronto. Você apenas abrirá a pasta e executará `npm install`.

## 2) Abrir a pasta no VS Code

1. Extraia `lousa-login-apresentacao.zip` em uma pasta como `Documentos\lousa-login-apresentacao`.
2. Em VS Code, selecione **Arquivo > Abrir Pasta**, escolhendo `lousa-login-apresentacao`.
3. Certifique-se de ver as pastas `frontend`, `backend` e `database`.
4. O terminal aberto na raiz terá uma linha semelhante a `PS C:\Users\...\lousa-login-apresentacao>`.

## 3) Criar o banco no pgAdmin

1. Abra **pgAdmin 4** e conecte-se ao PostgreSQL com a senha definida na instalação.
2. À esquerda expanda **Servers > PostgreSQL > Databases**.
3. Clique com botão direito em **Databases > Create > Database...**.
4. Em **Database**, digite exatamente `lousa_login` e clique **Save**.
   Alternativa: com o banco `postgres` selecionado, abra Query Tool e execute
   o arquivo `database/00_criar_banco.sql` (somente uma vez).
5. Clique em `lousa_login` para SELECIONAR ESSE BANCO. Acesse **Tools > Query Tool**.
6. Abra ou cole o conteúdo do arquivo `database/01_criar_tabelas.sql`,
   clique em **Execute/▶**. Isso criará a tabela `usuarios` e índice de e-mail.
7. Para visualizar a tabela: atualize o painel e abra **Schemas > public > Tables > usuarios**.
8. **Não digite INSERT com senhas comuns no SQL:** as senhas terão hash bcrypt
   pelo comando seed do backend no passo 5.

### Explicando a tabela ao professor

- `id`: identificador UUID exclusivo do usuário, criado automaticamente.
- `nome`: nome exibido depois do login.
- `email`: único para cada usuário, usado para localizar sua conta.
- `senha`: armazena o **hash criptográfico bcrypt**, nunca a senha original.
- `tipo`: `admin` ou `usuario`, para definir o destino após o login.
- `criado_em`: data e hora do cadastro.

## 4) Configurar o backend

No terminal do VS Code, a partir da pasta raiz:

```powershell
cd backend
Copy-Item .env.example .env
npm install
```

Abra o arquivo `backend/.env` (ele é criado pelo comando de cópia).

**É obrigatório editar pelo menos estas entradas:**

```env
DATABASE_URL=postgresql://postgres:SUA_SENHA_POSTGRES@localhost:5432/lousa_login
JWT_SECRET=COLE_AQUI_UMA_CHAVE_ALEATORIA_LONGA
```

- Troque `SUA_SENHA_POSTGRES` pela senha real do usuário `postgres`.
- Caso a senha do PostgreSQL tenha caracteres como `@`, `#`, `:` ou `/`,
  eles devem ser codificados no formato URL (por exemplo `@` vira `%40`).
- Para gerar uma chave JWT realmente aleatória, no terminal execute:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Copie os 64 caracteres mostrados e substitua o valor de `JWT_SECRET`.

Ainda no `.env`, há seis variáveis opcionais com nomes e senhas fictícias:
`SEED_ADMIN_NAME`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`,
`SEED_USER_NAME`, `SEED_USER_EMAIL`, `SEED_USER_PASSWORD`.
**Troque as duas senhas fictícias antes do seed**. Elas podem ter de 8 a 72 bytes.
Guarde quais senhas escolheu; vai digitá-las no login. Nunca envie `.env` ao GitHub.

## 5) Criar usuários de demonstração (seed)

Ainda dentro de `backend`, execute:

```powershell
npm run seed
```

Resultado esperado:

```text
Conta admin pronta: admin@lousa.local
Conta usuario pronta: professor@lousa.local
Cadastros concluídos. Teste o login pelo navegador.
```

O seed usa `bcrypt.hash(senha, 12)` para armazenar as senhas com hash no PostgreSQL.
Você pode executar novamente para atualizar as mesmas contas. Para verificar no pgAdmin,
abra o `database/02_consultar_usuarios.sql` e execute na base `lousa_login`.

## 6) Iniciar a API (backend)

Ainda no terminal dentro da pasta `backend`:

```powershell
npm run dev
```

Mantenha **esse terminal aberto**. Ele deverá exibir:

```text
API Lousa disponível em http://localhost:3000
```

Em um navegador, visite:
**http://localhost:3000/api/health**

Se banco estiver acessível, deve aparecer:

```json
{"status":"online","banco":"conectado"}
```

Se vier `banco: desconectado`, confirme que o PostgreSQL está iniciado,
que o banco `lousa_login` existe e que `DATABASE_URL` tem usuário/senha corretos.

## 7) Instalar e abrir o frontend Ionic

Abra um **SEGUNDO terminal** no VS Code (Terminal > Novo Terminal).
A partir da **raiz do projeto**, execute:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Isso iniciará o Vite em **http://localhost:8100/**.

Abra o endereço. Você verá a mesma tela com cartão bege/branco da Lousa:
"bem-vindo de volta", "Entre na sua conta", e campos E-mail/Senha.

- Login de professor: `professor@lousa.local` + a senha que você escolheu no `.env`.
- Login de admin: `admin@lousa.local` + a senha que você escolheu no `.env`.
- **Senha incorreta:** aparece uma mensagem de erro.
- **Senha correta:** aparece uma página de confirmação com nome, e-mail e tipo da conta.
- **Sair / Voltar ao login:** limpa a sessão no navegador.

> Se usar `ionic serve` dentro de `frontend`, o Ionic CLI poderá controlar a execução,
> mas, para manter a porta `8100` igual à configuração dos arquivos, prefira `npm run dev`.

## 8) Entendendo cada arquivo (ordem para explicar)

```text
lousa-login-apresentacao/
├── GUIA_PASSO_A_PASSO.md
├── database/
│   ├── 00_criar_banco.sql          # opcional: SQL para criar o banco
│   ├── 01_criar_tabelas.sql        # tabela usuarios
│   └── 02_consultar_usuarios.sql   # consulta de teste
├── backend/
│   ├── .env.example                # modelo de configuração
│   ├── package.json                # bibliotecas Node
│   ├── tsconfig.json               # configuração TypeScript
│   └── src/
│       ├── config.ts               # lê e valida variáveis .env
│       ├── db.ts                   # conexão com PostgreSQL (pg)
│       ├── seed.ts                 # cria admin e professor com bcrypt
│       ├── server.ts               # prepara Express, CORS e rotas
│       ├── routes/authRoutes.ts    # POST /login e GET /me
│       ├── controllers/authController.ts  # recebe e valida requisição
│       ├── services/authService.ts # consulta SQL, bcrypt, JWT
│       └── middlewares/autenticar.ts # protege rotas verificando JWT
└── frontend/
    ├── .env.example               # URL de acesso à API
    ├── ionic.config.json          # Ionic React com Vite
    ├── index.html                 # HTML base e fontes
    ├── package.json               # bibliotecas React/Ionic
    ├── vite.config.ts             # Vite na porta 8100
    └── src/
        ├── main.tsx               # ponto de entrada React
        ├── App.tsx                # configura Ionic e navegação
        ├── theme/variables.css    # variáveis visuais Ionic
        ├── services/auth.ts       # envia POST e guarda sessão
        └── pages/
            ├── Login.tsx          # JSX: interface e lógica do formulário
            ├── Auth.css           # estilo original da tela Lousa
            ├── AreaLogada.tsx     # confirmação: sucesso do login
            └── AreaLogada.css     # estilo da confirmação
```

`node_modules` e `dist` são **gerados automaticamente** pelo npm/Vite. Não crie manualmente.
O arquivo `.env` também é individual: copie o modelo e edite.

## 9) Fluxo completo, do clique ao banco

```text
Pessoa digita e-mail e senha no Login.tsx
  ↓ clicar "Entrar"
frontend/src/services/auth.ts
  ↓ fetch POST http://localhost:3000/api/auth/login
backend/src/routes/authRoutes.ts
  ↓ rota chama authController.login
backend/src/controllers/authController.ts
  ↓ checa campos / formato básico
backend/src/services/authService.ts
  ↓ SELECT ... WHERE LOWER(email) = $1
Banco PostgreSQL: tabela usuarios
  ↓ retorna dados e hash da senha
bcrypt.compare(senha_digitada, hash_salvo)
  ├─ falso -> HTTP 401 + "E-mail ou senha inválidos."
  └─ verdadeiro -> gera JWT com validade de 8h
                 ↓ HTTP 200 {token, usuario}
frontend/src/services/auth.ts
  ↓ sessionStorage salva token + usuario
Login.tsx
  ├─ usuario tipo admin -> /admin/usuarios
  └─ usuario tipo usuario -> /planejamentos
  ↓
AreaLogada.tsx valida token chamando GET /api/auth/me
  ↓
Exibe "acesso autorizado!"
```

## 10) Testar a API manualmente (opcional)

Com o backend ligado, no PowerShell:

```powershell
$dados = @{ email = 'professor@lousa.local'; senha = 'A_SENHA_QUE_VOCE_ESCOLHEU' } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' -Method Post -ContentType 'application/json' -Body $dados
```

Você deverá receber um objeto com `token` e `usuario`, nunca a senha do banco.
Se usar a senha errada, a API responde HTTP **401**.

## 11) Problemas comuns

- **`node` ou `npm` não reconhecido**: instale Node LTS, feche/reabra o VS Code.
- **`ionic` não reconhecido**: rode `npm install -g @ionic/cli`, reabra terminal.
- **PowerShell bloqueia npm.ps1**: use o terminal **Prompt de Comando** no VS Code,
  ou chame `npm.cmd install` / `npm.cmd run dev`. Não precisa relaxar políticas globais.
- **`ECONNREFUSED 5432`**: servidor PostgreSQL parado ou porta incorreta.
- **`password authentication failed for user postgres`**: senha do DATABASE_URL incorreta.
- **`relation "usuarios" does not exist`**: faltou executar `01_criar_tabelas.sql` no banco `lousa_login`.
- **`JWT_SECRET precisa ter pelo menos 32 caracteres`**: coloque a chave aleatória no backend/.env.
- **"Não foi possível conectar ao servidor"**: execute `npm run dev` em `backend`; confira porta `3000`.
- **Erro CORS**: frontend deve estar em `http://localhost:8100` (e não outro endereço).
- **Porta 8100 em uso**: feche outros projetos; o Vite avisa o conflito.
- **Login falha mesmo após seed**: confirme a senha editada no `.env` e execute `npm run seed` outra vez.
- **A tela abre mas a fonte está diferente**: Google Fonts precisa de internet; há fontes alternativas.

## 12) Como apresentar ao professor (roteiro de 2 minutos)

> "A tela de login foi criada com Ionic e React usando TypeScript. O arquivo Login.tsx
> contém os campos e validações; o arquivo Auth.css cuida das cores, tamanho dos elementos
> e responsividade. Quando clico em Entrar, o frontend envia um POST para uma API feita
> com Node.js e Express. A API consulta o e-mail em uma tabela usuarios no PostgreSQL,
> e compara a senha digitada com o hash bcrypt. Se estiver correta, devolve um token JWT
> e os dados públicos do usuário; se estiver errada, devolve 401. O frontend identifica
> se a conta é de administrador ou professor e direciona para a tela correspondente.
> Finalmente, a rota /api/auth/me verifica o token antes de mostrar a confirmação.
> Nenhuma senha é devolvida ao navegador."

### Sequência de demonstração

1. Mostre a tabela no pgAdmin com `SELECT id, nome, email, tipo FROM usuarios`.
2. Mostre o CSS e o formulário em `frontend/src/pages/Login.tsx`.
3. Abra o browser e tente uma senha incorreta (mensagem de erro).
4. Faça login com o professor (mensagem de sucesso e tipo `usuario`).
5. Clique em "Sair" e entre com admin (tipo `admin`).
6. Mostre `backend/src/services/authService.ts`, onde estão consulta SQL, bcrypt e JWT.

## Segurança e escopo

- Ambiente educacional **local**. Não é uma implantação pública pronta para produção.
- Não há cadastro público, recuperação de senha nem páginas completas do aplicativo.
- O SQL usa parâmetros, para prevenir injeção.
- Senhas são armazenadas apenas como hash bcrypt.
- `JWT_SECRET`, senhas, arquivos `.env` e tokens **não devem ser enviados ao GitHub**.
- Sessão usa `sessionStorage` por simplicidade e validade JWT no servidor; sistemas de produção
  precisam também de HTTPS, política de revogação de tokens, gerenciamento de sessões e proteção contra XSS.

## Referências oficiais

- Documentação Ionic: https://ionicframework.com/docs/react/overview
- Instalação Ionic CLI: https://ionicframework.com/docs/intro/cli
- Documentação Vite: https://vite.dev/guide/
- PostgreSQL Windows: https://www.postgresql.org/download/windows/
- Código original, somente consulta: https://github.com/gabriel-7g/aulapronta-app
