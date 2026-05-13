import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'

// HOME

export async function home(req, res) {
    return res.status(200).send({
        pagina: "Home Pizzaria"
    })
}

// LISTAR CARDAPIO

export async function listar_cardapio(req, res) {
    try {
        const produtos = await prisma.produto.findMany({
            where: { estoque: { gt: 0 } }
        })
        return res.status(200).send(produtos)
        
    } catch (error) {
        console.log("Erro no listar cardapio:", error);
        return res.status(500).send({
            mensagem: "Erro interno do servidor"
        })
    }
}

// VER FINANCEIRO

export async function ver_financeiro(req, res) {
    try {
        const pedidos_entregues = await prisma.pedidos.findMany({
            where: { status: 'ENTREGUE' }
        })

        const total_ganho = pedidos_entregues.reduce((acc, pedido) => acc + Number(pedido.total), 0)

        const custo_estimado = total_ganho * 0.4
        const lucro_liquido = total_ganho - custo_estimado

        return res.status(200).send({
            faturamento_total: total_ganho.toFixed(2),
            custo_operacional_estimado: custo_estimado.toFixed(2),
            lucro_liquido_estimado: lucro_liquido.toFixed(2),
            quantidade_pedidos: pedidos_entregues.length
        })

    } catch (error) {
        console.log("Erro ao ver o financeiro:", error);
        return res.status(500).send({
            mensagem: "Erro interno do servidor"
        })
    }
}

// RESTOCAR PRODUTO

export async function restocar_produto(req, res) {
    const id_produto = Number(req.params.id)
    const { quantidade_nova } = req.body

    if (!quantidade_nova || quantidade_nova <= 0) {
        return res.status(400).send({
            mensagem: "Quantidade invalida para restoque"
        })
    }

    try {
        const produto = await prisma.produto.update({
            where: { id: id_produto },
            data: {
                estoque: {
                    increment: quantidade_nova
                }
            }
        })

        return res.status(200).send({
            mensagem: `Estoque do produto ${produto.nome} atualizado com sucesso`,
            estoque_atual: produto.estoque
        })
    } catch (error) {
        console.log("Erro no restoque:", error);
        return res.status(500).send({
            mensagem: "Erro interno do servidor"
        })
    }
}

// LISTAR PEDIDOS

export async function listar_pedidos(req, res) {
    const id_user = req.usuarioLogado.id

    try {
        const meus_pedidos = await prisma.pedidos.findMany({
            where: { id_user: id_user,
                status: { not: 'CANCELADO' }
            },
            select: {
                status: true,
                items: {
                    select: {
                        quantidade: true,
                        precoFixo: true,
                        produtos: {
                            select: {
                                nome: true,
                                categoria: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return res.status(200).send(meus_pedidos)
    } catch (error) {
        console.log("Erro ao listar pedidos do usuario:", error);
        return res.status(500).send({
            mensagem: "Erro interno do servidor"
        })
    }
}


// FAZER PEDIDO

export async function fazer_pedido(req, res) {
    const { itens } = req.body;
    const id_user = req.usuarioLogado.id;

    try {
        for (const item of itens) {
            const prod = await prisma.produto.findUnique({
                where: { id: item.id_produto }
            });
            
            if (!prod) return res.status(404).send({ mensagem: "Produto não encontrado" });
            
            if (prod.estoque < item.quantidade) return res.status(400).send({
                mensagem: `O item ${prod.nome} está indisponível no momento.`
            });
        }

        const resultado = await prisma.$transaction(async (tx) => {
            let valorTotal = 0;
            const itensParaSalvar = [];

            for (const item of itens) {
                const composicao = await tx.receita.findMany({
                    where: { id_produto: item.id_produto },
                    include: { ingrediente: true }
                });

                for (const componente of composicao) {
                    const quantidade_necessaria = componente.quantidade * item.quantidade;

                    if (isNaN(quantidade_necessaria)) { 
                        throw new Error("Erro no cálculo de quantidade dos ingredientes.");
                    }

                    if (componente.ingrediente.estoque < quantidade_necessaria) {
                        throw new Error(`Ingrediente ${componente.ingrediente.nome} insuficiente.`);
                    }

                    await tx.ingrediente.update({
                        where: { id: componente.id_ingrediente },
                        data: { estoque: { decrement: quantidade_necessaria } }
                    });
                }

                const produto = await tx.produto.findUnique({ where: { id: item.id_produto } });

                await tx.produto.update({
                    where: { id: item.id_produto },
                    data: { estoque: { decrement: item.quantidade } }
                });

                valorTotal += Number(produto.preco) * item.quantidade;
                
                itensParaSalvar.push({
                    id_produto: item.id_produto,
                    quantidade: item.quantidade,
                    precoFixo: produto.preco
                });
            }

            return await tx.pedidos.create({
                data: {
                    id_user: id_user,
                    total: valorTotal,
                    items: {
                        create: itensParaSalvar
                    }
                }
            });
        });

        setTimeout(async () => {
            await prisma.pedidos.update({
                where: { id: resultado.id },
                data: { status: 'PREPARANDO' }
            })
        }, 180000);

        setTimeout(async () => {
            const pedidoAtual = await prisma.pedidos.findUnique({ where: { id: resultado.id } });

            if (pedidoAtual && pedidoAtual.status !== 'CANCELADO') {
                await prisma.pedidos.update({
                    where: { id: resultado.id },
                    data: { status: 'ENTREGUE' }
                })
            }
        }, 600000);

        return res.status(201).send({
            mensagem: "Pedido finalizado com sucesso", 
            pedido: resultado
        });

    } catch (error) {
        console.log("Erro ao fazer o pedido:", error);
        return res.status(400).send({
            mensagem: "Erro interno do servidor"
        });
    }
}

// CANCELAR PEDIDO

export async function cancelar_pedido(req, res) {
    const id_pedido = Number(req.params.id)
    const id_user = req.usuarioLogado.id

    try {
        const pedido = await prisma.pedidos.findUnique({
            where: { id: id_pedido }
        })

        if (!pedido || pedido.id_user !== id_user) {
            return res.status(404).send({
                mensagem: "Pedido não encontrado"
            })
        }

        await prisma.pedidos.update({
            where: { id: id_pedido },
            data: { status: 'CANCELADO' }
        })

        return res.status(200).send({
            mensagem: "Pedido cancelado com sucesso"
        })
    } catch (error) {
        console.log("Erro cancelar pedido:", error);
        return res.status(500).send({
            mensagem: "Erro interno do servidor"
        })
    }
}