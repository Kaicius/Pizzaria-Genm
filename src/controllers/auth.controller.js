import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'
import otpGenerator from 'otp-generator'
import { emailReset_Enviado } from '../lib/email.js'

// CADASTRO
export async function cadastro_user(req, res) {
    const { email, nome, sobrenome, senha } = req.body

    try {

        if(!nome || typeof nome !== "string" || nome.length < 2){
            return res.status(400).send("nome é obrigatorio e deve ter pelo menos 2 caracteres")
        }

        if(!sobrenome || typeof sobrenome !== "string" || sobrenome.length < 5){
            return res.status(400).send("sobrenome é obrigatorio e deve ter pelo menos 3 caracteres")
        }

        if (!email || typeof email !== "string"){
            return res.status(400).send("email é obrigatorio")
        }

        if(!senha || typeof senha !== "string" || senha < 6){
            return res.status(400).send("password é obrigatorio e deve ter pelo menos 6 caracteres")
        }


        const existing = await prisma.user.findUnique({
            where: { email: email.trim().toLowerCase() }
        })

        if (existing) {
            return res.status(400).send("Email já cadastrado")
        }
        
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(senha, salt)
        
        const user = await prisma.user.create({
            data: {
                nome: nome.trim(),
                sobrenome: sobrenome.trim(),
                email: email.trim().toLowerCase(),
                senha: hashedPassword,
                role: 'USER'
            }
        })

        return res.status(201).send("Usuário cadastrado com sucesso")
    } catch (error) {
        console.error("erro ao cadastrar usuario", error);
        return res.status(500).send({
            mensagem: "Erro interno do servidor"
        })
    }
}

// LOGIN (USER)

export async function login_user(req, res) {
    const { email, senha } = req.body

    try {

        if (!email || typeof email !== "string"){
            return res.status(400).send("email é obrigatorio")
        }
    
        if(!senha || typeof senha !== "string" || senha.length < 6){
            return res.status(400).send("senha é obrigatorio e deve ter pelo menos 6 caracteres")
        }

        const usuario = await prisma.user.findUnique({
            where: { email: email.trim().toLowerCase() }
        })

        if (!usuario){
            return res.status(401).send({
                message: "email invalido"
            })
        }

        const igual = await bcrypt.compare(senha, usuario.senha)
        
        if (!igual) return res.status(401).send({
            message: "senha invalida"
        })

        const token_user = jwt.sign(
            { 
                id: usuario.id, 
                nome: usuario.nome,
                sobrenome: usuario.sobrenome,
                email: usuario.email, 
                role: usuario.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        return res.status(200).cookie('token_user', token_user, {
            httpOnly: true,
            secure: false,
            maxAge: 60 * 60 * 1000
        }).send({
            mensagem: "Login realizado com sucesso"
        })
    } catch (error) {
        console.error("erro ao logar como usuario", error);
        return res.status(500).send({
            mensagem: "Erro interno do servidor"
        })
    }
}

// LOGIN (ADM)

export async function login_adm(req, res) {
    const { user, senha } = req.body

    try {
        if (!user || typeof user !== "string"){
            return res.status(400).send("user é obrigatorio")
        }
    
        if(!senha || typeof senha !== "string" || senha.length < 6){
            return res.status(400).send("senha é obrigatorio e deve ter pelo menos 6 caracteres")
        }
    
        const administrador = await prisma.administrador.findUnique({
            where: { ADM_NOME: user.trim() }
        })
    
        if (!administrador) {
            return res.status(401).send({
                message: "user invalido"
            })
        }
    
        const igual = await bcrypt.compare(senha, administrador.ADM_SENHA)
    
        if (!igual) {
            return res.status(401).send({
                mensagem: "senha invalida"
            })
        }

        const ativo = await prisma.administrador.findUnique({
            where: { ADM_NOME: user.trim(),
                    ADM_ATIVO: true
             }
        })
        
        if (!ativo) {
            return res.status(401).send({
                mensagem: "usuario não esta mais ativo"
            })    
        }

        const token_adm = jwt.sign(
            { id: administrador.ADM_ID,
            email: administrador.ADM_EMAIL,
            nome: administrador.ADM_NOME,
            ativo: administrador.ADM_ATIVO,
            role: "ADMINISTRADOR" },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        )
    
        return res.status(200).cookie('token_adm', token_adm, {
            httpOnly: true,
            secure: false,
            maxAge: 60 * 60 * 1000
        }).send({
            mensagem: "Login realizado ADM com sucesso"
        })
    } catch (error) {
        console.error("erro ao logar como adm", error);
        return res.status(500).send({
            mensagem: "Erro interno do servidor"
        })
    }
}

// LOGOUT

export async function logout(req, res) {
    return res.clearCookie('token_user').status(200).send({
        message: "Logout realizado com sucesso"
    });
}

// RESET SENHA USUARIO

export async function pedir_reset_senha(req, res) {

    const { email } = req.body

    try {
        const existing = await prisma.user.findUnique({
            where: { email: email }
        })
    
        if (!existing) {
            return res.status(404).send({
                mensagem: "email não encontrado"
            })
        }
    
        const codigo = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false
        })
        const expira = new Date(Date.now() + 10 * 60 * 1000)
    
        await prisma.reset_senha.create({
            data: {
                id_user: existing.id,
                token: codigo,
                expira_em: expira
            }
        })
    
        await emailReset_Enviado(existing.nome, existing.sobrenome, email, codigo)
    
        return res.status(200).send({
            mensagem: "Codigo de reset de senha enviado para o email"
        })

    } catch (error) {
        console.log("Erro ao pedir o codigo OTP:", error);
        return res.status(500).send({
            mensagem: "Erro interno do servidor"
        })
    }
}

