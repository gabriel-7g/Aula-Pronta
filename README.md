# AulaPronta (Lousa) — Instalação e Execução do Projeto

O **AulaPronta** é um sistema de gerenciamento de planejamentos de aula desenvolvido com React, Ionic, Node.js, Express e SQLite.

O sistema permite que professores criem, organizem, consultem, editem e exportem seus planejamentos de aula, além de disponibilizar uma área administrativa para gerenciamento de usuários.

**Repositório:** https://github.com/gabriel-7g/Aula-Pronta

**Branch principal:** `master`

O projeto funciona localmente e não necessita de PostgreSQL, Supabase ou serviços externos de banco de dados.

Cada computador terá seu próprio banco SQLite, criado durante a configuração inicial.

---

## 1. Tecnologias utilizadas

| Camada | Tecnologias |
|---|---|
| Frontend | React, Ionic, TypeScript e Vite |
| Backend | Node.js, Express e TypeScript |
| Banco de dados | SQLite |
| Autenticação | JWT e bcryptjs |
| Exportação de documentos | jsPDF |
| Controle de versão | Git e GitHub |

## 2. Funcionalidades do sistema

O AulaPronta possui as seguintes funcionalidades:

### Autenticação e segurança

- Interface de login integrada à API.
- Autenticação de usuários com JWT.
- Validação de credenciais.
- Armazenamento de senhas utilizando hash.
- Diferenciação entre administradores e professores.
- Controle de permissões de acesso.
- Encerramento da sessão do usuário.

### Gerenciamento de professores

- Cadastro de novos professores.
- Listagem dos usuários cadastrados.
- Exclusão de professores.
- Área administrativa com acesso restrito.
- Armazenamento dos usuários no SQLite.

### Gerenciamento de planejamentos de aula

- Criação de novos planejamentos.
- Cadastro de título, disciplina, turma, objetivo, conteúdo, metodologia, duração e data da aula.
- Armazenamento dos planejamentos no SQLite.
- Vinculação de cada planejamento ao professor responsável.
- Consulta das aulas cadastradas.
- Edição de planejamentos existentes.
- Exclusão de planejamentos.
- Controle de acesso aos planejamentos por usuário.

### Organização e pesquisa

- Página específica para cadastrar e editar planejamentos.
- Página independente para visualizar aulas salvas.
- Pesquisa por título, disciplina ou turma.
- Filtro por disciplina.
- Visualização da quantidade de resultados encontrados.
- Limpeza dos filtros de pesquisa.
- Interface responsiva para diferentes tamanhos de tela.

### Exportação de planejamentos

- Exportação individual de planejamentos para PDF.
- Organização dos dados da aula no documento.
- Geração de documentos no formato A4.
- Download do PDF diretamente pelo navegador.
- Paginação automática para textos longos.

---

## 3. Requisitos para executar o projeto

Antes de iniciar, instale os seguintes programas no computador:

**Git para Windows**

https://git-scm.com/downloads/win

**Node.js 24 LTS**

https://nodejs.org/

**Visual Studio Code**

https://code.visualstudio.com/

É necessário ter conexão com a internet para baixar o repositório e instalar as dependências.

Não é necessário instalar PostgreSQL, pgAdmin, SQLite separadamente ou Ionic CLI globalmente.

Após instalar os programas, abra o PowerShell e execute:

```powershell
git --version
node -v
npm -v
```

Os comandos devem apresentar as versões instaladas.

Recomenda-se utilizar Node.js 24.x.

Caso algum comando não seja reconhecido, feche e abra novamente o terminal.

---

## 4. Baixar o projeto diretamente do GitHub

Abra o PowerShell e entre na pasta onde deseja salvar o projeto.

Por exemplo, para utilizar a Área de Trabalho:

```powershell
cd "$env:USERPROFILE\Desktop"
```

Se a Área de Trabalho estiver em outro caminho, como uma pasta do OneDrive, escolha uma pasta existente de sua preferência.

Baixe o repositório:

```powershell
git clone https://github.com/gabriel-7g/Aula-Pronta.git
```

Entre na pasta do projeto:

```powershell
cd Aula-Pronta
```

Abra o projeto no Visual Studio Code:

```powershell
code .
```

Caso o comando `code .` não funcione, abra o VS Code manualmente e selecione **Arquivo > Abrir Pasta > Aula-Pronta**.

O projeto estará disponível localmente após a clonagem.

---

## 5. Estrutura principal do projeto

