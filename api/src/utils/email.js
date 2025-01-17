const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
require('dotenv').config()

const JWT_SECRET = '0ee4dc1540b617912a23b150eef0a4fe073ca99a'

const getTransport = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST ?? 'sandbox.smtp.mailtrap.io',
        port: process.env.SMTP_PORT ?? 2525,
        secure: false,
        auth: {
            user: process.env.SMTP_USER ?? '0a76285ac64525',
            pass: process.env.SMTP_PASSWORD ?? '34d692164befe8',
        },
    })
}
const recoveryEmail = (email, token, request) => {
    const url = `https://${request.headers.host}/password/${token}`

    const message = {
        from: '"Drip Br" <noreply@dripbr.pt>',
        to: email,
        subject: 'Recuperação de senha',
        text: `
            Obrigado por se registar no Drip Br.
            Clique no link para recuperar a sua senha.
            ${url}
            `,
        html: `
            <p>Obrigado por se registar no Drip Br.</p>
            <p>Clique no link para recuperar a sua senha.</p>
            <a href="${url}">Recuperar senha</a>
            `
    }

    return message
}

const verificationEmail = (email, token, request) => {
    const url = `https://${request.headers.host}/confirm/${token}`

    const message = {
        from: '"Drip Br" <noreply@dripbr.pt>',
        to: email,
        subject: 'Confirme o seu email',
        text: `
            Obrigado por se registar no Drip Br. 
            Clique no link para confirmar o seu email.
            ${url}
            `,
        html: `
            <p>Obrigado por se registar no Drip Br.</p>
            <p>Clique no link para confirmar o seu email.</p>
            <a href="${url}">Confirmar email</a>
            `
    }

    return message
}

const sendJWTToken = async (email, messageBuilder, request) => {
    const token = jwt.sign(
        {
            email: email
        },
        process.env.JWT_SECRET ?? JWT_SECRET,
        {
            expiresIn: '1d'
        })

    const message = messageBuilder(email, Buffer.from(token).toString('base64'), request)

    let transporter = getTransport()
    await transporter.sendMail(message).catch(console.error)
}

const sendRecovery = (request, email) => {
    return sendJWTToken(email, recoveryEmail, request)
}

const sendVerification = (request, email) => {
    return sendJWTToken(email, verificationEmail, request)
}

const verifyEmail = token => {
    try {
        return jwt.verify(Buffer.from(token, 'base64').toString('ascii'), process.env.JWT_SECRET ?? JWT_SECRET)
    }
    catch (e) {
        return null
    }
}

module.exports = {
    sendVerification, verifyEmail,
    sendRecovery
}
