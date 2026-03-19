import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "./Navbar";
import { getCurrencySymbol } from "../utils/currency";


export default function Dashboard() {
    const navigate = useNavigate()
    const [user,setUser] = useState(null)
    const [requests, setRequests] = useState([])
    const [exchanges, setExchanges] = useState([])
    const [loading, setLoading] = useState(true)
    const [pendingForMe, setPendingForMe] = useState([])
    const [activeForMe, setActiveForMe] = useState([])
    const [editingRequest, setEditingRequest] = useState(null)
    const [editForm, setEditForm] = useState({})

    useEffect(() => {
        const stored = localStorage.getItem('user')
        if (!stored) {navigate('/login'); return }
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [userRes, requestsRes, exchangesRes, pendingRes, activeRes] = await Promise.all([
                api.get('/users/me'),
                api.get('/requests'),
                api.get('/exchanges/me'),
                api.get('/exchanges/pending'),
                api.get('/exchanges/active'),
            ])
            setActiveForMe(activeRes.data)
            setUser(userRes.data)
            const myRequests = requestsRes.data.filter(r => r.userId === userRes.data.id)
            setRequests(myRequests)
            setExchanges(exchangesRes.data)
            setPendingForMe(pendingRes.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleDecline = async (exchangeId) => {
        try {
            await api.put(`/exchanges/${exchangeId}/decline`)
            fetchData()
        } catch (err) {
            console.error(err)
        }
    }

    const handleAccept = async (exchangeId) => {
        try {
            await api.put(`/exchanges/${exchangeId}/accept`)
            fetchData()
        } catch (err) {
            console.error(err)
        }
    }
    
    const handleEdit = async (requestId) => {
        try {
            await api.put(`/requests/${requestId}/edit`, editForm)
            setEditingRequest(null)
            fetchData()
        } catch (err) {
            console.error(err)
        }
    }

    const handleDelete = async (requestId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return
        try {
            await api.delete(`/requests/${requestId}`)
            setRequests(prev => prev.filter(r => r.id !== requestId))
        } catch (err) {
            console.error(err)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/')
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

    const statusColor = (status) => {
        if (status === 'open') return 'bg-green-100 text-green-700'
        if (status === 'pending') return 'bg-blue-100 text-blue-700'
        if (status === 'in_progress') return 'bg-yellow-100 text-yellow-700'
        if(status === 'completed') return 'bg-gray-100 text-gray-500'
        if (status === 'declined') return 'bg-red-100 text-red-500'
        return 'bg-gray-100 text-gray-500'
    }

    if (loading) return (
        <div className="min-h-screen bg-[#FDF8FF] flex items-center justify-center">
            <p className="text-[#B197FC] text-lg">Loading...</p>
        </div>
    )

    return (
        <div className="min-h-screen bg-[#FDF8FF]">

            {/* Navbar */}
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-10">

                {/* Profile card */}
                <div className="bg-white rounded-2xl border border-[#e8d9ff] p-6 mb-8 flex items-center gap-5">
                    {user?.avatar ? (
                        <img src={user.avatar} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                        <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-medium"
                        style={{backgroundColor: getAvatarColor(user?.name)}}>
                            {getInitials(user?.name)}
                        </div>
                    )}
                <div className="flex-1">
                    <h2 className="text-xl font-medium text-[#6b46c1]">{user?.name}</h2>
                    <p className="text-gray-400 text-sm">{user?.location}</p>
                    {user?.bio && <p className="text-gray-500 text-sm mt-1">{user.bio}</p>}
                </div>
                <Link to={`/profile/${user?.id}`} className="text-[#B197FC] text-sm font-medium hover:opacity-80">
                Edit profile
                </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-2xl border border-[#e8d9ff] p-5 text-center">
                        <p className="text-3xl font-medium text-[#6b46c1]">{requests.length}</p>
                        <p className="text-gray-400 text-sm mt-1">Tasks posted</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-[#e8d9ff] p-5 text-center">
                        <p className="text-3xl font-medium text-[#6b46c1]">{exchanges.length}</p>
                        <p className="text-gray-400 text-sm mt-1">Tasks helped</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-[#e8d9ff] p-5 text-center">
                        <p className="text-3xl font-medium text-[#6b46c1]">
                            {exchanges.filter(e => e.status === 'completed').length}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">Completed</p>
                    </div>
                </div>

                {/* Pending requests for my tasks */}
                {pendingForMe.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-lg font-medium text-[#6b46c1] mb-4">
                            🔔 People who want to help ({pendingForMe.length})
                        </h3>
                        <div className="space-y-3">
                            {pendingForMe.map(e => (
                                <div key={e.id} className="bg-white rounded-2xl border border-[#e8d9ff] p-5">
                                    <div className="flex items-center justify-between flex-wrap gap-3">
                                        <div>
                                            <p className="text-xs text-gray-400 mb-1">Task</p>
                                            <p className="font-medium text-gray-800">{e.request?.title}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                {e.helper?.avatar ? (
                                                    <img src={e.helper.avatar} className="w-7 h-7 rounded-full object-cover" />
                                                ) : (
                                                    <div
                                                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium"
                                                        style={{backgroundColor: getAvatarColor(e.helper?.name)}}>
                                                            {getInitials(e.helper?.name)}
                                                    </div>
                                                )}
                                                <Link to={`/profile/${e.helper?.id}`} className="text-sm text-gray-600 hover:text-[#B197FC]">{e.helper?.name}</Link>
                                                <span className="text-xs text-gray-400">{e.helper?.location}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <Link
                                                    to={`/chat/${e.id}`}
                                                    className="bg-[#F5F3FF] text-[#6b46c1] text-sm px-4 py-2 rounded-full hover:opacity-90">
                                                        💬 Chat
                                                </Link>
                                                <button
                                                    onClick={() => handleAccept(e.id)}
                                                    className="bg-[#B197FC] text-white text-sm px-4 py-2 rounded-full hover: opacity-90">
                                                        Accept
                                                </button>
                                                <button
                                                    onClick={() => handleDecline(e.id)}
                                                    className="bg-red-100 text-red-500 text-sm px-4 py-2 rounded-full hover:opacity-90">
                                                        Decline
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Acitve exchanges for my tasks */}
                {activeForMe.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-lg font-medium text-[#6b46c1] mb-4">
                            ⏳ Task in progress ({activeForMe.length})
                        </h3>
                        <div className="space-y-3">
                            {activeForMe.map(e => (
                                <div key={e.id} className="bg-white rounded-2xl border border-[#e8d9ff] p-5">
                                    <div className="flex items-center justify-between flex-wrap gap-3">
                                        <div>
                                            <p className="font-medium text-gray-800">{e.request?.title}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                {e.helper?.avatar ? (
                                                    <img src={e.helper.avatar} className="w-7 h-7 rounded-full object-cover" />
                                                ) : (
                                                    <div
                                                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium"
                                                        style={{backgroundColor: getAvatarColor(e.helper?.name)}}>
                                                            {getInitials(e.helper?.name)}
                                                    </div>
                                                )}
                                                <span className="text-sm text-gray-600">{e.helper?.name}</span>
                                            </div>
                                        </div>
                                        <Link 
                                            to={`/chat/${e.id}`}
                                            className="bg-[#F5F3FF] text-[#6b46c1] text-sm px-4 py-2 rounded-full hover:opacity-90">
                                                💬 Chat
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* My tasks */}
                {/* My tasks */}
                <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-[#6b46c1]">My tasks</h3>
                    <Link to="/create" className="text-[#B197FC] text-sm hover:opacity-80">+ New task</Link>
                </div>
                {requests.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-[#e8d9ff] p-8 text-center">
                    <p className="text-gray-400 text-sm">You haven't posted any tasks yet.</p>
                    <Link to="/create" className="text-[#B197FC] text-sm font-medium mt-2 inline-block hover:opacity-80">
                        Post your first task 👉
                    </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                    {requests.map(r => (
                        <div key={r.id} className="bg-white rounded-2xl border border-[#e8d9ff] p-5">
                        {editingRequest === r.id ? (
                            <div className="space-y-3">
                            <input
                                value={editForm.title}
                                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                className="w-full border border-[#e8d9ff] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#B197FC] bg-[#FDF8FF]"
                                placeholder="Task title"
                            />
                            <textarea
                                value={editForm.description}
                                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                rows={3}
                                className="w-full border border-[#e8d9ff] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#B197FC] bg-[#FDF8FF] resize-none"
                                placeholder="Description"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                value={editForm.location}
                                onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                                className="w-full border border-[#e8d9ff] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#B197FC] bg-[#FDF8FF]"
                                placeholder="Location"
                                />
                                <input
                                type="number"
                                value={editForm.price}
                                onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                                className="w-full border border-[#e8d9ff] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#B197FC] bg-[#FDF8FF]"
                                placeholder="Price"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                onClick={() => handleEdit(r.id)}
                                className="bg-[#B197FC] text-white text-sm px-4 py-2 rounded-full hover:opacity-90">
                                Save
                                </button>
                                <button
                                onClick={() => setEditingRequest(null)}
                                className="text-gray-400 text-sm px-4 py-2 rounded-full border border-[#e8d9ff] hover:opacity-80">
                                Cancel
                                </button>
                            </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-800">{r.title}</p>
                                <p className="text-gray-400 text-sm mt-1">{r.location}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[#6b46c1] font-medium">{getCurrencySymbol(r.currency)}{r.price}</span>
                                <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor(r.status)}`}>
                                {r.status.replace('_', ' ')}
                                </span>
                                {r.status === 'open' && (
                                <>
                                    <button
                                    onClick={() => { setEditingRequest(r.id); setEditForm({ title: r.title, description: r.description, location: r.location, price: r.price, paymentMethod: r.paymentMethod, currency: r.currency }) }}
                                    className="text-[#B197FC] text-xs hover:opacity-80">
                                    Edit
                                    </button>
                                    <button
                                    onClick={() => handleDelete(r.id)}
                                    className="text-red-400 text-xs hover:text-red-600">
                                    Delete
                                    </button>
                                </>
                                )}
                            </div>
                            </div>
                        )}
                        </div>
                    ))}
                    </div>
                )}
                </div>

                {/* My exchanges */}
                <div>
                    <h3 className="text-lg font-medium text-[#6b46c1] mb-4">Tasks I'm helping with</h3>
                    {exchanges.length == 0 ? (
                        <div className="bg-white rounded-2xl border border-[#e8d9ff] p-8 text-center">
                            <p className="text-gray-400 text-sm">You haven't taken any tasks yet.</p>
                            <Link to="/browse" className="text-[#B197FC] text-sm font-medium mt-2 inline-block hover:opacity-80">
                                Browse tasks 👉
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {exchanges.map(e => (
                                <div key={e.id} className="bg-white rounded-2xl border border-[#e8d9ff] p-5 flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-800">{e.request?.title}</p>
                                        <p className="text-gray-400 text-sm mt-1">{e.request?.location}</p>
                                    </div>
                                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor(e.status)}`}>
                                        {e.status.replace('_', ' ')}
                                    </span>
                                    <Link
                                        to={`/chat/${e.id}`}
                                        className="bg-[#F5F3FF] text-[#6b46c1] text-sm px-3 py-1.5 rounded-full hover: opacity-90 text-xs">
                                            💬 Chat
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}