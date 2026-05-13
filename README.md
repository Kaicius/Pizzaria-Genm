# Pizzaria Genm - Projeto Final AWC

Projeto de conclusão da disciplina de **Aplicações Web em Camadas**. A Pizzaria Genm é uma API REST robusta que gerencia desde o estoque de ingredientes e receitas técnicas até o ciclo de vida completo de um pedido, incluindo faturamento e automação de status.

---

## Tecnologias e Dependências

O projeto foi construído utilizando as seguintes tecnologias:

*   **Node.js**: Ambiente de execução Javascript.
*   **Express**: Framework para construção da API e roteamento.
*   **Prisma ORM**: Mapeamento objeto-relacional para interação com o banco de dados.
*   **MySQL**: Banco de dados relacional para persistência dos dados.
*   **JWT (jsonwebtoken)**: Autenticação baseada em tokens.
*   **Bcrypt**: Criptografia de senhas para segurança.
*   **Nodemailer**: Disparo de e-mails para recuperação de senha.
*   **OTP-Generator**: Geração de códigos temporários para reset de senha.
*   **Swagger UI Express**: Documentação interativa da API.
*   **Nodemon**: Servidor local

### Pré-requisitos
*   Node.js instalado.
*   Instância do MySQL rodando.

### Versões das bibliotecas
*   **@prisma/client**: 6.19.3
*   **bcrypt**: ^6.0.0
*   **cookie-parser**: ^1.4.7
*   **dotenv**: ^17.4.0
*   **express**: ^5.2.1
*   **jsonwebtoken**: ^9.0.3
*   **nodemailer**: ^8.0.7
*   **otp-generator**: ^4.0.1
*   **prisma**: 6.19.3
*   **swagger-jsdoc**: ^6.2.8
*   **swagger-ui-express**: ^5.0.1

#### Dev Dependencies
*   **nodemon**: ^3.1.14

### Passo a passo

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/seu-usuario/pizzaria-genm.git](https://github.com/seu-usuario/pizzaria-genm.git)
   cd pizzaria-genm

2. **Instale as dependencias**
   Troque o terminal para cmd e instale as dependencias
   ```cmd
   npm install

4. **Configure as variáveis de ambiente:**
   Crie um arquivo `.env` na raiz do projeto e preencha conforme o exemplo:
   ```env
   DATABASE_URL="mysql://usuario:senha@localhost:3306/pizzaria"
   JWT_SECRET="sua_chave_secreta_aqui"
   EMAIL_USER="seu-email@gmail.com"
   EMAIL_PASS="sua-senha-de-app"

5. **Configure o banco:**
   No seu terminal (cmd) configure o prisma com
   ```cmd
   npx prisma generate dev
   npx prisma migration dev --name init

6. **Abra o servidor:**
   No seu terminal (cmd) rode o servidor com
   ```cmd
   npm run dev

---

## Como Funciona?

Abra http://localhost:3000/docs/#/ dentro do Swagger UI voce podera ver as rotas e suas funcionalidades
