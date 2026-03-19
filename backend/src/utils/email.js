const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    family: 4
})

const sendEmail = async ({to, subject, html}) => {
    try{
        await transporter.sendMail({
            from: `"helper." <$process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        })
        console.log(`Email sent to ${to}`)
    } catch (err) {
        console.error('Email error:', err)
    }
}

const sendVerificationEmail = async (email, name, code) => {
    await sendEmail({
        to: email,
        subject: 'Verify your helper. account',
        html: `
        <div style="font-family:sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background:#B197FC; padding: 20px; border-radius: 16px; text-align: center; margin-bottom: 20px;">
                <h1 style="color: white; margin: 0; font-size: 24px;">helper.</h1>
            </div>
            <h2 style="color: #6b46c1;">Welcome, ${name}! 👋</h2>
            <p style="color: #555;">Thanks for joining helper. Please verify your email with this code:</p>
            <div style="background: #F5F3FF; padding: 24px; border-radius: 12px; text-align: center; margin: 24px 0;">
                <p style="font-size: 36px; font-weight: bold; color: #6b46c1; letter-spacing: 8px; margin: 0;">${code}</p>
            </div>
            <p style="color: #555;">This code expires in <strong>15 minutes</strong>.</p>
            <p style="color: #aaa; font-size: 12px; margin-top: 20px;">helper. -connecting neightbors, one task at a time.</p>
        </div>`
    })
}

const sendResetCodeEmail = async (email, name, code) => {
    await sendEmail({
        to: email,
        subject: 'Reset your helper. password',
        html: `
        <div style="font-family: sans-seril; max-width: 600px; margin:0 auto; padding: 20px;">
            <div style="background: #B197FC; padding: 20px; border-radius: 16px; text-align: center; margin-bottom: 20px;">
                <h1 style="color: white; margin: 0; font-size: 24px;">helper.</h1>
            </div>
            <h2 style="color: #6b46c1;">Hi ${name},</h2>
            <p style="color:#555;"You requested to reset your password. Use this code:</p>
            <div style="background: #F5F3FF; padding: 24px; border-radium: 12px; text-align: center; margin: 24px 0;">
                <p style="font-size: 36px; font-weight: bold; color: #6b46c1; letter-spacing: 8px; margin: 0;">${code}</p>
            </div>
            <p style="color: #555;">This code expires in <strong>15 minutes</strong>.</p>
            <p style="color: #aaa;" font-size: 12px; margin-top: 20px;">If you didn't request this, ignore this email.</p>
            <p style="color: #aaa; font-size: 12px;">helper. -connecting neighbors, one task at a time.</p>
        </div>`
    })
}

module.exports = {sendVerificationEmail, sendResetCodeEmail}