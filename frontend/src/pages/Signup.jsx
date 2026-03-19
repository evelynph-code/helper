import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "./Navbar";


export default function Signup() {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        location: '',
        bio: '',
    })
    const[error, setError] = useState('')
    const[loading,setLoading] = useState(false)

    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value})
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await api.post('/auth/signup', form)
            localStorage.setItem('token', res.data.token)
            localStorage.setItem('user', JSON.stringify(res.data.user))
            navigate('/verify-email')
        } catch (err) {
            setError(err.response?.data?.error || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#FDF8FF] flex flex-col">

            {/* Navbar */}
            <Navbar />

            {/* Signup Form */}
            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="bg-white rounded-2xl shadow-sm border border-[#e8d9ff] w-full max-w-md p-8">

                    <div className="text-center mb-8">
                        <img src="/Logo.png" alt="mascot" className="w-18 h-30 mx-auto mb-3" />
                        <h1 className="text-2xl font-medium text-[#6b46c1]">Join helper.</h1>
                        <p className="text-gray-400 text-sm mt-1">Create your account and start helping!</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-xl mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-[#6b46c1] block mb-1">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Jane Smith"
                                required
                                className="w-full border border-[#e8d9ff] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B197FC] bg-[#FDF8FF]"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-[#6b46c1] block mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="janesmith@example.com"
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
                                placeholder="**********"
                                required
                                className="w-full border border-[#e8d9ff] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B197FC] bg-[#FDF8FF]"
                            />
                            {form.password && (
                                <div className="space-y-1 mt-1">
                                    <div className="flex gap-1">
                                        <div className={`h-1 flex-1 rounded-full ${form.password.length >= 8 ? 'bg-[#B197FC]' : 'bg-gray-200'}`} />
                                        <div className={`h-1 flex-1 rounded-full ${/[A-zA-Z]/.test(form.password) && /[0-9]/.test(form.password) ? 'bg-[#B197FC]' : 'bg-gray-200'}`} />
                                        <div className={`h-1 flex-1 rounded-full ${form.password.length >= 12 ? 'bg-[#B197FC]' : 'bg-gray-200'}`} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className={`text-xs ${form.password.length >= 8 ? 'text-green-500' : 'text-red-400'}`}>
                                            {form.password.length >= 8 ? '✓' : '𐄂'} Must be at least 8 characters
                                        </p>
                                        <p className={`text-xs ${/[A-zA-Z]/.test(form.password) && /[0-9]/.test(form.password) ? 'text-green-500' : 'text-red-400'}`}>
                                            {/[A-zA-Z]/.test(form.password) && /[0-9]/.test(form.password) ? '✓' : '𐄂'} Must contain letters and numbers
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-[#6b46c1] block mb-1">Location</label>
                            <input
                                type="text"
                                name="location"
                                value={form.location}
                                onChange={handleChange}
                                placeholder="Memphis, TN"
                                required
                                className="w-full border border-[#e8d9ff] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B197FC] bg-[#FDF8FF]"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-[#6b46c1] block mb-1">Bio <span className="text-gray-400 font-normal">(optional)</span></label>
                            <textarea
                                name="bio"
                                value={form.bio}
                                onChange={handleChange}
                                placeholder="Tell people a little about yourself..."
                                rows={3}
                                className="w-full border border-[#e8d9ff] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B197FC] bg-[#FDF8FF] resize-none"
                            />
                        </div>
                        
                        <button
                            type="submit"
                            disabled={loading || form.password.length < 8 || !/[a-zA-Z]/.test(form.password) || !/[0-9]/.test(form.password)}
                            className="w-full bg-[#B197FC] text-white py-3 rounded-full font-medium hover:opacity-90 disabled:opacity-60 mt-2">
                                {loading ? "Creating account..." : "Create account"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-400 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-[#B197FC] font-medium hover:opacity-80">
                        Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}