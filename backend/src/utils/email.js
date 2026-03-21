const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)

const sendEmail = async ({ to, subject, html }) => {
  try {
    await resend.emails.send({
      from: 'helper. <onboarding@resend.dev>',
      to,
      subject,
      html,
    })
    console.log(`Email sent to ${to}`)
  } catch (err) {
    console.error('Email error:', err)
  }
}

const sendVolunteerEmail = async (ownerEmail, ownerName, helperName, taskTitle) => {
  await sendEmail({
    to: ownerEmail,
    subject: `Someone wants to help with "${taskTitle}"!`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #B197FC; padding: 20px; border-radius: 16px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">helper.</h1>
        </div>
        <h2 style="color: #6b46c1;">Hi ${ownerName}! 👋</h2>
        <p style="color: #555;"><strong>${helperName}</strong> wants to help with your task:</p>
        <div style="background: #F5F3FF; padding: 16px; border-radius: 12px; margin: 16px 0;">
          <p style="color: #6b46c1; font-weight: bold; margin: 0;">${taskTitle}</p>
        </div>
        <p style="color: #555;">Log in to chat with them and decide if you'd like to accept!</p>
        <a href="https://helper-chi-three.vercel.app/dashboard" style="display: inline-block; background: #B197FC; color: white; padding: 12px 24px; border-radius: 50px; text-decoration: none; margin-top: 10px;">
          View on dashboard
        </a>
        <p style="color: #aaa; font-size: 12px; margin-top: 20px;">helper. — connecting neighbors, one task at a time.</p>
      </div>
    `
  })
}

const sendAcceptEmail = async (helperEmail, helperName, ownerName, taskTitle) => {
  await sendEmail({
    to: helperEmail,
    subject: `Your offer to help was accepted! 🎉`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #B197FC; padding: 20px; border-radius: 16px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">helper.</h1>
        </div>
        <h2 style="color: #6b46c1;">Great news, ${helperName}! 🎉</h2>
        <p style="color: #555;"><strong>${ownerName}</strong> accepted your offer to help with:</p>
        <div style="background: #F5F3FF; padding: 16px; border-radius: 12px; margin: 16px 0;">
          <p style="color: #6b46c1; font-weight: bold; margin: 0;">${taskTitle}</p>
        </div>
        <p style="color: #555;">Head to the chat to coordinate the details!</p>
        <a href="https://helper-chi-three.vercel.app/dashboard" style="display: inline-block; background: #B197FC; color: white; padding: 12px 24px; border-radius: 50px; text-decoration: none; margin-top: 10px;">
          Go to dashboard
        </a>
        <p style="color: #aaa; font-size: 12px; margin-top: 20px;">helper. — connecting neighbors, one task at a time.</p>
      </div>
    `
  })
}

const sendDeclineEmail = async (helperEmail, helperName, taskTitle) => {
  await sendEmail({
    to: helperEmail,
    subject: `Your offer to help was declined`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #B197FC; padding: 20px; border-radius: 16px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">helper.</h1>
        </div>
        <h2 style="color: #6b46c1;">Hi ${helperName},</h2>
        <p style="color: #555;">Unfortunately your offer to help with <strong>${taskTitle}</strong> was not accepted this time.</p>
        <p style="color: #555;">Don't worry — there are plenty of other tasks waiting for your help!</p>
        <a href="https://helper-chi-three.vercel.app/browse" style="display: inline-block; background: #B197FC; color: white; padding: 12px 24px; border-radius: 50px; text-decoration: none; margin-top: 10px;">
          Browse more tasks
        </a>
        <p style="color: #aaa; font-size: 12px; margin-top: 20px;">helper. — connecting neighbors, one task at a time.</p>
      </div>
    `
  })
}

const sendMessageEmail = async (recipientEmail, recipientName, senderName, taskTitle, exchangeId) => {
  await sendEmail({
    to: recipientEmail,
    subject: `New message from ${senderName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #B197FC; padding: 20px; border-radius: 16px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">helper.</h1>
        </div>
        <h2 style="color: #6b46c1;">Hi ${recipientName}! 💬</h2>
        <p style="color: #555;"><strong>${senderName}</strong> sent you a message about:</p>
        <div style="background: #F5F3FF; padding: 16px; border-radius: 12px; margin: 16px 0;">
          <p style="color: #6b46c1; font-weight: bold; margin: 0;">${taskTitle}</p>
        </div>
        <a href="https://helper-chi-three.vercel.app/chat/${exchangeId}" style="display: inline-block; background: #B197FC; color: white; padding: 12px 24px; border-radius: 50px; text-decoration: none; margin-top: 10px;">
          Reply in chat
        </a>
        <p style="color: #aaa; font-size: 12px; margin-top: 20px;">helper. — connecting neighbors, one task at a time.</p>
      </div>
    `
  })
}

const sendVerificationEmail = async (email, name, code) => {
  await sendEmail({
    to: email,
    subject: 'Verify your helper. account',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #B197FC; padding: 20px; border-radius: 16px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">helper.</h1>
        </div>
        <h2 style="color: #6b46c1;">Welcome, ${name}! 👋</h2>
        <p style="color: #555;">Thanks for joining helper. Please verify your email with this code:</p>
        <div style="background: #F5F3FF; padding: 24px; border-radius: 12px; text-align: center; margin: 24px 0;">
          <p style="font-size: 36px; font-weight: bold; color: #6b46c1; letter-spacing: 8px; margin: 0;">${code}</p>
        </div>
        <p style="color: #555;">This code expires in <strong>15 minutes</strong>.</p>
        <p style="color: #aaa; font-size: 12px; margin-top: 20px;">helper. — connecting neighbors, one task at a time.</p>
      </div>
    `
  })
}

const sendResetCodeEmail = async (email, name, code) => {
  await sendEmail({
    to: email,
    subject: 'Reset your helper. password',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #B197FC; padding: 20px; border-radius: 16px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">helper.</h1>
        </div>
        <h2 style="color: #6b46c1;">Hi ${name},</h2>
        <p style="color: #555;">You requested to reset your password. Use this code:</p>
        <div style="background: #F5F3FF; padding: 24px; border-radius: 12px; text-align: center; margin: 24px 0;">
          <p style="font-size: 36px; font-weight: bold; color: #6b46c1; letter-spacing: 8px; margin: 0;">${code}</p>
        </div>
        <p style="color: #555;">This code expires in <strong>15 minutes</strong>.</p>
        <p style="color: #aaa; font-size: 12px; margin-top: 20px;">If you didn't request this, ignore this email.</p>
        <p style="color: #aaa; font-size: 12px;">helper. — connecting neighbors, one task at a time.</p>
      </div>
    `
  })
}

module.exports = { sendVolunteerEmail, sendAcceptEmail, sendDeclineEmail, sendMessageEmail, sendVerificationEmail, sendResetCodeEmail }