import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import Navbar from "./Navbar";


export default function Review() {
    const {exchangeId} = useParams()
    const navigate = useNavigate()
    const [exchange, setExchange] = useState(null)
    const [rating, setRating] = useState(0)
    const [hovered, setHovered] = useState(0)
    const [comment, setComment] = useState('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [me, setMe] = useState(null)

    useEffect(() => {
        const stored = localStorage.getItem('user')
        if (!stored) {navigate('/login'); return}
        setMe(JSON.parse(stored))
        fetchExchange()
    }, [])

    const fetchExchange = async () => {
        try {
            const res = await api.get(`/exchanges/detail/${exchangeId}`)
            setExchange(res.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (rating === 0) {
            setError('Please select a rating')
            return
        }
        setSubmitting(true)
        setError('')
        try{
            await api.post('/reviews', {exchangeId, rating, comment})
            navigate(`/chat/${exchangeId}`)
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong')
        }finally {
            setSubmitting(false)
        }
    }

    const storedUser = localStorage.getItem('user')
    const currentUserId = storedUser ? JSON.parse(storedUser).id : null
    const isOwner = exchange?.request?.userId === currentUserId
    const revieweeName = isOwner ? exchange?.helper?.name : exchange?.request?.user?.name

    if (loading) return (
        <div className="min-h-screen bg-[#FDF8FF] flex items-center justify-center">
            <p className="text-[#B197FC] text-lg">Loading...</p>
        </div>
    )

    return (
        <div className="min-h-screen bg-[#FDF8FF] flex flex-col">

            {/* Navbar */}
            <Navbar />

            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="bg-white rounded-2xl shadow-sm border border-[#e8d9ff] w-full max-w-md p-8">

                    <div className="text-center mb-8">
                        <img src="/Logo.png" alt="mascot" className="w-18 h-30 mx-auto mb-3" />
                        <h1 className="text-2xl font-medium text-[#6b46c1]">Leave a review</h1>
                        {revieweeName && (
                            <p className="text-gray-400 text-sm mt-1">
                                How was your experience with <span className="text-[#6b46c1] font-medium">{revieweeName}</span>?
                            </p>
                        )}
                        {exchange && (
                            <p className="text-xs text-gray-400 mt-1">Task: {exchange.request?.title}</p>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-xl mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Star rating */}
                        <div className="text-center">
                            <p className="text-sm font-medium text-[#6b46c1] mb-3">Rating</p>
                            <div className="flex justify-center gap-2">
                                {[1,2,3,4,5].map(star => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHovered(star)}
                                        onMouseLeave={() => setHovered(0)}
                                        className="text-4xl transition-transform hover:scale-110">
                                            <span style={{color: star <= (hovered || rating) ? "#F9A8C9" : "#e8d9ff"}}>
                                                ★
                                            </span>
                                     </button>
                                ))}
                            </div>
                            {rating > 0 && (
                                <p className="text-sm text-gray-400 mt-2">
                                    {rating === 1 && 'Poor'}
                                    {rating === 2 && 'Fair'}
                                    {rating === 3 && 'Good'}
                                    {rating === 4 && 'Very good'}
                                    {rating === 5 && "Excellent!"}
                                </p>
                            )}
                        </div>

                        {/* Commnent */}
                        <div>
                            <label className="text-sm font-medium text-[#6b46c1] block mb-1">
                                Comment <span className="text-gray-400 font-normal">(Optional)</span>
                            </label>
                            <textarea
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                placeholder="Share your experience..."
                                rows={4}
                                className="w-full border border-[#e8d9ff] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B197FC] bg-[#FDF8FF] resize-none" />
                        </div>

                        <button 
                            type="submit"
                            disabled={submitting || rating === 0}
                            className="w-full bg-[#B197FC] text-white py-3 rounded-full font-medium hover:opacity-90 disabled:opacity-60">
                                {submitting ? 'Submitting...' : 'Submit review'}
                        </button>

                        <Link 
                            to={`/chat/${exchangeId}`}
                            className="block text-center text-sm text-gray-400 hover:text-[#B197FC]">
                                Skip for now
                        </Link>
                    </form>
                </div>
            </div>
        </div>
    )
}