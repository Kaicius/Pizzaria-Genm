import { Router } from 'express'
import { verificarToken, verificarTokenAdmin, verificarTokenReset } from '../middlewares/logger.middlewares.js'
import { cadastro_user, confirmar_codigo, login_user, logout, pedir_reset_senha, reset_senha } from '../controllers/auth.controller.js'

const router = Router()

// --- ROTAS USER ---

/**
 * @swagger
 * /user/cadastro:
 *   post:
 *     summary: Cadastra um novo usuário
 *     tags: [Auth]
 *     
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               sobrenome:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *
 *     responses:
 *       201:
 *         description: Usuário cadastrado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/cadastro', cadastro_user)


/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Realiza login do usuário
 *     tags: [Auth]
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', login_user)

// --- ROTAS USER LOGADO ---
router.get("/logout", verificarToken, logout)
router.post("/login/esqueci-a-senha", pedir_reset_senha)
router.post("/login/esqueci-a-senha-confirmar", confirmar_codigo)
router.put("/login/alterar-senha", verificarTokenReset, reset_senha)

export default router