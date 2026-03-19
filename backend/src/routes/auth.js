require('dotenv').config()
const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {PrismaClient} = require('../../generated/prisma')
const {PrismaPg} = require('@prisma/adapter-pg')
const {sendVerificationEmail, sendResetCodeEmail} = require('../utils/email')
const authMiddleware = require('../middleware/authMiddleware')

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
})
const prisma = new PrismaClient({adapter})
const router = express.Router()
router.get('/test', (req,res) => {
    res.json({message: "auth router working"})
})

//Signup
router.post('/signup', async (req,res) => {
    const{name, email, password, location, bio} = req.body

    if (!name || !email || !password || !location) {
        return res.status(400).json({
            error: "Name, email, password and location are required"
        })
    }

    try {
        const existing = await prisma.user.findUnique({
            where: {email}
        })
        if (existing) {
            return res.status(400).json({
                error: 'Email already in use'
            })
        }

        if (password.length < 8) {
            return res.status(400).json({error: 'Password must be at least 8 characters'})
        }
        if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
            return res.status(400).json({error: 'Password must contain both letters and numbers'})
        }

        const hashed = await bcrypt.hash(password, 10)
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
        const user = await prisma.user.create({
            data: {name, email, password: hashed, location, bio, verificationCode},
        })

        await sendVerificationEmail(email, name, verificationCode)

        const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET, {expiresIn: '7d'})
        res.status(201).json({
            token,
            user: {id: user.id,
                name: user.name,
                email: user.email, avatar: null},
            requiresVerification: true
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({error: 'Something went wrong'})
    }
})

// Verify email
router.post('/verify', authMiddleware, async (req,res) => {
    const {code} = req.body
    try {
        const user = await prisma.user.findUnique({where: {id: req.userId}})
        if (!user) return res.status(404).json({error: 'User not found'})
        if (user.isVerified) return res.status(400).json({error:'Already verified'})
        if (user.verificationCode !== code) {
            return res.status(400).json({error: 'Invalid code'})
        }

        await prisma.user.update({
            where: {id: req.userId},
            data: {isVerified: true, verificationCode: null}
        })

        res.json({message: 'Email verified successfully'})
    } catch (err) {
        console.error(err)
        res.status(500).json({error: 'Something went wrong'})
    }
})

// Resend verification code
router.post('/resend-verification', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({where: {id: req.userId}})
        if (!user) return res.status(404).json({error: 'User not found'})
        if (user.isVerified) return res.status(400).json({error: 'Already verified'})

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
        await prisma.user.update({
            where: {id: req.userId},
            data: {verificationCode}
        })

        await sendVerificationEmail(user.email, user.name, verificationCode)
        res.json({message: 'Verification code resent'})
    } catch (err) {
        console.error(err)
        res.status(500).json({error: 'Something went wrong'})
    }
})

//Login
router.post('/login', async(req,res) => {
    const {email, password} = req.body

    if (!email || !password) {
        return res.status(400).json({error: 'Email and password are required'})
    }

    try {
        const user = await prisma.user.findUnique({where:{email}})
        if (!user) {
            return res.status(401).json({error: 'Invalid credentials'})
        }

        const valid = await bcrypt.compare(password, user.password)
        if (!valid) {
            return res.status(401).json({error: 'Invalid credentials'})
        }

        const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET, {expiresIn: '7d'})
        res.json({token, 
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar
                }
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({error: 'Something went wrong'})
    }
})

// Request password reset
router.post('/forgot-password', async (req, res) => {
    const {email} = req.body
    if (!email) return res.status(400).json({error: 'Email is required'})
    try {
        const user = await prisma.user.findUnique({where: {email}})
        if (!user) return res.status(404).json({error: 'No account found with that email'})

        const resetCode = Math.floor(100000 + Math.random() * 900000).toString()
        const resetCodeExpiry = new Date(Date.now() +15 * 60 * 1000)

        await prisma.user.update({
            where: {email},
            data: {resetCode, resetCodeExpiry}
        })

        await sendResetCodeEmail(email, user.name, resetCode)
        res.json({message: 'Reset code sent to your email'})
    } catch (err) {
        console.error(err)
        res.status(500).json({error: 'Something went wrong'})
    }
})

// Reset password
router.post('/reset-password', async (req, res) => {
    const {email, code, newPassword} = req.body
    if (!email || !code || !newPassword) {
        return res.status(400).json({error: 'Email, code and new password are required'})
    }
    if (newPassword.length < 8) {
        return res.status(400).json({error: 'Password must be at least 8 characters'})
    }
    if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
        return res.status(400).json({error: 'Password must contain both letters and numbers'})
    }
    try {
        const user = await prisma.user.findUnique({where: {email}})
        if (!user) return res.status(404).json({error: 'No account found with that email'})
        if (!user.resetCode || user.resetCode !== code) {
            return res.status(400).json({error: 'Invalid reset code'})
        }
        if (new Date() > new Date(user.resetCodeExpiry)) {
            return res.status(400).json({error: 'Reset code has expired'})
        }

        const hashed = await bcrypt.hash(newPassword, 10)
        await prisma.user.update({
            where: {email},
            data: {password: hashed, resetCode: null, resetCodeExpiry: null}
        })

        res.json({message: 'Password reset successfully'})
    } catch (err) {
        console.error(err)
        res.status(500).json({error: 'Something went wrong'})
    }
})

module.exports = router