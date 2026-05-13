import { Router } from 'express'
import { verificarToken, verificarTokenAdmin, verificarTokenReset } from '../middlewares/logger.middlewares.js'
import { cadastro_user, confirmar_codigo, login_user, logout, pedir_reset_senha, reset_senha } from '../controllers/auth.controller.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Gerenciamento de autenticação e usuários
 */

// --- ROTAS USER ---

/**
 * @swagger
 * /user/cadastro:
 *   post:
 *     summary: Cadastra um novo usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, sobrenome, email, senha]
 *             properties:
 *               nome:
 *                 type: string
 *                 example: João
 *               sobrenome:
 *                 type: string
 *                 example: Silva Santos
 *               email:
 *                 type: string
 *                 example: joao@email.com
 *               senha:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: Usuário cadastrado com sucesso
 *       400:
 *         description: Dados inválidos ou e-mail já cadastrado
 */
router.post('/cadastro', cadastro_user)

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Realiza login do usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, senha]
 *             properties:
 *               email:
 *                 type: string
 *                 example: joao@email.com
 *               senha:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso (Retorna cookie token_user)
 *       401:
 *         description: E-mail ou senha inválidos
 */
router.post('/login', login_user)

// --- ROTAS USER LOGADO ---


/**
 * @swagger
 * /auth/login/esqueci-a-senha:
 *   post:
 *     summary: Solicita código OTP para reset de senha
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Código enviado para o e-mail
 *       404:
 *         description: E-mail não encontrado
 */
router.post("/login/esqueci-a-senha", pedir_reset_senha)

/**
 * @swagger
 * /auth/login/esqueci-a-senha-confirmar:
 *   post:
 *     summary: Confirma o código OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               codigo:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Código validado (Retorna cookie token_reset)
 *       404:
 *         description: Código inválido ou expirado
 */
router.post("/login/esqueci-a-senha-confirmar", confirmar_codigo)

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Realiza logout do usuário autenticado
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 */
router.get("/logout", verificarToken, logout)



/**
 * @swagger
 * /auth/login/alterar-senha:
 *   put:
 *     summary: Altera a senha do usuário após validação do OTP
 *     tags: [Auth]
 *     security:
 *       - resetTokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               senha1:
 *                 type: string
 *               senha2:
 *                 type: string
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
 *       400:
 *         description: Senhas não coincidem ou são inválidas
 */
router.put("/login/alterar-senha", verificarTokenReset, reset_senha)



export default router