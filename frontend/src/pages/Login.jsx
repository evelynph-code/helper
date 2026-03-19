import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "./Navbar";


export default function Login() {
    const navigate = useNavigate()
    const [form, setForm] = useState({email: '', password: ''})
    const [error, setError] =useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value})
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await api.post('/auth/login', form)
            localStorage.setItem('token', res.data.token)
            localStorage.setItem('user', JSON.stringify(res.data.user))
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#FDF8FF] flex flex-col">

            {/* Navbar */}
            <Navbar />

            {/* Login form */}
            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="bg-white rounded-2xl shadow-sm border border-[#e8d9ff] w-full max-w-md p-8">
                    <div className="text-center mb-8">
                        <img src="/Logo.png" alt="mascot" className="w-18 h-32 mx-auto mb-3" />
                        <h1 className="text-2xl font-medium text-[#6b46c1]">Welcome back!</h1>
                        <p className="text-gray-400 text-sm mt-1">Sign in to your helper. account</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-xl mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-[#6b46c1] block mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="John@example.com"
                                required
                                className="w-full border border-[#e8d9ff] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B197FC] bg-[#FDF8FF]"
                                />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-[#6b46c1] block mb-1">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="*********"
                                required
                                className="w-full border border-[#e8d9ff] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B197FC] bg-[#FDF8FF]"
                            />
                            <p className="text-right">
                                <Link to="/forgot-password" className="text-xs text-[#B197FC] hover:opacity-80">
                                    Forgot password?
                                </Link>
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#B197FC] text-white py-3 rounded-full font-medium hover:opacity-90 disabled:opacity-60 mt-2">
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                    </form>

                    <p className="text-center text-sm text-gray-400 mt-6">
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-[#B197FC] font-medium hover:opacity-80">
                        Join Now
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}