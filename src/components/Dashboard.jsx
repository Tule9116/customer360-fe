import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'

const COLORS = ['#4f86c6', '#e07b54', '#5cb85c', '#f0ad4e', '#9b59b6', '#e74c3c', '#1abc9c']

export default function Dashboard() {
  const [customers, setCustomers] = useState([])
  const [content, setContent]     = useState([])
  const [search, setSearch]       = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: c }, { data: cb }, { data: sb }] = await Promise.all([
        supabase.from('dim_customer').select('*'),
        supabase.from('fact_content_behavior').select('*'),
        supabase.from('fact_search_behavior').select('*'),
      ])
      setCustomers(c || [])
      setContent(cb || [])
      setSearch(sb || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <p className="loading">Đang tải dữ liệu...</p>

  // --- KPI ---
  const totalCustomers = customers.length
  const activeCount    = customers.filter(c => c.is_active).length
  const activeRate     = Math.round((activeCount / totalCustomers) * 100)

  // --- Package pie chart ---
  const packageCount = customers.reduce((acc, c) => {
    acc[c.package] = (acc[c.package] || 0) + 1
    return acc
  }, {})
  const packageData = Object.entries(packageCount).map(([name, value]) => ({ name, value }))

  // --- City bar chart ---
  const cityCount = customers.reduce((acc, c) => {
    acc[c.city] = (acc[c.city] || 0) + 1
    return acc
  }, {})
  const cityData = Object.entries(cityCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  // --- Content behavior: tổng theo loại ---
  const contentTotals = {
    'Truyền Hình':  content.reduce((s, r) => s + (r.total_truyen_hinh || 0), 0),
    'Phim Truyện':  content.reduce((s, r) => s + (r.total_phim_truyen || 0), 0),
    'Thể Thao':     content.reduce((s, r) => s + (r.total_the_thao || 0), 0),
    'Thiếu Nhi':    content.reduce((s, r) => s + (r.total_thieu_nhi || 0), 0),
    'Giải Trí':     content.reduce((s, r) => s + (r.total_giai_tri || 0), 0),
  }
  const contentData = Object.entries(contentTotals)
    .map(([name, value]) => ({ name, value: Math.round(value / 3600) })) // convert s → giờ
    .sort((a, b) => b.value - a.value)

  // --- Search type pie ---
  const searchTypeCount = search.reduce((acc, s) => {
    const t = s.type || 'Unknown'
    acc[t] = (acc[t] || 0) + 1
    return acc
  }, {})
  const searchTypeData = Object.entries(searchTypeCount).map(([name, value]) => ({ name, value }))

  return (
    <div className="dashboard">
      {/* KPI Cards */}
      <div className="kpi-row">
        <div className="kpi-card">
          <div className="kpi-value">{totalCustomers}</div>
          <div className="kpi-label">Tổng khách hàng</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value" style={{ color: '#2d7a4f' }}>{activeCount}</div>
          <div className="kpi-label">Đang hoạt động</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value" style={{ color: '#4f86c6' }}>{activeRate}%</div>
          <div className="kpi-label">Tỷ lệ active</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{content.length}</div>
          <div className="kpi-label">Bản ghi nội dung</div>
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="chart-row">
        <div className="chart-card">
          <h3>Phân bổ gói cước</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={packageData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {packageData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Khách hàng theo thành phố</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cityData} margin={{ top: 5, right: 10, left: -10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#4f86c6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="chart-row">
        <div className="chart-card">
          <h3>Tổng thời gian xem theo thể loại (giờ)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={contentData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `${v.toLocaleString()} giờ`} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {contentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Xu hướng tìm kiếm T6 → T7</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={searchTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {searchTypeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
