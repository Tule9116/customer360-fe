import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList,
} from 'recharts'

const COLORS = ['#4f86c6', '#e07b54', '#5cb85c', '#f0ad4e', '#9b59b6', '#e74c3c', '#1abc9c']

const RADIAN = Math.PI / 180
const InnerLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const r = innerRadius + (outerRadius - innerRadius) * 0.55
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return percent > 0.06 ? (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null
}

export default function Dashboard() {
  const [customers, setCustomers]     = useState([])
  const [totals, setTotals]           = useState(null)
  const [mostWatch, setMostWatch]     = useState([])
  const [taste, setTaste]             = useState([])
  const [activeLevel, setActiveLevel] = useState([])
  const [searchType, setSearchType]   = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    async function load() {
      const [
        { data: c },
        { data: tot },
        { data: mw },
        { data: ta },
        { data: al },
        { data: st },
      ] = await Promise.all([
        supabase.from('dim_customer').select('*'),
        supabase.from('vw_content_totals').select('*').single(),
        supabase.from('vw_most_watch').select('*'),
        supabase.from('vw_taste').select('*'),
        supabase.from('vw_active_level').select('*'),
        supabase.from('vw_search_type').select('*'),
      ])
      setCustomers(c || [])
      setTotals(tot)
      setMostWatch(mw || [])
      setTaste(ta || [])
      setActiveLevel(al || [])
      setSearchType(st || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <p className="loading">Đang tải dữ liệu...</p>

  // KPI
  const totalCustomers = customers.length
  const activeCount    = customers.filter(c => c.is_active).length
  const activeRate     = Math.round((activeCount / totalCustomers) * 100)

  // Package & city từ dim_customer (20 rows — nhỏ, không cần view)
  const packageCount = customers.reduce((acc, c) => { acc[c.package] = (acc[c.package] || 0) + 1; return acc }, {})
  const packageData  = Object.entries(packageCount).map(([name, value]) => ({ name, value }))

  const cityCount = customers.reduce((acc, c) => { acc[c.city] = (acc[c.city] || 0) + 1; return acc }, {})
  const cityData  = Object.entries(cityCount).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)

  // Content totals từ vw_content_totals
  const contentData = totals ? [
    { name: 'Truyền Hình', value: Number(totals.truyen_hinh_k) },
    { name: 'Phim Truyện', value: Number(totals.phim_truyen_k) },
    { name: 'Thể Thao',    value: Number(totals.the_thao_k) },
    { name: 'Thiếu Nhi',   value: Number(totals.thieu_nhi_k) },
    { name: 'Giải Trí',    value: Number(totals.giai_tri_k) },
  ].sort((a, b) => b.value - a.value) : []

  return (
    <div className="dashboard">

      {/* KPI */}
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
          <div className="kpi-value">{totals ? Number(totals.total_records).toLocaleString() : '—'}</div>
          <div className="kpi-label">Bản ghi nội dung</div>
        </div>
      </div>

      {/* Row 1 */}
      <div className="chart-row">
        <div className="chart-card">
          <h3>Phân bổ gói cước</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={packageData} dataKey="value" nameKey="name"
                cx="50%" cy="50%" outerRadius={85} label={InnerLabel} labelLine={false}>
                {packageData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={30} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Khách hàng theo thành phố</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={cityData} margin={{ top: 5, right: 10, left: -10, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#4f86c6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2 */}
      <div className="chart-row">
        <div className="chart-card">
          <h3>Tổng thời gian xem theo thể loại (nghìn giờ)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={contentData} margin={{ top: 20, right: 10, left: 10, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `${v.toLocaleString()}k giờ`} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {contentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                <LabelList dataKey="value" position="top" style={{ fontSize: 10, fill: '#555' }} formatter={(v) => `${v}k`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Top nội dung xem nhiều nhất</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={mostWatch} layout="vertical" margin={{ top: 5, right: 20, left: 70, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={70} />
              <Tooltip />
              <Bar dataKey="value" fill="#e07b54" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3 */}
      <div className="chart-row-3">
        <div className="chart-card">
          <h3>Sở thích theo thể loại</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={taste} layout="vertical" margin={{ top: 5, right: 20, left: 75, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={75} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {taste.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Mức độ hoạt động</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={activeLevel} dataKey="value" nameKey="name"
                cx="50%" cy="50%" outerRadius={85} label={InnerLabel} labelLine={false}>
                <Cell fill="#2d7a4f" />
                <Cell fill="#e07b54" />
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={30} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Xu hướng tìm kiếm T6 → T7</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={searchType} dataKey="value" nameKey="name"
                cx="50%" cy="50%" outerRadius={85} label={InnerLabel} labelLine={false}>
                {searchType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={30} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  )
}
