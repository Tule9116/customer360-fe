import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList,
} from 'recharts'

const COLORS = ['#4f86c6', '#e07b54', '#5cb85c', '#f0ad4e', '#9b59b6', '#e74c3c', '#1abc9c']

const PAGE_SIZE = 1000

async function fetchAll(table, columns) {
  let rows = [], from = 0
  while (true) {
    const { data } = await supabase.from(table).select(columns).range(from, from + PAGE_SIZE - 1)
    if (!data || data.length === 0) break
    rows = rows.concat(data)
    if (data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }
  return rows
}

function countBy(arr, key, topN = null) {
  const acc = arr.reduce((a, r) => {
    const k = r[key] || 'Khác'
    a[k] = (a[k] || 0) + 1
    return a
  }, {})
  let result = Object.entries(acc).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  if (topN && result.length > topN) {
    const top = result.slice(0, topN)
    const otherSum = result.slice(topN).reduce((s, r) => s + r.value, 0)
    top.push({ name: 'Khác', value: otherSum })
    return top
  }
  return result
}

const LABEL_PIE = ({ name, percent }) => percent > 0.04 ? `${(percent * 100).toFixed(0)}%` : ''

export default function Dashboard() {
  const [customers, setCustomers] = useState([])
  const [content, setContent]     = useState([])
  const [search, setSearch]       = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    async function load() {
      const [c, cb, sb] = await Promise.all([
        fetchAll('dim_customer', '*'),
        fetchAll('fact_content_behavior', 'total_truyen_hinh,total_phim_truyen,total_the_thao,total_thieu_nhi,total_giai_tri,most_watch,taste,active'),
        fetchAll('fact_search_behavior', 'type'),
      ])
      setCustomers(c)
      setContent(cb)
      setSearch(sb)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <p className="loading">Đang tải dữ liệu...</p>

  const totalCustomers = customers.length
  const activeCount    = customers.filter(c => c.is_active).length
  const activeRate     = Math.round((activeCount / totalCustomers) * 100)

  const packageData = countBy(customers, 'package')
  const cityData    = countBy(customers, 'city')

  const contentTotals = {
    'Truyền Hình': content.reduce((s, r) => s + (r.total_truyen_hinh || 0), 0),
    'Phim Truyện': content.reduce((s, r) => s + (r.total_phim_truyen || 0), 0),
    'Thể Thao':    content.reduce((s, r) => s + (r.total_the_thao || 0), 0),
    'Thiếu Nhi':   content.reduce((s, r) => s + (r.total_thieu_nhi || 0), 0),
    'Giải Trí':    content.reduce((s, r) => s + (r.total_giai_tri || 0), 0),
  }
  const contentData = Object.entries(contentTotals)
    .map(([name, value]) => ({ name, value: Math.round(value / 3600) }))
    .sort((a, b) => b.value - a.value)

  // most_watch: top 6
  const mostWatchData = countBy(content, 'most_watch', 6)

  // taste: tách theo "-", đếm từng category đơn
  const tasteCount = {}
  content.forEach(r => {
    if (!r.taste) return
    r.taste.split('-').forEach(cat => {
      const k = cat.trim()
      if (k) tasteCount[k] = (tasteCount[k] || 0) + 1
    })
  })
  const tasteData = Object.entries(tasteCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  const activeLevelData = countBy(content, 'active')
  const searchTypeData  = countBy(search, 'type')

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
          <div className="kpi-value">{content.length.toLocaleString()}</div>
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
                cx="50%" cy="45%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                labelLine={true}>
                {packageData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
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
            <BarChart data={contentData.map(d => ({ ...d, value: Math.round(d.value / 1000) }))} margin={{ top: 20, right: 10, left: 10, bottom: 30 }}>
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
            <BarChart data={mostWatchData} layout="vertical" margin={{ top: 5, right: 20, left: 70, bottom: 5 }}>
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
            <BarChart data={tasteData} layout="vertical" margin={{ top: 5, right: 20, left: 75, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={75} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {tasteData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Mức độ hoạt động</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={activeLevelData} dataKey="value" nameKey="name"
                cx="50%" cy="45%" outerRadius={80} label={LABEL_PIE}>
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
              <Pie data={searchTypeData} dataKey="value" nameKey="name"
                cx="50%" cy="45%" outerRadius={80} label={LABEL_PIE}>
                {searchTypeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
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
