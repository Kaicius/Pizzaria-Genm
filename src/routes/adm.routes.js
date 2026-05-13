import { Router } from 'express'
import { verificarTokenAdmin } from '../middlewares/logger.middlewares.js'
import { login_adm, logout } from '../controllers/auth.controller.js'
import { cadastrar_ingrediente, cadastrar_produto, cadastrar_receita, cadastro_adm, editar_adm, editar_ingrediente, editar_produto, editar_receita, excluir_adm, excluir_ingrediente, excluir_item_receita, excluir_produto, excluir_receita, home_adm, listar_adm, listar_adm_esp, listar_ingredientes, listar_ingredientes_esp, listar_produto_esp, listar_produtos, listar_receita_esp, listar_receitas } from '../controllers/adm.controller.js'
import { restocar_produto, ver_financeiro } from '../controllers/pizzaria.controller.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   - name: Admin - Autenticação
 *     description: Login e controle de acesso administrativo
 *   - name: Admin - Gerenciamento (CRUD)
 *     description: Controle de contas de administradores
 *   - name: Admin - Produtos
 *     description: Cadastro e edição do cardápio
 *   - name: Admin - Ingredientes
 *     description: Controle de insumos e estoque base
 *   - name: Admin - Receitas
 *     description: Composição técnica dos produtos
 */


// --- ROTAS ADMIN ---

/**
 * @swagger
 * /adm/:
 *   get:
 *     summary: Home da administração
 *     tags: [Admin - Autenticação]
 *     responses:
 *       200:
 *         pagina: Home Administrador
 */

router.get("/", verificarTokenAdmin, home_adm)

/**
 * @swagger
 * /adm/logout:
 *   get:
 *     summary: Logout administrativo
 *     tags: [Admin - Autenticação]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 */

router.get("/logout", verificarTokenAdmin, logout)



/**
 * @swagger
 * /adm/login:
 *   post:
 *     summary: Login administrativo
 *     tags: [Admin - Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login ADM realizado com sucesso
 *       401:
 *         description: Credenciais inválidas ou usuário inativo
 */

router.post('/login', login_adm)


// --- ROTAS ADMIN CRUD ---


/**
 * @swagger
 * /adm/listar/adm:
 *   get:
 *     summary: Lista todos os administradores
 *     tags: [Admin - Gerenciamento (CRUD)]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de ADMs retornada
 */

router.get("/listar/adm", verificarTokenAdmin, listar_adm)

/**
 * @swagger
 * /adm/listar/adm/{id}:
 *   get:
 *     summary: Pesquisa um ADM especifico
 *     tags: [Admin - Gerenciamento (CRUD)]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *     responses:
 *       200:
 *         description: o ADM especificado retornado
 */


router.get("/listar/adm/:id", verificarTokenAdmin, listar_adm_esp)

/**
 * @swagger
 * /adm/listar/adm/cadastrar:
 *   post:
 *     summary: Cadastra um novo administrador
 *     tags: [Admin - Gerenciamento (CRUD)]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *               ativo:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Administrador criado
 */

router.post("/listar/adm/cadastrar", verificarTokenAdmin, cadastro_adm)

/**
 * @swagger
 * /adm/listar/adm/cadastrar/debug:
 *   post:
 *     summary: Cadastra um novo administrador (sem precisar de login caso essa seja a primeira vez usando o site e não tem nenhum ADM cadastrado)
 *     tags: [Admin - Gerenciamento (CRUD)]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *               ativo:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Administrador criado
 */

router.post("/listar/adm/cadastrar/debug", cadastro_adm)


/**
 * @swagger
 * /adm/listar/adm/editar/{id}:
 *   put:
 *     summary: Edita dados de um administrador
 *     tags: [Admin - Gerenciamento (CRUD)]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *               ativo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Administrador atualizado
 */

router.put("/listar/adm/editar/:id", verificarTokenAdmin, editar_adm)


/**
 * @swagger
 * /adm/listar/adm/excluir/{id}:
 *   delete:
 *     summary: Remove um administrador do sistema
 *     tags: [Admin - Gerenciamento (CRUD)]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Administrador removido
 */

router.delete("/listar/adm/excluir/:id", verificarTokenAdmin, excluir_adm)

// --- ROTAS FINANCEIRO ---

/**
 * @swagger
 * /adm/financeiro:
 *   get:
 *     summary: Exibe o balanço financeiro e alertas de estoque baixo
 *     tags: [Admin - Financeiro]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Relatório gerado com sucesso
 */

router.get('/financeiro', verificarTokenAdmin, ver_financeiro)

/**
 * @swagger
 * /adm/restocar/{id}:
 *   post:
 *     summary: Repõe o estoque de um produto específico
 *     tags: [Admin - Financeiro]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantidade:
 *                 type: integer
 *                 example: 50
 *     responses:
 *       200:
 *         description: Estoque atualizado com sucesso
 */

router.post('/restocar/:id', verificarTokenAdmin, restocar_produto)

// --- ROTAS PRODUTO --

/**
 * @swagger
 * /adm/listar/produto/cadastrar:
 *   post:
 *     summary: Cadastra um novo produto no cardápio
 *     tags: [Admin - Produtos]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, preco, estoque, categoria]
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               preco:
 *                 type: number
 *               estoque:
 *                 type: integer
 *               categoria:
 *                 type: string
 *                 enum: [pizza, bebida, combo]
 *     responses:
 *       201:
 *         description: Produto cadastrado
 */

