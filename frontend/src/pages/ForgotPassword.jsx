import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "./Navbar";


export default function ForgotPassword() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [email, setEmail] = useState('')
    const [code, setCode] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleRequestCode = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await api.post('/auth/forgot-password', {email})
            setStep(2)
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    const handleResetPassword = async (e) => {
        e.preventDefault()
        setError('')
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match')
            return
        }
        setLoading(true)
        try {
            await api.post('/auth/reset-password', {email, code, newPassword})
            setSuccess('Password reset successfully!')
            setTimeout(() => navigate('/login'), 2000)
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#FDF8FF] flex flex-col">
            <Navbar />

            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="bg-white rounded-2xl shadow-sm border border-[#e8d9ff] w-full max-w-md p-8">

                    <div className="text-center mb-8">
                        <img src="/Logo.png" alt="mascot" className="w-18 h-30 mx-auto mb-3" />
                        <h1 className="text-2xl font-medium text-[#6b46c1]">
                            {step === 1 ? 'Forgot password?' : 'reset password'}
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">
                            {step === 1
                                ? 'Enter your email and we will send you a reset code'
                                : `We sent a code to ${email}`}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-xl mb-6">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-xl mb-6">
                            {success}
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleRequestCode} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-[#6b46c1] block mb-1">Email</label>
                                <input 
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full border border-[#e8d9ff] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B197FC] bg-[#FDF8FF]" />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#B197FC] text-white py-3 rounded-full font-medium hover:opacity-90 disabled:opacity-60">
                                    {loading ? 'Sending' : 'Send reset code'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-[#6b46c1] block mb-1">Reset code</label>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0,6))}
                                    placeholder="123456"
                                    maxLength={6}
                                    required
                                    className="w-full border border-[#e8d9ff] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B197FC] bg-[#FDF8FF] text-center text-2xl tracking-widest font-medium" />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-[#6b46c1] block mb-1">New password</label>
                                <input 
                                    type="password"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    placeholder="*********"
                                    required
                                    className="w-full border border-[#e8d9ff] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B197FC] bg-[#FDF8FF]" />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-[#6b46c1] block mb-1">Confirm password</label>
                                <input 
                                    type="password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    placeholder="*********"
                                    required
                                    className="w-full border border-[#e8d9ff] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B197FC] bg-[#FDF8FF]" />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || code.length !== 6}
                                className="w-full bg-[#B197FC] text-white py-3 rounded-full font-medium hover:opacity-90 disabled:opacity-60">
                                    {loading ? 'Resetting...' : 'Reset password'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full text-center text-sm text-gray-400 hover:text-[#B197FC]">
                                    Use a different email
                            </button>
                        </form>
                    )}

                    <p className="text-center text-sm text-gray-400 mt-6">
                        Remember your password?{' '}
                        <Link to="/login" className="text-[#B197FC] font-medium hover:opacity-80">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}