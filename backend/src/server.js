
require("dotenv").config()
const express = require("express")
const cors = require("cors")
const http = require('http')
const {Server} = require('socket.io')
const path = require ('path')
const jwt = require('jsonwebtoken')
const {PrismaClient} = require('.../generated/prisma')
const {PrismaPg} = require('@prisma/adapter-pg')

const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const skillRoutes = require('./routes/skills')
const requestRoutes = require('./routes/requests')
const exchangeRoutes = require('./routes/exchanges')
const reviewRoutes = require('./routes/reviews')
const messageRoutes = require('./routes/messages')

const adapter = new PrismaPg({connectionString: process.env.DATABASE_URL})
const prisma = new PrismaClient({adapter})

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors: {origin: 'http://localhost:5173', methods: ['GET', 'POST']}
})


//Middleware
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

//Routes
app.use('/auth', authRoutes)
app.use('/users', userRoutes)
app.use('/skills', skillRoutes)
app.use('/requests', requestRoutes)
app.use('/exchanges', exchangeRoutes)
app.use('/reviews', reviewRoutes)
app.use('/messages', messageRoutes)

//Test route
app.get("/", (req,res) => {
    res.status(200).json({
        message: "Helper API is running"
    })
})

//Test API route
app.get("/api/test", (req,res) => {
    res.json({
        status: "success",
        data: "API is working properly"
    })
})

//Socket.io
io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) return next(new Error('No token'))
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        socket.userId = decoded.userId
        next()
    } catch {
        next(new Error('Invalid token'))
    }
})

io.on('connection', (socket) => {
    console.log('User connected:', socket.userId)

    //Join a chat room for an exchange
    socket.on('join_exchange', (exchangeId) => {
        socket.join(exchangeId)
        console.log(`User ${socket.userId} joined exchange ${exchangeId}`)
    })

    //Send a message
    socket.on('send_message', async({exchangeId, content}) => {
        try {
            const message = await prisma.message.create({
                data: {
                    exchangeId,
                    senderId: socket.userId,
                    content,
                },
                include: {
                    sender: {select: {id: true, name: true, avatar: true}}
                }
            })
            io.to(exchangeId).emit('new_message', message)
        } catch (err) {
            console.error('Message error: ', err)
        }
    })

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.userId)
    })
})

//Port configuration
const PORT = process.env.PORT || 4000

//Start server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})