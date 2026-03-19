import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import Navbar from "./Navbar";


export default function Profile(){
    const {id} = useParams()
    const navigate = useNavigate()
    const [profile, setProfile] = useState(null)
    const [reviews, setReviews] = useState([])
    const [reviewTab, setReviewTab] = useState('received')
    const [reviewsGiven, setReviewsGiven] = useState([])
    const [loading, setLoading] = useState(true)
    const [isOwn, setIsOwn] = useState(false)
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({name: '', location:'', bio:''})
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [addingSkill, setAddingSkill] = useState(false)
    const [addingSkillLoading, setAddingSkillLoading] = useState(false)
    const [skillForm, setSkillForm] = useState({name: '', description: ''})

    useEffect (() => {
        const stored = localStorage.getItem('user')
        if (stored) {
            const me = JSON.parse(stored)
            setIsOwn(me.id === id)
        }
        fetchProfile()
        fetchReviews()
        fetchReviewsGiven()
    }, [id])

    const fetchProfile = async () => {
        try {
            const res = await api.get(`/users/${id}`)
            setProfile(res.data)
            setForm({name: res.data.name, location: res.data.location, bio: res.data.bio || ''})
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const fetchReviews = async () => {
        try {
            const res = await api.get(`/reviews/user/${id}`)
            setReviews(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    const fetchReviewsGiven = async () => {
        try {
            const res = await api.get(`/reviews/given/${id}`)
            setReviewsGiven(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        setError('')
        try {
            const res = await api.put('/users/me', form)
            setProfile({...profile, ...res.data})
            setEditing(false)
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong')
        } finally {
            setSaving(false)
        }
    }

    const handleAddSkill = async () => {
        if (!skillForm.name.trim()) return
        setAddingSkillLoading(true)
        try {
            const res = await api.post('/skills', skillForm)
            setProfile({...profile, skills: [...(profile.skills || []), res.data]})
            setSkillForm({name: '', description: ''})
            setAddingSkill(false)
        } catch (err) {
            console.error(err)
        } finally {
            setAddingSkillLoading(false)
        }
    }

    const handleDeleteSkill = async (skillId) => {
        try {
            await api.delete(`/skills/${skillId}`)
            setProfile({...profile, skills: profile.skills.filter(s => s.id !== skillId)})
        } catch (err) {
            console.error(err)
        }
    }

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        const formData = new FormData()
        formData.append('avatar',file)
        try {
            const res = await api.post('/users/me/avatar', formData, {
                headers:{'Content-Type': 'multipart/form-data'},
            })
            const updatedUser = {...JSON.parse(localStorage.getItem('user')), avatar: res.data.avatar}
            localStorage.setItem('user', JSON.stringify(updatedUser))
            window.dispatchEvent(new Event('userUpdated'))
            setProfile({...profile, avatar: res.data.avatar})
        } catch (err) {
            console.error(err)
        }
    }

    const getInitials = (name) => {
        if (!name) return '?'
        return name.charAt(0).toUpperCase()
    }

    const getAvatarColor = (name) => {
        if(!name) return '#B197FC'
        const colors = ['#B197FC', '#F9A8C9', '#B197FC', '#F9A8C9']
        return colors[name.charCodeAt(0) % colors.length]
    }

    const avgRating = reviews.length
    ? (reviews.reduce((sum,r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

    if (loading) return (
        <div className="min-h-screen bg-[#FDF8FF] flex items-center justify-center">
            <p className="text-[#B197FC] text-lg">Loading...</p>
        </div>
    )
    
    return (
        <div className="min-h-screen bg-[#FDF8FF]">
            {/* Navbar */}
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 py-10">

                {/* Profile card */}
                <div className="bg-white rounded-2xl border border-[#e8d9ff] p-8 mb-6">
                    <div className="flex items-start gap-6">

                        {/* Avatar */}
                        <div className="relative">
                            {profile?.avatar ? (
                                <img 
                                    src={profile?.avatar}
                                    alt="avatar"
                                    className="w-20 h-20 rounded-full object-cover" />
                            ) : (
                            <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-medium"
                                style={{backgroundColor: getAvatarColor(profile?.name)}}>
                                    {getInitials(profile?.name)}
                            </div>
                            )}
                            {isOwn && (
                                <label className="absolute bottom-0 right-0 bg-[#F9A8C9] rounded-full w-7 h-7 flex items-center justify-center cursor-pointer hover:opacity-90">
                                    <span className="text-xs">📷</span>
                                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                                </label>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            {editing ? (
                                <div className="space-y-3">
                                    {error && <p className="text-red-500 text-sm">{error}</p>}
                                    <input
                                        value={form.name}
                                        onChange={e => setForm({...form, name: e.target.value})}
                                        className="w-full border border-[#e8d9ff] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#B197FC] bg-[#FDF8FF]"
                                        placeholder="Your name" />

                                    <input
                                        value={form.location}
                                        onChange={e => setForm({...form, location: e.target.value})}
                                        className="w-full border border-[#e8d9ff] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#B197FC] bg-[#FDF8FF]"
                                        placeholder="Your location" />

                                    <textarea
                                        value={form.bio}
                                        onChange={e => setForm({...form, bio: e.target.value})}
                                        className="w-full border border-[#e8d9ff] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#B197FC] bg-[#FDF8FF]"
                                        placeholder="Tell people about yourself..." />

                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="bg-[#B197FC] text-white text-sm px-5 py-2 rounded-full hover:opacity-90 disabled:opacity-60">
                                                {saving ? 'Saving...' : "Save"}
                                        </button>
                                        
                                        <button
                                            onClick={() => setEditing(false)}
                                            className="text-gray-400 text-sm px-5 py-2 rounded-full border border-[#e8d9ff] hover:opacity-80">
                                                Cancel
                                        </button>
                                    </div>
                                </div>
                            ): (
                                <div>
                                    <div className="flex items-center justify-between">
                                        <h1 className="text-2xl font-medium text-[#6b46c1]">{profile?.name}</h1>
                                        {isOwn && (
                                            <button
                                                onClick={() => setEditing(true)}
                                                className="text-[#B197FC] text-sm font-medium hover:opacity-80">
                                                    Edit profile
                                                </button>
                                        )}
                                    </div>
                                    <p className="text-gray-400 text-sm mt-1">📍 {profile?.location}</p>
                                    {profile?.bio && <p className="text-gray-500 text-sm mt-2">{profile.bio}</p>}
                                    {avgRating && (
                                        <p className="text-sm mt-2">
                                            ⭐️ <span className="font-medium text-[#6b46c1]">{avgRating}</span>
                                            <span className="text-gray-400"> ({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="mt-6 pt-6 border-t border-[#e8d9ff]">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium text-[#6b46c1]">Skills</h3>
                            {isOwn && (
                                <button
                                    onClick={() => setAddingSkill(!addingSkill)}
                                    className="text-xs text-[#B197FC] hover:opacity-80 font-medium">
                                        {addingSkill ? 'Cancel' : '+ Add skill'}
                                </button>
                            )}
                        </div>

                        {/* Add skill form */}
                        {isOwn && addingSkill && (
                            <div className="bg-[#F5F3FF] rounded-xl p-4 mb-4 space-y-2">
                                <input
                                    value={skillForm.name}
                                    onChange={e => setSkillForm({...skillForm, name: e.target.value})}
                                    placeholder="Skill name e.g. Gardening"
                                    className="w-full border border-[#e8d9ff] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#B197FC] bg-white" />

                                <input
                                    value={skillForm.description}
                                    onChange={e => setSkillForm({...skillForm, description: e.target.value})}
                                    placeholder="Short description (optional)"
                                    className="w-full border border-[#e8d9ff] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#B197FC] bg-white" />

                                <button
                                    onClick={handleAddSkill}
                                    disabled={addingSkillLoading}
                                    className="bg-[#B197FC] text-white text-sm px-4 py-2 rounded-full hover:opacity-90 disabled:opacity-60">
                                        {addingSkillLoading ? 'Adding...' : 'Add skill'}
                                </button>
                            </div>
                        )}

                        {/* Skills list */}
                        {profile?.skills?.length === 0 && !isOwn && (
                            <p className="text-gray-400 text-sm">No skills listed yet.</p>
                        )}
                        <div className="flex flex-wrap gap-2">
                            {profile?.skills?.map(skill => (
                                <div key={skill.id} className="flex items-center gap-1 bg-[#F5F3FF] text-[#6b46c1] text-xs px-3 py-1.5 rounded-full">
                                    <span>{skill.name}</span>
                                    {isOwn && (
                                        <button
                                            onClick={() => handleDeleteSkill(skill.id)}
                                            className="ml-1 text-[#B197FC] hover:text-red-400 font-medium">
                                                ⨯
                                        </button>
                                    )}
                                </div>
                            ))}
                            {profile?.skills?.length === 0 && isOwn && (
                                <p className="text-gray-400 text-sm">No skills yet! Add your first skill!</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Reviews */}
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <h2 className="text-lg font-medium text-[#6b46c1]">Reviews</h2>
                        <div className="flex bg-[#F5F3FF] rounded-full p-1 gap-1">
                            <button 
                                onClick={() => setReviewTab('received')}
                                className={`text-xs px-4 py-1.5 rounded-full font-medium transition-all ${
                                    reviewTab === 'received'
                                    ? 'bg-[#B197FC] text-white'
                                    : 'text-[#6b46c1] hover:opacity-80'
                                }`}>
                                    Received ({reviews.length})
                            </button>
                            <button 
                                onClick={() => setReviewTab('given')}
                                className={`text-xs px-4 py-1.5 rounded-full font-medium transition-all ${
                                    reviewTab === 'given'
                                    ? 'bg-[#B197FC] text-white'
                                    : 'text-[#6b46c1] hover:opacity-80'
                                }`}>
                                Given ({reviewsGiven.length})
                            </button>
                        </div>
                    </div>

                    {reviewTab === 'received' && (
                        reviews.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-[#e8d9ff] p-8 text-center">
                                <p className="text-gray-400 text-sm">No reviews received yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {reviews.map(r => (
                                    <div key={r.id} className="bg-white rounded-2xl border border-[#e8d9ff] p-5">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {r.reviewer?.avatar ? (
                                                    <img src={r.reviewer.avatar} className="w-8 h-8 rounded-full object-cover" />
                                                ) : (
                                                <div
                                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                                                    style={{backgroundColor: '#B197FC'}}>
                                                    {r.reviewer?.name?.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                                <span className="text-sm font-medium text-gray-700">{r.reviewer?.name}</span>
                                            </div>
                                            <span className="text-sm text-[#F9A8C9] font-medium">
                                                {'⭑'.repeat(r.rating)}{'✩'.repeat(5-r.rating)}
                                            </span>
                                        </div>
                                        {r.comment && <p className="text-gray-500 text-sm">{r.comment}</p>}
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {reviewTab === 'given' && (
                        reviewsGiven.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-[#e8d9ff] p-8 text-center">
                                <p className="text-gray-400 text-sm">No reviews given yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {reviewsGiven.map(r => (
                                    <div key={r.id} className="bg-white rounded-2xl border border-[#e8d9ff] p-5">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {r.reviewee?.avatar ? (
                                                    <img src={r.reviewee.avatar} className="w-8 h-8 rounded-full object-cover" />
                                                ) : (
                                                    <div    
                                                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                                                        style={{backgroundColor: '#F9A8C9'}}>
                                                            {r.reviewee?.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <span className="text-sm font-medium text-gray-700">{r.reviewee?.name}</span>
                                            </div>
                                            <span className="text-sm text-[#F9A8C9] font-medium">
                                                {'⭑'.repeat(r.rating)}{'✩'.repeat(5-r.rating)}
                                            </span>
                                        </div>
                                        {r.comment && <p className="text-gray-500 text-sm">{r.comment}</p>}
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    )
}