```text
Aula-Pronta/
│
├── backend/
│   ├── src/
│   │   ├── db.ts
│   │   ├── seed.ts
│   │   ├── server.ts
│   │   ├── routes/
│   │   ├── middlewares/
│   │   └── services/
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
├── database/
│   ├── 01_criar_tabelas.sql
│   └── 03_criar_planejamentos.sql
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── AdminUsuarios.tsx
│   │   │   ├── Planejamentos.tsx
│   │   │   ├── Planejamentos.css
│   │   │   ├── PlanejamentosSalvos.tsx
│   │   │   └── PlanejamentosSalvos.css
│   │
│   │   ├── services/
│   │   │   ├── auth.ts
│   │   │   ├── planejamentos.ts
│   │   │   └── exportarPDF.ts
│   │
│   │   └── App.tsx
│   │
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
└── README.md
```

A estrutura acima considera os arquivos das funcionalidades atuais. Eles precisam estar publicados no GitHub para aparecerem após a clonagem.

As pastas `node_modules` são geradas durante a instalação das dependências.

O banco SQLite não é baixado do GitHub. Ele será criado no computador em que o sistema for executado.

---

## 6. Configurar e iniciar o backend

No VS Code, abra **Terminal > Novo Terminal**.

Confirme que está na pasta principal `Aula-Pronta`.

Entre no backend:

```powershell
cd backend
```

Instale as dependências:

```powershell
npm ci
```

Esse comando instalará as bibliotecas necessárias para executar o servidor.

Caso exista algum problema relacionado às dependências ou ao arquivo de lock, confira a versão do Node.js. Como alternativa, execute:

```powershell
npm install
```

### 6.1 Configurar as variáveis de ambiente

Ainda na pasta `backend`, execute:

```powershell
Copy-Item .env.example .env
```

O comando criará o arquivo `.env` a partir do modelo do projeto.

No VS Code, abra:

`backend/.env`

Substitua todo o conteúdo pelo modelo abaixo:

```dotenv
PORT=3000
FRONTEND_URL=http://127.0.0.1:8100

JWT_SECRET=SUBSTITUA_PELA_CHAVE_GERADA

SEED_ADMIN_NAME=Administrador
SEED_ADMIN_EMAIL=admin@lousa.local
SEED_ADMIN_PASSWORD=DefinaUmaSenhaAdmin2026

SEED_USER_NAME=Professor
SEED_USER_EMAIL=professor@lousa.local
SEED_USER_PASSWORD=DefinaUmaSenhaProfessor2026
```

As contas são utilizadas para testes locais. As senhas são exemplos e podem ser substituídas por outras de sua preferência.

**Importante:** o backend utiliza SQLite. Caso o `.env.example` contenha configurações antigas de PostgreSQL, como `DATABASE_URL`, elas não devem ser utilizadas.

### 6.2 Gerar a chave JWT

No terminal do backend, execute:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

O terminal apresentará uma chave aleatória.

Copie a chave gerada e substitua o valor:

```dotenv
JWT_SECRET=SUBSTITUA_PELA_CHAVE_GERADA
```

pelo valor correspondente.

Salve o arquivo com `Ctrl + S`.

O arquivo `.env` contém informações privadas e não deve ser publicado no GitHub.

### 6.3 Criar o banco SQLite e os usuários

No terminal do backend, execute:

```powershell
npm run seed
```

O resultado esperado será semelhante a:

```text
Banco SQLite conectado!
Tabelas de usuários e planejamentos verificadas!
Usuário cadastrado: admin@lousa.local
Usuário cadastrado: professor@lousa.local
Banco local criado com sucesso!
```

Esse comando cadastra os usuários definidos no `.env`.

Durante a inicialização, o backend também executa os scripts SQL responsáveis pela criação das tabelas do sistema.

O banco será armazenado em:

```text
backend/data/lousa.sqlite
```

As principais tabelas são:

| Tabela | Finalidade |
|---|---|
| `usuarios` | Armazena administradores e professores. |
| `planejamentos` | Armazena os planejamentos de aula vinculados aos professores. |

Não é necessário instalar o SQLite separadamente ou executar os arquivos SQL manualmente.

**Atenção:** executar `npm run seed` novamente pode redefinir as senhas das contas de demonstração. Evite utilizar esse comando desnecessariamente após começar a armazenar dados importantes.

### 6.4 Iniciar o servidor Express

No mesmo terminal, execute:

```powershell
npm run dev
```

O resultado esperado será semelhante a:

```text
Banco SQLite conectado!
Tabelas de usuários e planejamentos verificadas!
Servidor rodando em http://localhost:3000
```

**Mantenha esse terminal aberto.**

O backend permanecerá em execução enquanto o processo estiver ativo.

### 6.5 Verificar a API

Abra o navegador e acesse:

http://localhost:3000/api/health

O resultado esperado será semelhante a:

```json
{
  "status": "online",
  "banco": "conectado",
  "tipo": "SQLite local"
}
```

