import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "./Navbar";


export default function VerifyEmail() {
    const navigate = useNavigate()
    const [code, setCode] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [resending, setResending] = useState(false)
    const [resent, setResent] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await api.post('/auth/verify', {code})
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        setResending(true)
        setResent(true)
        try {
            await api.post('/auth/resend-verification')
            setResent(true)
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong')
        } finally {
            setResending(false)
        }
    }

    return (
        <div classname="min-h-screen bg-[#FDF8FF] flex flex-col">
            <Navbar />

            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="bg-white rounded-2xl shadow-sm border border-[#e8f9ff] w-full max-w-md p-8">
                    <div className="text-center mb-8">
                        <img src="/Logo.png" alt="mascot" className="w-18 h-30 mx-auto mb-3" />
                        <h1 className="text-2xl font-medium text-[#6b46c1]">Verify your email</h1>
                        <p ckassName="text-gray-400 text-sm mt-1">
                            We sent you a 6-digit code to your email. Enter it below.
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-xl mb-6">
                            {error}
                        </div>
                    )}

                    {resent && (
                        <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-xl mb-6">
                            Code resent! Check your email.
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-[#6b46c1] block mb-1">Verification code</label>
                            <input 
                                type="text"
                                value={code}
                                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0,6))}
                                placeholder="123456"
                                maxLength={6}
                                required
                                className="w-full border border-[#e8d9ff] rounded-xl px-4 py-3 text-sm focus:outline-none focus: border-[#B197FC] bg-[#FDF8FF] text-center text-2xl tracking-widest font-medium" />
                        </div>

                        <button
                            type="submt"
                            disabled={loading || code.length != 6}
                            className="w-full bg-[#B197FC] text-white py-3 rounded-full font-medium hover:opacity-90 disabled:opacity-60">
                                {loading ? 'Verifying...' : 'Verify email'}
                        </button>
                    </form>

                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-400">
                            Didn't receive the code? {' '}
                            <button 
                                onClick={handleResend}
                                disabled={resending}
                                className="text-[#B197FC] font-medium hover:opacity-80 disabled:opacity-60">
                                    {resending ? 'Resending...' : 'Resend code'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}