router.post("/listar/produto/cadastrar", verificarTokenAdmin, cadastrar_produto)

/**
 * @swagger
 * /adm/listar/produtos:
 *   get:
 *     summary: Lista todos os produtos com suas receitas
 *     tags: [Admin - Produtos]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Sucesso
 */

router.get("/listar/produtos", verificarTokenAdmin, listar_produtos)

/**
 * @swagger
 * /adm/listar/produtos/{id}:
 *   get:
 *     summary: Busca um produto por Id
 *     tags: [Admin - Produtos]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *     responses:
 *       200:
 *         description: Sucesso
 */

router.get("/listar/produtos/:id", verificarTokenAdmin, listar_produto_esp)

/**
 * @swagger
 * /adm/listar/produto/editar/{id}:
 *   put:
 *     summary: Edita os dados de um produto existente
 *     tags: [Admin - Produtos]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               preco:
 *                 type: number
 *               estoque:
 *                 type: integer
 *               categoria:
 *                 type: string
 *     responses:
 *       200:
 *         description: Produto editado com sucesso
 */

router.put("/listar/produto/editar/:id", verificarTokenAdmin, editar_produto)

/**
 * @swagger
 * /adm/listar/produto/excluir/{id}:
 *   delete:
 *     summary: Remove um produto do sistema
 *     tags: [Admin - Produtos]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Produto removido
 *       400:
 *         description: Erro de integridade (produto possui vínculos)
 */

router.delete("/listar/produto/excluir/:id", verificarTokenAdmin, excluir_produto)

// --- ROTAS INGREDIENTES ---

/**
 * @swagger
 * /adm/listar/ingrediente/cadastrar:
 *   post:
 *     summary: Cadastra um novo insumo (ingrediente)
 *     tags: [Admin - Ingredientes]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               estoque:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Ingrediente criado
 */


router.post("/listar/ingrediente/cadastrar", verificarTokenAdmin, cadastrar_ingrediente)

/**
 * @swagger
 * /adm/listar/ingrediente:
 *   get:
 *     summary: Lista todos os ingredientes
 *     tags: [Admin - Ingredientes]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Sucesso
 */

router.get("/listar/ingrediente", verificarTokenAdmin, listar_ingredientes)

/**
 * @swagger
 * /adm/listar/ingrediente/{id}:
 *   get:
 *     summary: Busca um ingrediente pelo ID
 *     tags: [Admin - Ingredientes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Dados do ingrediente
 */

router.get("/listar/ingrediente/:id", verificarTokenAdmin, listar_ingredientes_esp)

/**
 * @swagger
 * /adm/listar/ingrediente/editar/{id}:
 *   put:
 *     summary: Atualiza nome ou estoque de um ingrediente
 *     tags: [Admin - Ingredientes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               estoque:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Atualizado com sucesso
 */

router.put("/listar/ingrediente/editar/:id", verificarTokenAdmin, editar_ingrediente)

/**
 * @swagger
 * /adm/listar/ingrediente/excluir/{id}:
 *   delete:
 *     summary: Exclui um ingrediente permanentemente
 *     tags: [Admin - Ingredientes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Ingrediente excluído
 */

router.delete("/listar/ingrediente/excluir/:id", verificarTokenAdmin, excluir_ingrediente)

// --- ROTAS RECEITAS ---

/**
 * @swagger
 * /adm/listar/receita/cadastrar:
 *   post:
 *     summary: Vincula um ingrediente a um produto (Receita)
 *     tags: [Admin - Receitas]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_produto:
 *                 type: integer
 *               id_ingrediente:
 *                 type: integer
 *               quantidade:
 *                 type: integer
 *               quantidade_uso:
 *                 type: string
 *                 example: "200g"
 *     responses:
 *       201:
 *         description: Ingrediente atribuído ao produto
 */

router.post("/listar/receita/cadastrar", verificarTokenAdmin, cadastrar_receita)

/**
 * @swagger
 * /adm/listar/receitas:
 *   get:
 *     summary: Lista todas as receitas
 *     tags: [Admin - Receitas]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Sucesso
 */

router.get("/listar/receitas", verificarTokenAdmin, listar_receitas)

/**
 * @swagger
 * /adm/listar/receita/{id}:
 *   get:
 *     summary: Busca uma receita pelo ID
 *     tags: [Admin - Receitas]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Dados da receita
 */

router.get("/listar/receita/:id", verificarTokenAdmin, listar_receita_esp)

/**
 * @swagger
 * /adm/listar/receita/editar/{id}:
 *   put:
 *     summary: Edita proporções de um item da receita
 *     tags: [Admin - Receitas]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantidade:
 *                 type: integer
 *               quantidade_uso:
 *                 type: string
 *     responses:
 *       200:
 *         description: Receita atualizada
 */

router.put("/listar/receita/editar/:id", verificarTokenAdmin, editar_receita)

/**
 * @swagger
 * /adm/listar/receita/excluir/{id}:
 *   delete:
 *     summary: Exclui todos os vínculos de receita de um produto
 *     tags: [Admin - Receitas]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Receita removida
 */

router.delete("/listar/receita/excluir/:id", verificarTokenAdmin, excluir_receita)

/**
 * @swagger
 * /adm/listar/receita/excluir/item/{id}:
 *   delete:
 *     summary: Remove um ingrediente de uma receita específica
 *     tags: [Admin - Receitas]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item removido
 */

router.delete("/listar/receita/excluir/item/:id", verificarTokenAdmin, excluir_item_receita)


export default router