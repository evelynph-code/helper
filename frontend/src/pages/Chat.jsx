import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import {io} from 'socket.io-client'
import Navbar from "./Navbar";
import { getCurrencySymbol } from "../utils/currency";


export default function Chat() {
    const {exchangeId} = useParams()
    const navigate = useNavigate()
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [exchange, setExchange] = useState(null)
    const [me, setMe] = useState(null)
    const [loading, setLoading] = useState(true)
    const socketRef = useRef(null)
    const bottomRef = useRef(null)

    useEffect(() => {
        const stored = localStorage.getItem('user')
        if (!stored) {navigate('/login'); return }
        setMe(JSON.parse(stored))

        fetchExchange()
        fetchMessages()

        const token = localStorage.getItem('token')
        socketRef.current = io(import.meta.env.VITE_API_URL || 'https://helper-7h5udorqd-evelynph-codes-projects.vercel.app/', {
            auth: {token}
        })

        socketRef.current.emit('join_exchange', exchangeId)

        socketRef.current.on('new_message', (message) => {
            setMessages(prev => [...prev, message])
        })

        return () => {
            socketRef.current.disconnect()
        }
    }, [exchangeId])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({behavior: 'smooth'})
    }, [messages])

    const fetchExchange = async () => {
        try {
            const res = await api.get(`/exchanges/detail/${exchangeId}`)
            setExchange(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    const fetchMessages = async () => {
        try {
            const res = await api.get(`/messages/${exchangeId}`)
            setMessages(res.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const sendMessage = () => {
        if (!newMessage.trim()) return 
        socketRef.current.emit('send_message', {
            exchangeId,
            content: newMessage.trim()
        })
        setNewMessage('')
    }

    const handleKeyDown = (e) => {
        if (e.key == "Enter" && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const handleAccept = async () => {
        try {
            await api.put(`/exchanges/${exchangeId}/accept`)
            const res = await api.get(`/exchanges/detail/${exchangeId}`)
            setExchange(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    const handleDecline = async () => {
        try {
            await api.put(`/exchanges/${exchangeId}/decline`)
            navigate('/dashboard')
        } catch (err) {
            console.error(err)
        }
    }

    const handleComplete = async () => {
        try {
            await api.put(`/exchanges/${exchangeId}/complete`)
            const res = await api.get(`/exchanges/detail/${exchangeId}`)
            setExchange(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    const getInitials = (name) => {
        if (!name) return '?'
        return name.charAt(0).toUpperCase()
    }

    const getAvatarColor = (name) => {
        if (!name) return '#B197FC'
        const colors = ['#B197FC', '#F9A8C9', '#B197FC', '#F9A8C9']
        return colors[name.charCodeAt(0) % colors.length]
    }

    const storedUser = localStorage.getItem('user')
    const currentUserId = storedUser ? JSON.parse(storedUser).id : null
    const isOwner = exchange?.request?.userId === currentUserId
    const isHelper = exchange?.helperId === currentUserId

    if (loading) return (
        <div className="min-h-screen bg-[#FDF8FF] flex items-center justify-center">
            <p className="text-[#B197FC] text-lg">Loading chat...</p>
        </div>
    )

    console.log('isOwner:', isOwner)
    console.log('exchange.request.userId:', exchange?.request?.userId)
    console.log('currentUserId', currentUserId)
    return (
        <div className="min-h-screen bg-[#FDF8FF] flex flex-col">

            {/* Navbar */}
            <Navbar />

            <div className="max-w-3xl mx-auto w-full px-4 py-6 flex flex-col flex-1">

                {/* Exchange info bar */}
                {exchange && (
                    <div className="bg-white rounded-2xl border border-[#e8d9ff] p-4 mb-4">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Task</p>
                                <h2 className="font-medium text-[#6b46c1]">{exchange.request?.title}</h2>
                                <p className="text-xs text-gray-400 mt-1">
                                    💰 {getCurrencySymbol(exchange.request?.currency)}{exchange.request?.price} · 📍 {exchange.request?.location}
                                </p>
                                <Link to={`/profile/${exchange.helper?.id}`} className="text-xs text-[#B197FC] hover:opacity-80 mt-1 inline-block">
                                    👤 {exchange.helper?.name}
                                </Link>
                            </div>

                            <div className="flex gap-2 flex-wrap">
                                {/* Owner action */}
                                {isOwner && exchange.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={handleAccept}
                                            className="bg-[#B197FC] text-white text-sm px-4 py-2 rounded-full hover:opacity-90">
                                                Accept helper
                                        </button>

                                        <button
                                            onClick={handleDecline}
                                            className="bg-red-100 text-red-500 text-sm px-4 py-2 rounded-full hover:opacity-90">
                                                Decline
                                        </button>
                                    </>
                                )}
                                {isOwner && exchange.status === 'in_progress' && (
                                    <button 
                                        onClick={handleComplete}
                                        className="bg-green-100 text-green-700 text-sm px-4 py-2 rounded-full hover:opacity-90">
                                            Mark as complete
                                    </button>
                                )}
                                {exchange.status === 'completed' && (
                                    <Link 
                                        to={`/review/${exchangeId}`}
                                        className="bg-[#F9A8C9] text-[#9d3a6a] text-sm px-4 py-2 rounded-full hover:opacity-90">
                                            Leave a review
                                    </Link>
                                )}

                                {/* Status badge */}
                                <span className={`text-xs px-3 py-2 rounded-full font-medium
                                ${exchange.status === 'pending' ? 'bg-blue-100 text-blue-700' : ''}
                                ${exchange.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' : ''}
                                ${exchange.status === 'completed' ? 'bg-gray-100 text-gray-500' : ''}
                                ${exchange.status === 'declined' ? 'bg-red-100 text-red-500': ''}`}>
                                    {exchange.status.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Messages */}
                <div className="flex-1 bg-white rounded-2xl border border-[#e8d9ff] p-4 overflow-y-auto mb-4 min-h-96">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <img src="/Logo.png" alt="mascot" className="w-18 h-30 mb-3 opacity-40" />
                            <p className="text-gray-400 text-sm">No message yet. Say hello!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map(msg => {
                                const isMe = msg.senderId === currentUserId                      
                                return (
                                    <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                        {/* Avatar */}
                                        {msg.sender?.avatar ? (
                                            <img
                                                src={msg.sender.avatar}
                                                alt="avatar"
                                                className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                                        ) : (
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
                                                style={{backgroundColor: getAvatarColor(msg.sender?.name)}}>
                                                    {getInitials(msg.sender?.name)}
                                            </div>
                                        )}

                                        {/* Bubble */}
                                        <div className={`max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'}`}>
                                            {!isMe && (
                                                <p className="text-xs text-gray-400 mb-1 ml-1">{msg.sender?.name}</p>
                                            )}
                                            <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                                                isMe
                                                    ? 'bg-[#B197FC] text-white rounded-br-sm'
                                                    : 'bg-[#F5F3FF] text-gray-700 rounded-bl-sm'
                                            }`}>
                                                {msg.content}
                                            </div>
                                            <p className="text-xs text-gray-300 mt-1 mx-1">
                                                {new Date(msg.createdAt).toLocaleTimeString([], {hour:'2-digit', minute: '2-digit'})}
                                            </p>
                                        </div>
                                    </div>
                                )
                        })}
                        <div ref={bottomRef} />
                        </div>
                    )}
                </div>

                {/* Input */}
                {exchange?.status !== 'declined' && exchange?.status !== 'completed' && (
                    <div className="flex gap-3 items-end">
                        <textarea
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message... (Enter to send)"
                            rows={1}
                            className="flex-1 border border-[#e8d9ff] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#B197FC] bg-white resize-none" />
                        
                        <button
                            onClick={sendMessage}
                            disabled={!newMessage.trim()}
                            className="bg-[#B197FC] text-white px-5 py-3 rounded-full hover:opacity-90 disabled:opacity-40 text-sm font-medium">
                                Send
                        </button>
                    </div>
                )}

                {exchange?.status === 'completed' && (
                    <p className="text-center text-sm text-gray-400">This exchange is completed.</p>
                )}
                {exchange?.status === 'declined' && (
                    <p className="text-center text-sm text-gray-400">This exchange was declined.</p>
                )}
            </div>
        </div>
    )
}