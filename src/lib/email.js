import nodemailer from 'nodemailer'

const configOptions = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})


export async function emailReset_Enviado(nome, sobrenome, emailDestinatario, codigo) {
    const emailReset = {
        from: `"Suporte Genm Pizzaria" <${process.env.EMAIL_USER}>`,
        to: emailDestinatario,
        subject:"Reset de Senha - Genm Pizzaria",
        html: `
        Olá <strong> ${nome} ${sobrenome}, 
        <br><br> Você solicitou uma redefinição de senha. <br><br> 
        Copie o codigo abaixo e cole no site:
        <br><br> <h3> ${codigo} </h3> <br><br>
        Este codigo expira em 10 minutos
        <br><br> <strong> Caso essa solicitação não seja sua ignore esse email 
        <br><br> Atenciosamente,<br>Equipe de Suporte Genm Pizzaria </strong>
        `
    }

    try {
        await configOptions.sendMail(emailReset);
        console.log("E-mail de reset enviado para:", emailDestinatario);
    } catch (error) {
        console.error("Erro ao enviar e-mail de reset:", error);
    }
}