Essa resposta indica que o backend está funcionando e conseguiu consultar o banco de dados.

Se o endereço não funcionar, confira as mensagens apresentadas no terminal.

---

## 7. Configurar e iniciar o frontend

No VS Code, abra um **segundo terminal**.

Mantenha o terminal do backend aberto.

A partir da pasta principal `Aula-Pronta`, execute:

```powershell
cd frontend
```

Instale as dependências:

```powershell
npm ci
```

Esse comando instalará React, Ionic, Vite, TypeScript e as demais dependências registradas no projeto.

A biblioteca `jspdf` também será instalada automaticamente se estiver registrada nos arquivos `package.json` e `package-lock.json` publicados no GitHub.

Se ocorrer um erro de dependências, verifique a mensagem apresentada e confira a versão do Node.js. Quando necessário, utilize:

```powershell
npm install
```

### 7.1 Configurar as variáveis de ambiente

No terminal do frontend, execute:

```powershell
Copy-Item .env.example .env
```

Abra o arquivo:

`frontend/.env`

Confira se o conteúdo está assim:

```dotenv
VITE_API_URL=http://localhost:3000
```

Essa variável informa ao frontend o endereço utilizado para se comunicar com a API.

### 7.2 Iniciar o frontend

No terminal do frontend, execute:

```powershell
npm run dev
```

O Vite iniciará a aplicação React com Ionic.

**Mantenha esse segundo terminal aberto.**

No navegador, acesse:

http://127.0.0.1:8100

Esse é o endereço da aplicação AulaPronta.

Os serviços utilizam:

| Serviço | Endereço |
|---|---|
| Frontend | http://127.0.0.1:8100 |
| Backend | http://localhost:3000 |
| Verificação da API | http://localhost:3000/api/health |

O frontend e o backend utilizam portas diferentes porque são executados como processos independentes.

**Importante:** o endereço utilizado para abrir o frontend deve corresponder à variável `FRONTEND_URL` configurada no backend.

Abrir o sistema em outro endereço sem atualizar essa configuração poderá causar bloqueio de CORS.

---

## 8. Acessar o sistema

Na tela inicial do AulaPronta, utilize as contas cadastradas pelo comando `npm run seed`.

### Administrador

**E-mail:** `admin@lousa.local`

**Senha:** valor configurado em `SEED_ADMIN_PASSWORD`.

### Professor

**E-mail:** `professor@lousa.local`

**Senha:** valor configurado em `SEED_USER_PASSWORD`.

As senhas válidas serão aquelas utilizadas durante a última execução do comando `npm run seed`.

Caso o `.env` tenha sido alterado posteriormente, a senha no banco não será atualizada automaticamente.

O administrador possui acesso às funcionalidades de gerenciamento de professores.

O professor possui acesso às funcionalidades de criação e gerenciamento de planejamentos.

---

## 9. Utilização das funcionalidades

### Gerenciamento de professores

A área administrativa permite visualizar os usuários cadastrados, cadastrar novos professores e excluir contas permitidas pelo sistema.

O acesso é controlado pelo backend.

### Cadastro de planejamentos

O professor pode cadastrar um planejamento informando:

- Título da aula.
- Disciplina.
- Turma.
- Data da aula.
- Duração em minutos.
- Objetivo.
- Conteúdo programático.
- Metodologia.

Após salvar, o registro é armazenado no banco SQLite.

### Aulas salvas

A página de aulas salvas permite consultar os planejamentos cadastrados pelo professor.

Nela, estão disponíveis as funcionalidades de pesquisa, filtro por disciplina, edição e exclusão.

Os planejamentos permanecem armazenados no SQLite mesmo após fechar a aplicação, desde que o arquivo do banco seja preservado.

### Pesquisa e filtros

A pesquisa permite localizar aulas pelo título, disciplina ou turma.

O filtro por disciplina permite exibir somente os planejamentos correspondentes à opção selecionada.

É possível limpar os filtros e retornar à visualização completa.

### Edição e exclusão

Ao selecionar **Editar aula**, o sistema abre o formulário preenchido com os dados do planejamento existente.

Após salvar as alterações, os dados são atualizados no banco.

A exclusão exige confirmação antes de remover o planejamento.

### Exportação em PDF

O botão **Exportar PDF** permite gerar um documento com as informações da aula.

O documento inclui os dados do planejamento, com organização para impressão em formato A4.

O arquivo é disponibilizado para download diretamente pelo navegador.

### Endereços das páginas

| Página | Endereço |
|---|---|
| Login | `/login` |
| Gerenciamento de professores | `/admin/usuarios` |
| Criar planejamento | `/planejamentos` |
| Aulas salvas | `/planejamentos/salvos` |
| Editar planejamento | `/planejamentos?editar=ID` |

