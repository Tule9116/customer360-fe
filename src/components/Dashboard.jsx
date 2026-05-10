import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList,
} from 'recharts'

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899']

const GRID_STROKE = 'rgba(148,163,184,0.07)'
const TICK_STYLE  = { fill: '#64748b', fontSize: 11 }

const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#1e293b',
    border: '1px solid rgba(148,163,184,0.15)',
    borderRadius: '10px',
    color: '#f1f5f9',
    fontSize: 12,
    boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
  },
  itemStyle: { color: '#94a3b8' },
  labelStyle: { color: '#f1f5f9', fontWeight: 600 },
  cursor: { fill: 'rgba(59,130,246,0.05)' },
}

const RADIAN = Math.PI / 180
const InnerLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const r = innerRadius + (outerRadius - innerRadius) * 0.55
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return percent > 0.06 ? (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null
}

const LEGEND_STYLE = { color: '#94a3b8', fontSize: 12 }

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

  if (loading) return (
    <div className="loading">
      <div>Đang tải dữ liệu...</div>
      <div className="loading-dot"><span/><span/><span/></div>
    </div>
  )

  const totalCustomers = customers.length
  const activeCount    = customers.filter(c => c.is_active).length
  const activeRate     = Math.round((activeCount / totalCustomers) * 100)

  const packageCount = customers.reduce((acc, c) => { acc[c.package] = (acc[c.package] || 0) + 1; return acc }, {})
  const packageData  = Object.entries(packageCount).map(([name, value]) => ({ name, value }))

  const cityCount = customers.reduce((acc, c) => { acc[c.city] = (acc[c.city] || 0) + 1; return acc }, {})
  const cityData  = Object.entries(cityCount).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)

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
          <div className="kpi-glow" />
          <div className="kpi-icon">👥</div>
          <div className="kpi-value">{totalCustomers}</div>
          <div className="kpi-label">Tổng khách hàng</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-glow" />
          <div className="kpi-icon">✅</div>
          <div className="kpi-value" style={{ color: '#34d399' }}>{activeCount}</div>
          <div className="kpi-label">Đang hoạt động</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-glow" />
          <div className="kpi-icon">📊</div>
          <div className="kpi-value" style={{ color: '#60a5fa' }}>{activeRate}%</div>
          <div className="kpi-label">Tỷ lệ active</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-glow" />
          <div className="kpi-icon">🎬</div>
          <div className="kpi-value">{totals ? Number(totals.total_records).toLocaleString() : '—'}</div>
          <div className="kpi-label">Bản ghi nội dung</div>
        </div>
      </div>

      {/* Row 1 */}
      <div className="chart-row">
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-dot" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }} />
            <h3>Phân bổ gói cước</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={packageData} dataKey="value" nameKey="name"
                cx="50%" cy="50%" outerRadius={85} label={InnerLabel} labelLine={false}>
                {packageData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend verticalAlign="bottom" height={30} formatter={(v) => <span style={LEGEND_STYLE}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-dot" style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }} />
            <h3>Khách hàng theo thành phố</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={cityData} margin={{ top: 5, right: 10, left: -10, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
              <XAxis dataKey="name" tick={{ ...TICK_STYLE, fontSize: 10 }} angle={-35} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={TICK_STYLE} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2 */}
      <div className="chart-row">
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-dot" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }} />
            <h3>Tổng thời gian xem theo thể loại (nghìn giờ)</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={contentData} margin={{ top: 20, right: 10, left: 10, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
              <XAxis dataKey="name" tick={{ ...TICK_STYLE, fontSize: 10 }} interval={0} angle={-15} textAnchor="end" axisLine={false} tickLine={false} />
              <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(v) => `${v.toLocaleString()}k giờ`} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {contentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                <LabelList dataKey="value" position="top" style={{ fontSize: 10, fill: '#94a3b8' }} formatter={(v) => `${v}k`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-dot" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }} />
            <h3>Top nội dung xem nhiều nhất</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={mostWatch} layout="vertical" margin={{ top: 5, right: 20, left: 70, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
              <XAxis type="number" tick={TICK_STYLE} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={TICK_STYLE} width={70} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="value" fill="#8b5cf6" radius={[0, 6, 6, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3 */}
      <div className="chart-row-3">
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-dot" style={{ background: '#06b6d4' }} />
            <h3>Sở thích theo thể loại</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={taste} layout="vertical" margin={{ top: 5, right: 20, left: 75, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
              <XAxis type="number" tick={TICK_STYLE} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={TICK_STYLE} width={75} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={22}>
                {taste.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-dot" style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }} />
            <h3>Mức độ hoạt động</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={activeLevel} dataKey="value" nameKey="name"
                cx="50%" cy="50%" outerRadius={85} label={InnerLabel} labelLine={false}>
                <Cell fill="#10b981" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend verticalAlign="bottom" height={30} formatter={(v) => <span style={LEGEND_STYLE}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-dot" style={{ background: 'linear-gradient(135deg, #f59e0b, #8b5cf6)' }} />
            <h3>Xu hướng tìm kiếm T6 → T7</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={searchType} dataKey="value" nameKey="name"
                cx="50%" cy="50%" outerRadius={85} label={InnerLabel} labelLine={false}>
                {searchType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend verticalAlign="bottom" height={30} formatter={(v) => <span style={LEGEND_STYLE}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  )
}
