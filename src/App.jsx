import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import CustomerCard from './components/CustomerCard'
import './App.css'

export default function App() {
  const [customers, setCustomers] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase
      .from('dim_customer')
      .select('user_id, full_name, city, package')
      .order('full_name')
      .then(({ data }) => setCustomers(data || []))
  }, [])

  async function handleSelect(e) {
    const userId = e.target.value
    if (!userId) return
    setLoading(true)
    setProfile(null)
    const { data } = await supabase
      .from('vw_customer_360')
      .select('*')
      .eq('user_id', userId)
      .single()
    setProfile(data)
    setLoading(false)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🧑‍💼 Customer 360</h1>
        <p>Hệ thống phân tích hành vi khách hàng</p>
      </header>

      <div className="search-box">
        <select onChange={handleSelect} defaultValue="">
          <option value="" disabled>-- Chọn khách hàng --</option>
          {customers.map(c => (
            <option key={c.user_id} value={c.user_id}>
              {c.full_name} — {c.city} ({c.package})
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="loading">Đang tải dữ liệu...</p>}
      {profile && <CustomerCard data={profile} />}
    </div>
  )
}