O identificador `ID` corresponde ao planejamento selecionado.

---

## 10. Consultar o banco de dados SQLite

O SQLite armazena os registros dos usuários e dos planejamentos.

Para visualizar os usuários cadastrados, abra um terminal na pasta `backend` e execute:

```powershell
node -e "const {DatabaseSync}=require('node:sqlite'); const db=new DatabaseSync('./data/lousa.sqlite'); console.table(db.prepare('SELECT nome,email,tipo,criado_em FROM usuarios').all()); db.close();"
```

O terminal exibirá os dados dos usuários sem mostrar suas senhas.

Para consultar os planejamentos cadastrados, execute:

```powershell
node -e "const {DatabaseSync}=require('node:sqlite'); const db=new DatabaseSync('./data/lousa.sqlite'); console.table(db.prepare('SELECT titulo,disciplina,turma,data_aula FROM planejamentos').all()); db.close();"
```

Esses comandos realizam apenas consultas e não alteram o banco de dados.

Os scripts de criação das tabelas estão localizados em:

`database/01_criar_tabelas.sql`

`database/03_criar_planejamentos.sql`

---

## 11. Problemas comuns

| Problema | Solução |
|---|---|
| `git` não é reconhecido | Instale o Git para Windows e reabra o terminal. |
| `node` ou `npm` não é reconhecido | Instale Node.js 24 e reabra o terminal. |
| `ENOENT: package.json` | Verifique se está na pasta `backend` ou `frontend`. |
| Erro em `JWT_SECRET` | Gere uma chave válida e configure `backend/.env`. |
| Erro de CORS | Confira `FRONTEND_URL` e abra o frontend em `http://127.0.0.1:8100`. |
| Não foi possível conectar ao servidor | Confirme que o backend está executando na porta 3000. |
| E-mail ou senha inválidos | Confira as credenciais utilizadas no último `npm run seed`. |
| Banco SQLite não encontrado | Execute a configuração inicial do backend. |
| `Cannot find module 'jspdf'` | Confira se a dependência foi publicada e execute `npm ci` no frontend. |
| Porta 3000 ou 8100 ocupada | Encerre outro processo que esteja utilizando a porta. |
| Tela branca | Verifique os erros no terminal e no console do navegador. |
| Tela desatualizada | Atualize utilizando `Ctrl + Shift + R`. |
| `npm ci` falha | Confira a versão do Node.js e os arquivos de dependências. |

Caso o PowerShell apresente erro de política de execução relacionado ao `npm.ps1`, utilize `npm.cmd` no lugar de `npm`.

Exemplo:

```powershell
npm.cmd ci
npm.cmd run dev
```

Se algum arquivo `.env` for alterado, salve as mudanças e reinicie o processo correspondente.

---

## 12. Atualizar o projeto pelo GitHub

Para atualizar o projeto após novas alterações no repositório, interrompa os servidores utilizando `Ctrl + C`.

Na pasta principal `Aula-Pronta`, execute:

```powershell
git pull origin master
```

Esse comando baixará as alterações mais recentes da branch principal.

Se houver atualizações nas dependências, execute `npm ci` novamente nas pastas `backend` e `frontend`.

Não é necessário clonar o repositório novamente.

**Importante:** se houver alterações locais no código, elas deverão ser preservadas ou resolvidas antes de executar o `git pull`.

Os arquivos `.env` e o banco SQLite local devem permanecer fora do controle de versão.

---

## 13. Executar o projeto novamente

Após a primeira instalação e configuração, não será necessário repetir todo o procedimento.

Basta abrir a pasta do projeto no VS Code e iniciar os dois serviços.

**Terminal 1 — Backend**

Na pasta `backend`:

```powershell
npm run dev
```

**Terminal 2 — Frontend**

Na pasta `frontend`:

```powershell
npm run dev
```

Depois, acesse:

http://127.0.0.1:8100

O banco SQLite continuará armazenando os dados anteriormente cadastrados.

---

## 14. Observações importantes

O AulaPronta é um projeto acadêmico executado localmente.

A aplicação utiliza um banco de dados SQLite próprio em cada computador. Por isso, os usuários e os planejamentos cadastrados em uma instalação não aparecem automaticamente em outra.

O GitHub disponibiliza o código-fonte do sistema, enquanto as configurações privadas e os registros locais permanecem no computador em que a aplicação foi configurada.

Para que todas as funcionalidades sejam instaladas corretamente em outro computador, é necessário que os arquivos do frontend, backend, banco de dados e dependências estejam atualizados na branch `master`.

---

**AulaPronta — Planejamentos mais simples. Aulas mais organizadas.**

Desenvolvido utilizando React, Ionic, TypeScript, Node.js, Express e SQLite.