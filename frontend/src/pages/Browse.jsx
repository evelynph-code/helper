import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Navbar from './Navbar'

export default function Browse() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [volunteering, setVolunteering] = useState(null)
  const [volunteeredIds, setVolunteeredIds] = useState([])
  const [message, setMessage] = useState('')

  // Filters
  const [status, setStatus] = useState('all')
  const [locationSearch, setLocationSearch] = useState('')
  const [citySuggestions, setCitySuggestions] = useState([])
  const [currency, setCurrency] = useState('all')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const cityTimeout = useRef(null)

  useEffect(() => { fetchRequests() }, [])

  useEffect(() => {
    applyFilters()
  }, [requests, status, locationSearch, minPrice, maxPrice, sortBy, currency])

  const fetchRequests = async () => {
    try {
      const [requestsRes, exchangesRes] = await Promise.all([
        api.get('/requests'),
        localStorage.getItem('token') ? api.get('/exchanges/me') : Promise.resolve({data: []})
      ])
      setRequests(requestsRes.data)
      const myExchangeRequestIds = exchangesRes.data.map(e => e.request?.id).filter(Boolean)
      setVolunteeredIds(myExchangeRequestIds)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let result = [...requests]

    if (status !== 'all') {
      result = result.filter(r => r.status === status)
    }

    if (currency !== 'all') {
      result = result.filter(r => r.currency === currency)
    }

    if (locationSearch) {
      result = result.filter(r =>
        r.location.toLowerCase().includes(locationSearch.toLowerCase())
      )
    }

    if (minPrice !== '') {
      result = result.filter(r => r.price >= parseFloat(minPrice))
    }

    if (maxPrice !== '') {
      result = result.filter(r => r.price <= parseFloat(maxPrice))
    }

    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    } else if (sortBy === 'price_low') {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price_high') {
      result.sort((a, b) => b.price - a.price)
    }

    setFiltered(result)
  }

  const handleCityInput = (val) => {
    setLocationSearch(val)
    setCitySuggestions([])
    if (cityTimeout.current) clearTimeout(cityTimeout.current)
    if (val.length < 2) return
    cityTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${val}&limit=5&sort=-population`,
          {
            headers: {
              'X-RapidAPI-Key': 'demo',
              'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com',
            },
          }
        )
        const data = await res.json()
        if (data.data) {
          setCitySuggestions(data.data.map(c => `${c.city}, ${c.countryCode}`))
        }
      } catch {
        setCitySuggestions([])
      }
    }, 400)
  }

  const getCurrencySymbol = (currency) => {
    const symbols = {
      USD: '$', EUR: '€', GBP: '£', CAD: '$', AUD: '$',
      RUB: '₽',  JPY: '¥', CNY: '¥', MYR: 'RM', SGD: '$',
      INR: '₹', NGN: '₦', BRL: 'R$', MXN: '$', VND: '₫'
    }
    return symbols[currency] || '$'
  }

  const handleVolunteer = async (requestId) => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    setVolunteering(requestId)
    try {
      await api.post('/exchanges', { requestId })
      setMessage('You offer to help has been sent!')
      fetchRequests()
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong'
      if (msg.includes('already')) {
        setVolunteeredIds(prev => [...prev, requestId])
      }
      setMessage(msg)
    } finally {
      setVolunteering(null)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const statusColor = (status) => {
    if (status === 'open') return 'bg-green-100 text-green-700'
    if (status === 'in_progress') return 'bg-yellow-100 text-yellow-700'
    if (status === 'completed') return 'bg-gray-100 text-gray-500'
    return 'bg-gray-100 text-gray-500'
  }

  if (loading) return (
    <div className="min-h-screen bg-[#FDF8FF] flex items-center justify-center">
      <p className="text-[#B197FC] text-lg">Loading tasks...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FDF8FF]">

      {/* Navbar */}
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-medium text-[#6b46c1]">Browse tasks</h1>
          <p className="text-gray-400 mt-1">Find something you can help with nearby</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-[#e8d9ff] p-5 mb-6 space-y-4">

          {/* Location */}
          <div className="relative">
            <label className="text-xs font-medium text-[#6b46c1] block mb-1">Location</label>
            <input
              type="text"
              value={locationSearch}
              onChange={e => handleCityInput(e.target.value)}
              placeholder="Search a city..."
              className="w-full border border-[#e8d9ff] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#B197FC] bg-[#FDF8FF]"
            />
            {citySuggestions.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-[#e8d9ff] rounded-xl mt-1 shadow-sm">
                {citySuggestions.map((city, i) => (
                  <button
                    key={i}
                    onClick={() => { setLocationSearch(city); setCitySuggestions([]) }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-[#F5F3FF] first:rounded-t-xl last:rounded-b-xl"
                  >
                    📍 {city}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

            {/* Status */}
            <div>
              <label className="text-xs font-medium text-[#6b46c1] block mb-1">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full border border-[#e8d9ff] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#B197FC] bg-[#FDF8FF]"
              >
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="in_progress">In progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Min price */}
            <div>
              <label className="text-xs font-medium text-[#6b46c1] block mb-1">Min price</label>
              <input
                type="number"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full border border-[#e8d9ff] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#B197FC] bg-[#FDF8FF]"
              />
            </div>

            {/* Max price */}
            <div>
              <label className="text-xs font-medium text-[#6b46c1] block mb-1">Max price</label>
              <input
                type="number"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                placeholder="Any"
                min="0"
                className="w-full border border-[#e8d9ff] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#B197FC] bg-[#FDF8FF]"
              />
            </div>

            {/* Currency */}
            <div>
              <label className="text-xs font-medium text-[#6b46c1] block mb-1">Currency</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full border border-[#e8d9ff] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#B197FC] bg-[#FDF8FF]">
                  <option value="all">All currencies</option>
                  <option value="USD"> USD ($)</option>
                  <option value="EUR"> EUR (€)</option>
                  <option value="GBP"> GBP (£)</option>
                  <option value="CAD"> CAD ($)</option>
                  <option value="AUD"> AUD ($)</option>
                  <option value="RUB"> RUB (₽)</option>
                  <option value="JPY"> JPY (¥)</option>
                  <option value="CNY"> CNY (¥)</option>
                  <option value="MYR"> MYR (RM)</option>
                  <option value="SGD"> SGD ($)</option>
                  <option value="INR"> INR (₹)</option>
                  <option value="NGN"> NGN (₦)</option>
                  <option value="BRL"> BRL (R$)</option>
                  <option value="MXN"> MXN ($)</option>
                  <option value="VND"> VND (₫)</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="text-xs font-medium text-[#6b46c1] block mb-1">Sort by</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full border border-[#e8d9ff] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#B197FC] bg-[#FDF8FF]"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="price_low">Price: low to high</option>
                <option value="price_high">Price: high to low</option>
              </select>
            </div>
          </div>

          {/* Clear filters */}
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-gray-400">{filtered.length} task{filtered.length !== 1 ? 's' : ''} found</p>
            <button
              onClick={() => { setStatus('all'); setLocationSearch(''); setMinPrice(''); setMaxPrice(''); setSortBy('newest'); setCurrency('All currencies') }}
              className="text-xs text-[#B197FC] hover:opacity-80"
            >
              Clear filters
            </button>
          </div>
        </div>

        {/* Toast message */}
        {message && (
          <div className={`text-sm px-4 py-3 rounded-xl mb-6 ${message.includes('wrong') || message.includes('cannot') || message.includes('already') ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        {/* Task list */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e8d9ff] p-12 text-center">
            <img src="/Logo.png" alt="mascot" className="w-18 h-30 mx-auto mb-4 opacity-50" />
            <p className="text-gray-400">No tasks found. Try adjusting your filters.</p>
            <button
              onClick={() => { setStatus('all'); setLocationSearch(''); setMinPrice(''); setMaxPrice(''); setSortBy('newest'); setCurrency('all') }}
              className="text-[#B197FC] text-sm font-medium mt-2 inline-block hover:opacity-80"
            >
              Clear filters →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(r => (
              <div key={r.id} className="bg-white rounded-2xl border border-[#e8d9ff] p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor(r.status)}`}>
                        {r.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-400">
                        {r.paymentMethod === 'cash' ? '💵' : r.paymentMethod === 'online' ? '💳' : r.paymentMethod === 'either' ? '🤝' : '💵'} {r.paymentMethod}
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-1">{r.title}</h3>
                    <p className="text-gray-500 text-sm mb-3">{r.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>📍 {r.location}</span>
                      <Link to={`/profile/${r.user?.id}`} className="hover:text-[#B197FC] transition-colors">👤 {r.user?.name}</Link>
                      <span>🕐 {new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className="text-2xl font-medium text-[#6b46c1]">{getCurrencySymbol(r.currency)}{r.price}</span>
                    {r.status === 'open' && (
                      <button
                        onClick={() => !volunteeredIds.includes(r.id) && handleVolunteer(r.id)}
                        disabled={volunteering === r.id || volunteeredIds.includes(r.id)}
                        className={`text-sm px-5 py-2 rounded-full transition-all ${
                          volunteeredIds.includes(r.id)
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-[#B197FC] text-white hover:opacity-90'}
                          disabled:opacity-60
                        }`}
                      >
                        {volunteeredIds.includes(r.id) ? '✓ Offer sent' : volunteering === r.id ? 'Sending...' : 'Help out'}
                      </button>
                    )}
                    {r.status !== 'open' && (
                      <span className="text-xs text-gray-400">No longer available</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}