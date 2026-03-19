import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";


export default function Navbar() {
    const navigate = useNavigate()
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user')
        return stored ? JSON.parse(stored) : null
    })

    useEffect(() => {
        const handleStorage = () => {
            const stored = localStorage.getItem('user')
            setUser(stored ? JSON.parse(stored) : null)
        }
        window.addEventListener('storage', handleStorage)
        window.addEventListener('userUpdated', handleStorage)
        return () => {
            window.removeEventListener('storage', handleStorage)
            window.removeEventListener('userUpdated', handleStorage)
        }
    }, [])

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

    return (
        <nav className="bg-[#B197FC] px-6 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
                <img src="/Logo.png" alt="helper mascot" className="w-10 h-15" />
                <span className="text-white text-2xl font-medium tracking-tight">helper.</span>
            </Link>

            <div className="flex items-center gap-4">
                <Link to="/browse" className="text-white text-sm hover:opacity-80">Browse</Link>

                {user ? (
                    <>
                        <Link to="/dashboard" className="text-white text-sm hover:opacity-80">Dashboard</Link>
                        <Link to="/create" className="bg-[#F9A8C9] text-[#9d3a6a] text-sm font-medium px-4 py-2 rounded-full hover:opacity-90">
                            + Post task
                        </Link>
                        <Link to={`/profile/${user.id}`} className="flex items-center gap-2 hover:opacity-90">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt="avatar"
                                    className="w-8 h-8 rounded-full object-cover border-2 border-white" />
                            ) : (
                                <div 
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                                    style={{backgroundColor: getAvatarColor(user.name)}}>
                                        {getInitials(user.name)}
                                </div>
                            )}
                        </Link>
                        <button onClick={handleLogout} className="text-white text-sm hover:opacity-80">
                            Log out
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="text-white text-sm hover:opacity-80">Sign in</Link>
                        <Link to="/signup" className="bg-[#F9A8C9] text-[#9d3a6a] text-sm font-medium px-4 py-2 rounded-full hover:opacity-90">
                            Join now
                        </Link>
                    </>
                )}
            </div>
        </nav>
    )
}