// CONFIRMAR CODIGO OTP

export async function confirmar_codigo(req, res) {
    const { codigo } = req.body

    try {
        const existing = await prisma.reset_senha.findFirst({
            where: {
                token: codigo,
                expira_em: { gt: new Date() }
            },
            include: { user: true }
            
        })
    
        if (!existing) {
            return res.status(404).send({
                mensagem: "Codigo invalido"
            })
        }

        const user = existing.user

        const reset_senha_token = jwt.sign(
            {
                id: user.id,
                reset_autorizado: true  
            },
            process.env.JWT_SECRET,
            { expiresIn: '9m' }
        )

        await prisma.reset_senha.delete({
            where: { id: existing.id }
        });

        return res.status(200).cookie('token_reset', reset_senha_token,{
            httpOnly: true,
            secure: false,
            maxAge: 9 * 60 * 1000
        }).send({
            mensagem: "Acesso liberado"
        })

    } catch (error) {
        console.log("Erro no reset_senha:", error);
        return res.status(500).send({
            mensagem: "Erro interno do servidor"
        })
    }
}

// ALTERAR SENHA

export async function reset_senha(req, res) {
    const { senha1, senha2 } = req.body
    const id_user = req.usuarioPermitido.id

    try {
        if (!senha1 || senha1.length < 6 || typeof senha1 !== "string") {
            return res.status(400).send("A senha deve  ter pelo menos 6 caracteres e não pode estar vazia")
        }

        if (!senha2 || senha2.length < 6 || typeof senha2 !== "string") {
            return res.status(400).send("A senha deve  ter pelo menos 6 caracteres e não pode estar vazia")
        }

        if (senha1 !== senha2) {
            return res.status(400).send("As senhas não estão iguais")
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(senha1, salt)

        await prisma.user.update({
            where: { id: id_user },
            data: { senha: hashedPassword }
        })

        return res.clearCookie('token_reset').status(200).send({
            mensagem: "Senha alterado com sucesso"
        })
    } catch (error) {
        console.error("erro ao atualizar a senha", error);
        return res.status(500).send({
            mensagem: "Erro interno do servidor"
        })
    }
}