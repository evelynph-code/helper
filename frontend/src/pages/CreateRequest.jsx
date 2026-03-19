import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "./Navbar";


export default function CreateRequest() {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        title: '',
        description: '',
        location: '',
        price: '',
        paymentMethod:'cash',
        currency: 'USD',
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value})
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await api.post('/requests', {
                ...form,
                price: parseFloat(form.price) || 0,
            })
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            navigate('/signup')
        }
    }, [])

    return (
        <div className="min-h-screen bg-[#FDF8FF] flex flex-col">

            {/* Navbar */}
            <Navbar />

            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="bg-white rounded-2xl shadow-sm border border-[#e8d9ff] w-full max-w-lg p-8">

                    <div className="text-center mb-8">
                        <img src="/Logo.png" alt="mascot" className="w-18 h-30 mx-auto mb-3" />
                        <h1 className="text-2xl font-medium text-[#6b46c1]">Post a task</h1>
                        <p className="text-gray-400 text-sm mt-1">Describe what you need help with</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-xl mb-6">
                            {error}
                        </div>
                    )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-[#6b46c1] block mb-1">Task title</label>
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="e.g. Need help moving furniture"
                            required
                            className="w-full border border-[#e8d9ff] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B197FC] bg-[#FDF8FF]"/>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-[#6b46c1] block mb-1">Description</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Describe what you need help with in detail..."
                            rows = {4}
                            required
                            className="w-full border border-[#e8d9ff] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B197FC] bg-[#FDF8FF] resize-none" />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-[#6b46c1] block mb-1">Location</label>
                        <input
                            type="text"
                            name="location"
                            value={form.location}
                            onChange={handleChange}
                            placeholder="e.g. Memphis, TN"
                            required
                            className="w-full border border-[#e8d9ff] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B197FC] bg-[#FDF8FF]" />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium text-[#6b46c1] block mb-1">Price</label>
                        <input
                            type="number"
                            name="price"
                            value={form.price}
                            onChange={handleChange}
                            placeholder="0.00"
                            min="0"
                            step="0.25"
                            required
                            className="w-full border border-[#e8d9ff] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B197FC] bg-[#FDF8FF]" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-[#6b46c1] block mb-1">Currency</label>
                            <select 
                                name="currency"
                                value={form.currency}
                                onChange={handleChange}
                                className="w-full border border-[#e8d9ff] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B197FC] bg-[#FDF8FF]">
                                    <option value="USD">🇺🇸 USD ($)</option>
                                    <option value="EUR">🇪🇺 EUR (€)</option>
                                    <option value="GBP">🇬🇧 GBP (£)</option>
                                    <option value="CAD">🇨🇦 CAD ($)</option>
                                    <option value="AUD">🇦🇺 AUD ($)</option>
                                    <option value="RUB">🇷🇺 RUB (₽)</option>
                                    <option value="JPY">🇯🇵 JPY (¥)</option>
                                    <option value="CNY">🇨🇳 CNY (¥)</option>
                                    <option value="MYR">🇲🇾 MYR (RM)</option>
                                    <option value="SGD">🇸🇬 SGD ($)</option>
                                    <option value="INR">🇮🇳 INR (₹)</option>
                                    <option value="NGN">🇳🇬 NGN (₦)</option>
                                    <option value="BRL">🇧🇷 BRL (R$)</option>
                                    <option value="MXN">🇲🇽 MXN ($)</option>
                                    <option value="VND">🇻🇳 VND (₫)</option>
                            </select>
                        </div>
                        <div>
                        <label className="text-sm font-medium text-[#6b46c1] block mb-1">Payment method</label>
                        <select
                            name="paymentMethod"
                            value={form.paymentMethod}
                            onChange={handleChange}
                            className="w-full border border-[#e8d9ff] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B197FC] bg-[#FDF8FF]">
                                <option value="cash">💵 Cash</option>
                                <option value="online">💳 Online</option>
                                <option value="either">🤝 Either</option>
                            </select>
                        </div>  
                    </div> 

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#B197FC] text-white py-3 rounded-full font-medium hover:opacity-90 disabled:opacity-60 mt-2">
                            {loading ? 'Posting...' : 'Post task'}
                    </button>

                    <Link
                        to="/dashboard"
                        className="block text-center text-sm text-gray-400 hover:text-[#B197FC] mt-2">
                            Cancel
                    </Link>
                </form>
                    
                </div>
            </div>
        </div>
    )
}